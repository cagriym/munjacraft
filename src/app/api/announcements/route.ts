import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: /api/announcements
export async function GET() {
  const announcements = await prisma.announcement.findMany({
    include: { author: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ announcements });
}

// POST: /api/announcements
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { title, content } = await req.json();
  if (!title || !content) {
    return NextResponse.json(
      { error: "Başlık ve içerik zorunlu" },
      { status: 400 }
    );
  }
  const announcement = await prisma.announcement.create({
    data: {
      title,
      content,
      authorId: Number(session.user.id),
    },
  });
  return NextResponse.json({ success: true, announcement });
}

// DELETE: /api/announcements
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID zorunlu" }, { status: 400 });
  await prisma.announcement.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
