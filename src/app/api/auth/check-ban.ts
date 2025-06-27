import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ banned: false });
  const user = await prisma.user.findUnique({ where: { email } });
  if (user && user.isBanned) {
    return NextResponse.json({
      banned: true,
      reason: user.banReason || "-",
      type: user.banType || "-",
      until: user.banUntil ? new Date(user.banUntil).toISOString() : "-",
    });
  }
  return NextResponse.json({ banned: false });
}
