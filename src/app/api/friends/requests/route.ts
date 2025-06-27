import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET: /api/friends/requests - kullanıcının arkadaşlık istekleri (gelen ve giden)
export async function GET(req: Request) {
  const session = await getServerSession(nextAuthConfig);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const userId = Number(session.user.id);
  // Gelen istekler (benim addressee olduğum ve pending olanlar)
  const incoming = await prisma.friend.findMany({
    where: { addresseeId: userId, status: "PENDING" },
    include: { requester: true },
  });
  // Giden istekler (benim requester olduğum ve pending olanlar)
  const outgoing = await prisma.friend.findMany({
    where: { requesterId: userId, status: "PENDING" },
    include: { addressee: true },
  });
  return NextResponse.json({ incoming, outgoing });
}
