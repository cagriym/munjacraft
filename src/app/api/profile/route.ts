import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { nextAuthConfig } from "@/auth"; // auth.ts'deki config'i import ediyoruz
import { prisma } from "@/lib/prisma"; // Tekil istemciyi import et

// const prisma = new PrismaClient(); // Bu satırı kaldırıyoruz

export async function GET(req: Request) {
  const session = await getServerSession(nextAuthConfig);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    const userAny = user as any;

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    function isAddressVerified(user: any) {
      return !!(user.address && user.address.trim().length > 0);
    }

    return NextResponse.json({
      user: {
        ...userAny,
        balance:
          userAny.balance &&
          typeof userAny.balance === "object" &&
          "toNumber" in userAny.balance
            ? userAny.balance.toNumber()
            : userAny.balance,
        isAddressVerified: isAddressVerified(userAny),
        roleAssignedAt: userAny.roleAssignedAt ?? null,
      },
    });
  } catch (error) {
    console.error("API GET /api/profile error:", error);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(nextAuthConfig);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const data = await req.json();

    if (data.birthdate) {
      data.birthdate = new Date(data.birthdate);
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        fullname: data.fullname,
        birthdate: data.birthdate,
        phone: data.phone,
        country: data.country,
        city: data.city,
        district: data.district,
        address: data.address,
        isAddressVerified: !!(data.address && data.address.trim().length > 0),
      },
    });

    const { password, ...userWithoutPassword } = user;
    return NextResponse.json({
      user: {
        ...userWithoutPassword,
        balance: user.balance.toNumber(),
        roleAssignedAt: user.roleAssignedAt,
      },
    });
  } catch (error) {
    console.error("API PUT /api/profile error:", error);
    return NextResponse.json(
      { error: "Güncelleme sırasında bir sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
