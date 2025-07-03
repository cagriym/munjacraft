import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: /api/messages/conversations
export async function GET(req: Request) {
  try {
    const session = await getServerSession(nextAuthConfig);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const myId = Number(session.user.id);
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: myId }, { receiverId: myId }],
      },
      orderBy: { sentAt: "desc" },
    });
    if (!messages.length) {
      return NextResponse.json({ conversations: [] });
    }
    const userIds: number[] = [];
    messages.forEach((msg) => {
      const otherId = msg.senderId === myId ? msg.receiverId : msg.senderId;
      if (!userIds.includes(otherId)) userIds.push(otherId);
    });
    if (!userIds.length) {
      return NextResponse.json({ conversations: [] });
    }
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        fullname: true,
        nickname: true,
        email: true,
        role: true,
        avatar: true,
      },
    });
    if (!users.length) {
      return NextResponse.json({ conversations: [] });
    }
    const conversations = userIds
      .map((id) => {
        const user = users.find((u) => u.id === id);
        if (!user) return null;
        const lastMessage = messages.find(
          (m) =>
            (m.senderId === myId && m.receiverId === id) ||
            (m.senderId === id && m.receiverId === myId)
        );
        const unreadCount = messages.filter(
          (m) => m.senderId === id && m.receiverId === myId && m.seen === false
        ).length;
        return {
          ...user,
          lastMessage,
          unreadCount,
        };
      })
      .filter(Boolean);
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Mesajlarım (conversations) API hatası:", error);
    return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
  }
}
