import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: /api/messages?with=USER_ID
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
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
  });
  return NextResponse.json({ messages });
}

// POST: /api/messages
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { receiverId, content } = await req.json();
  if (!receiverId || !content) {
    return NextResponse.json(
      { error: "Alıcı ve mesaj zorunlu" },
      { status: 400 }
    );
  }
  const message = await prisma.message.create({
    data: {
      senderId: Number(session.user.id),
      receiverId: Number(receiverId),
      content,
    },
  });
  return NextResponse.json({ success: true, message });
}
