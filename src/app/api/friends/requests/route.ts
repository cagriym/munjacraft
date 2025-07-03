import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET: /api/friends/requests - kullanıcının arkadaşlık istekleri (gelen ve giden)
export async function GET(req: Request) {
  const session = await getServerSession(nextAuthConfig);
  console.log("FRIEND REQUESTS API SESSION:", session);
  if (!session || !session.user?.id) {
    return NextResponse.json(
      { error: "Yetkisiz", debug: { session } },
      { status: 401 }
    );
  }
  const userId = Number(session.user.id);
  // Ban kontrolü
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const now = new Date();
  // Sadece aktif banlı kullanıcıyı engelle
  const aktifBan =
    user?.isBanned && (!user.banUntil || new Date(user.banUntil) > now);
  if (aktifBan) {
    return NextResponse.json(
      {
        error: "Banlı olduğunuz için arkadaş isteklerini görüntüleyemezsiniz.",
      },
      { status: 403 }
    );
  }
  // Admin ile ilgili istekler otomatik kabul edilmiş gibi gösterilsin
  const isAdmin = user?.role === "ADMIN";
  let incoming = await prisma.friend.findMany({
    where: { addresseeId: userId, status: "PENDING" },
    include: { requester: true },
  });
  let outgoing = await prisma.friend.findMany({
    where: { requesterId: userId, status: "PENDING" },
    include: { addressee: true },
  });
  if (isAdmin) {
    incoming = incoming.map((req) => ({ ...req, status: "ACCEPTED" }));
    outgoing = outgoing.map((req) => ({ ...req, status: "ACCEPTED" }));
  }
  return NextResponse.json({ incoming, outgoing });
}
