import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: /api/messages?with=USER_ID
export async function GET(req: Request) {
  const session = await getServerSession(nextAuthConfig);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const withId = searchParams.get("with");
  if (!withId)
    return NextResponse.json(
      { error: "Kullanıcı ID gerekli" },
      { status: 400 }
    );
  const myId = Number(session.user.id);
  const otherId = Number(withId);
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: myId, receiverId: otherId },
        { senderId: otherId, receiverId: myId },
      ],
    },
    orderBy: { sentAt: "asc" },
    include: {
      sender: {
        select: { id: true, avatar: true, nickname: true, fullname: true },
      },
      receiver: {
        select: { id: true, avatar: true, nickname: true, fullname: true },
      },
    },
  });
  // Mesajları frontend için düzleştir
  const messagesWithUsers = messages.map((msg) => ({
    ...msg,
    senderAvatar: msg.sender?.avatar || null,
    senderNickname: msg.sender?.nickname || null,
    senderFullname: msg.sender?.fullname || null,
    receiverAvatar: msg.receiver?.avatar || null,
    receiverNickname: msg.receiver?.nickname || null,
    receiverFullname: msg.receiver?.fullname || null,
  }));
  return NextResponse.json({ messages: messagesWithUsers });
}

// POST: /api/messages
export async function POST(req: Request) {
  const session = await getServerSession(nextAuthConfig);
  console.log("MESSAGES API SESSION:", session);
  if (!session || !session.user?.id) {
    return NextResponse.json(
      { error: "Yetkisiz", debug: { session } },
      { status: 401 }
    );
  }
  const { receiverId, content } = await req.json();
  if (!receiverId) {
    return NextResponse.json(
      { error: "Alıcı (receiverId) zorunlu.", field: "receiverId" },
      { status: 400 }
    );
  }
  if (!content || !content.trim()) {
    return NextResponse.json(
      { error: "Mesaj içeriği (content) zorunlu.", field: "content" },
      { status: 400 }
    );
  }
  if (Number(receiverId) === Number(session.user.id)) {
    return NextResponse.json(
      { error: "Kendinize mesaj gönderemezsiniz." },
      { status: 400 }
    );
  }
  // Arkadaşlık kontrolü
  const myId = Number(session.user.id);
  const friend = await prisma.friend.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: myId, addresseeId: Number(receiverId) },
        { requesterId: Number(receiverId), addresseeId: myId },
      ],
    },
  });
  if (!friend) {
    return NextResponse.json(
      { error: "Sadece arkadaşlarınıza mesaj gönderebilirsiniz." },
      { status: 403 }
    );
  }
  const message = await prisma.message.create({
    data: {
      senderId: myId,
      receiverId: Number(receiverId),
      content,
      status: "sent",
      delivered: false,
      seen: false,
    },
  });
  return NextResponse.json({ success: true, message });
}

// PATCH: /api/messages - mesajı delivered/seen olarak işaretle
export async function PATCH(req: Request) {
  const session = await getServerSession(nextAuthConfig);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    const { messageId, delivered, seen, userId } = await req.json();
    console.log("PATCH BODY", { messageId, delivered, seen, userId });
    if (!messageId) {
      return NextResponse.json({ error: "Mesaj ID gerekli" }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json(
        { error: "Kullanıcı ID gerekli" },
        { status: 400 }
      );
    }
    const id = typeof messageId === "string" ? Number(messageId) : messageId;
    const updateData: any = {};
    if (delivered !== undefined) updateData.delivered = delivered;
    if (seen !== undefined) updateData.seen = seen;

    const updated = await prisma.message.update({
      where: { id },
      data: updateData,
    });
    console.log("PATCH UPDATED", updated);
    return NextResponse.json({ success: true, message: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE: /api/messages - mesajı sil
export async function DELETE(req: Request) {
  const session = await getServerSession(nextAuthConfig);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    const { messageId, userId } = await req.json();
    if (!messageId) {
      return NextResponse.json({ error: "Mesaj ID gerekli" }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json(
        { error: "Kullanıcı ID gerekli" },
        { status: 400 }
      );
    }
    const id = typeof messageId === "string" ? Number(messageId) : messageId;
    const deleted = await prisma.message.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: deleted });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
