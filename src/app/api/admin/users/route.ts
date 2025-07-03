import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/auth";
import { PrismaClient } from "@prisma/client";
import stringSimilarity from "string-similarity";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const session = await getServerSession(nextAuthConfig);
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase() || "";
  const userId = Number(session?.user?.id);
  // Ban kontrolü
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const now = new Date();
    // Sadece aktif banlı kullanıcıyı engelle
    const aktifBan =
      user?.isBanned && (!user.banUntil || new Date(user.banUntil) > now);
    if (aktifBan) {
      return NextResponse.json(
        { error: "Banlı olduğunuz için kullanıcı arayamazsınız." },
        { status: 403 }
      );
    }
  }
  const users = await prisma.user.findMany({
    select: {
      id: true,
      fullname: true,
      nickname: true,
      email: true,
      role: true,
      isBanned: true,
      banReason: true,
      banType: true,
      banUntil: true,
      bannedIp: true,
      isAddressVerified: true,
    },
    orderBy: { id: "asc" },
  });
  let filtered = users;
  if (q) {
    filtered = users.filter((u) => {
      const nick = u.nickname?.toLowerCase() || "";
      const mail = u.email?.toLowerCase() || "";
      // Fuzzy benzerlik oranı %0.5 üzerindeyse veya includes ise eşleşme kabul
      return (
        stringSimilarity.compareTwoStrings(nick, q) > 0.5 ||
        stringSimilarity.compareTwoStrings(mail, q) > 0.5 ||
        nick.includes(q) ||
        mail.includes(q)
      );
    });
  }
  return NextResponse.json({ users: filtered });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(nextAuthConfig);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
  // Admin kendi hesabını silemez
  if (String(session.user.id) === String(id)) {
    return NextResponse.json(
      { error: "Kendi hesabınızı silemezsiniz" },
      { status: 403 }
    );
  }
  await prisma.user.delete({ where: { id: id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(nextAuthConfig);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const body = await req.json();
  const {
    id,
    role,
    action,
    banReason,
    banType,
    banUntil,
    bannedIp,
    fullname,
    nickname,
    email,
  } = body;
  if (!id) return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
  // Admin kendi rolünü değiştiremez
  if (role && String(session.user.id) === String(id)) {
    return NextResponse.json(
      { error: "Kendi rolünüzü değiştiremezsiniz" },
      { status: 403 }
    );
  }

  // Ban/Unban işlemleri
  if (action === "ban") {
    const updated = await prisma.user.update({
      where: { id },
      data: {
        isBanned: true,
        banReason: banReason || null,
        banType: banType || null,
        banUntil: banUntil ? new Date(banUntil) : null,
        bannedIp: bannedIp || null,
      },
    });
    return NextResponse.json({ success: true, user: updated });
  }
  if (action === "unban") {
    const updated = await prisma.user.update({
      where: { id },
      data: {
        isBanned: false,
        banReason: null,
        banType: null,
        banUntil: null,
        bannedIp: null,
      },
    });
    return NextResponse.json({ success: true, user: updated });
  }
  // Genel güncelleme (fullname, nickname, email vs.)
  if (action === "update") {
    await prisma.user.update({
      where: { id },
      data: {
        fullname,
        nickname,
        email,
      },
    });
    return NextResponse.json({ success: true });
  }
  // Sadece rol değişikliği
  if (role) {
    await prisma.user.update({ where: { id }, data: { role } });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
}
