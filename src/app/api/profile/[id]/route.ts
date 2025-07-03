import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = Number(id);
  if (!userId) {
    return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nickname: true,
      fullname: true,
      avatar: true,
      bio: true,
      role: true,
      rank: true,
      isBanned: true,
      banReason: true,
      banUntil: true,
      createdAt: true,
      // lastSeen: true, // eğer eklenirse
    },
  });
  if (!user) {
    return NextResponse.json(
      { error: "Kullanıcı bulunamadı" },
      { status: 404 }
    );
  }
  return NextResponse.json({ user });
}
