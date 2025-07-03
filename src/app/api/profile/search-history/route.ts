import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { nextAuthConfig } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(nextAuthConfig);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const history = await prisma.searchHistory.findMany({
    where: { userId: Number(session.user.id) },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  return NextResponse.json({ history });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(nextAuthConfig);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { query } = await req.json();
  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "Geçersiz arama" }, { status: 400 });
  }
  const record = await prisma.searchHistory.create({
    data: {
      userId: Number(session.user.id),
      query,
    },
  });
  return NextResponse.json({ success: true, record });
}
