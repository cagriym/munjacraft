import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Prisma, Role, Rank } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { nextAuthConfig } from "@/auth";

function toRankEnum(rankName: string): Rank {
  if (Object.values(Rank).includes(rankName as Rank)) {
    return rankName as Rank;
  }
  throw new Error(`Invalid rank name: ${rankName}`);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(nextAuthConfig);

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const { rankName, price, targetNickname } = await req.json();

    if (!rankName || typeof price !== "number" || !targetNickname) {
      return NextResponse.json(
        {
          message: "Geçersiz istek: Rütbe adı, fiyat ve hedef nick gereklidir.",
        },
        { status: 400 }
      );
    }

    const newRank = toRankEnum(rankName);

    // Gönderen kullanıcıyı bul
    const sender = await prisma.user.findUnique({
      where: { id: Number(session.user.id) },
    });

    if (!sender) {
      return NextResponse.json(
        { message: "Gönderen kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    if (sender.balance.toNumber() < price) {
      return NextResponse.json(
        { message: "Yetersiz bakiye." },
        { status: 400 }
      );
    }

    // Hediye gönderilecek kullanıcıyı bul
    const receiver = await prisma.user.findUnique({
      where: { nickname: targetNickname },
    });

    if (!receiver) {
      return NextResponse.json(
        { message: "Hediye gönderilecek kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    // Rütbe güncellemesi ve bakiyeden düşme işlemi
    await prisma.$transaction([
      prisma.user.update({
        where: { id: sender.id },
        data: { balance: { decrement: price } },
      }),
      prisma.user.update({
        where: { id: receiver.id },
        data: { rank: newRank, roleAssignedAt: new Date() },
      }),
    ]);

    return NextResponse.json({
      message: `Hediye başarıyla gönderildi. ${receiver.nickname} artık ${rankName} rütbesine sahip!`,
    });
  } catch (error) {
    console.error("Hediye gönderme hatası:", error);
    if (error instanceof Error && error.message.includes("Invalid rank name")) {
      return NextResponse.json(
        { message: "Geçersiz rütbe adı." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
