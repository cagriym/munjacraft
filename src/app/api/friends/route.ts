import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Friend, User } from "@prisma/client";

// GET: /api/friends - kullanıcının arkadaş listesini getir
export async function GET(req: Request) {
  const session = await getServerSession(nextAuthConfig);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const userId = Number(session.user.id);
  // Kabul edilmiş arkadaşlıklar (her iki taraf da olabilir)
  const friends = await prisma.friend.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    include: {
      requester: true,
      addressee: true,
    },
  });
  // Karşı tarafı bul
  const friendUsers = friends.map((f: any) =>
    f.requesterId === userId ? f.addressee : f.requester
  );
  return NextResponse.json({ friends: friendUsers });
}

// POST: /api/friends - arkadaşlık isteği gönder
export async function POST(req: Request) {
  const session = await getServerSession(nextAuthConfig);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const userId = Number(session.user.id);
  const { toUserId } = await req.json();
  if (!toUserId || userId === Number(toUserId)) {
    return NextResponse.json({ error: "Geçersiz kullanıcı" }, { status: 400 });
  }
  // Zaten arkadaş veya istek varsa tekrar ekleme
  const existing = await prisma.friend.findFirst({
    where: {
      OR: [
        { requesterId: userId, addresseeId: Number(toUserId) },
        { requesterId: Number(toUserId), addresseeId: userId },
      ],
    },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Zaten istek var veya arkadaşsınız" },
      { status: 400 }
    );
  }
  const friend = await prisma.friend.create({
    data: {
      requesterId: userId,
      addresseeId: Number(toUserId),
      status: "PENDING",
    },
  });
  return NextResponse.json({ success: true, friend });
}

// PATCH: /api/friends - istek kabul/ret
export async function PATCH(req: Request) {
  const session = await getServerSession(nextAuthConfig);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const userId = Number(session.user.id);
  const { friendId, action } = await req.json(); // action: "accept" | "reject"
  if (!friendId || !["accept", "reject"].includes(action)) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }
  const friend = await prisma.friend.findUnique({ where: { id: friendId } });
  if (!friend || friend.addresseeId !== userId) {
    return NextResponse.json(
      { error: "Yetkisiz veya istek bulunamadı" },
      { status: 403 }
    );
  }
  const updated = await prisma.friend.update({
    where: { id: friendId },
    data: { status: action === "accept" ? "ACCEPTED" : "REJECTED" },
  });
  return NextResponse.json({ success: true, friend: updated });
}

// DELETE: /api/friends - arkadaş sil
export async function DELETE(req: Request) {
  const session = await getServerSession(nextAuthConfig);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const userId = Number(session.user.id);
  const { friendId } = await req.json();
  const friend = await prisma.friend.findUnique({ where: { id: friendId } });
  if (
    !friend ||
    (friend.requesterId !== userId && friend.addresseeId !== userId)
  ) {
    return NextResponse.json(
      { error: "Yetkisiz veya arkadaşlık bulunamadı" },
      { status: 403 }
    );
  }
  await prisma.friend.delete({ where: { id: friendId } });
  return NextResponse.json({ success: true });
}
