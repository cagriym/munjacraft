import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { nextAuthConfig } from "@/auth"; // Auth.ts'den yapılandırmayı import et

// const prisma = new PrismaClient(); // Bu satırı kaldır

// String'i Role enum'una çeviren yardımcı fonksiyon
function toRoleEnum(roleName: string): Role {
  if (Object.values(Role).includes(roleName as Role)) {
    return roleName as Role;
  }
  throw new Error(`Invalid role name: ${roleName}`);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(nextAuthConfig);

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const { rankName, price } = await req.json();

    if (!rankName || typeof price !== "number") {
      return NextResponse.json(
        { message: "Geçersiz istek: Rütbe adı ve fiyatı gereklidir." },
        { status: 400 }
      );
    }

    const newRole = toRoleEnum(rankName);

    const user = await prisma.user.findUnique({
      where: { id: Number(session.user.id) },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    if (user.role === "ADMIN") {
      return NextResponse.json(
        { message: "Adminler rütbe satın alamaz." },
        { status: 403 }
      );
    }

    if (user.balance.toNumber() < price) {
      return NextResponse.json(
        { message: "Yetersiz bakiye." },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(session.user.id) },
      data: {
        balance: {
          decrement: price,
        },
        role: newRole,
        roleAssignedAt: new Date(),
      },
    });

    return NextResponse.json({
      id: updatedUser.id.toString(),
      role: updatedUser.role,
      balance: updatedUser.balance.toNumber(),
    });
  } catch (error) {
    console.error("Satın alma hatası:", error);
    if (error instanceof Error && error.message.includes("Invalid role name")) {
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
