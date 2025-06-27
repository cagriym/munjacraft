import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const session = await getServerSession(nextAuthConfig);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
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
  return NextResponse.json({ users });
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
