import { NextResponse, NextRequest } from "next/server";
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
    function isAddressVerified(user: any) {
      return !!(user.address && user.address.trim().length > 0);
    }
    return NextResponse.json({
      user: {
        ...userWithoutPassword,
        balance: user.balance.toNumber(),
        roleAssignedAt: user.roleAssignedAt,
        isAddressVerified: isAddressVerified(user),
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

// PATCH: /api/profile - lastSeen veya bakiye güncelle
export async function PATCH(req: Request) {
  const session = await getServerSession(nextAuthConfig);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!currentUser) {
    return NextResponse.json(
      { error: "Kullanıcı bulunamadı" },
      { status: 404 }
    );
  }

  try {
    const body = await req.json();

    // Bakiye güncelleme
    if (body.balance) {
      const amountToAdd = parseFloat(body.balance);
      if (isNaN(amountToAdd) || amountToAdd <= 0) {
        return NextResponse.json(
          { error: "Geçersiz bakiye tutarı" },
          { status: 400 }
        );
      }
      const currentBalance = currentUser.balance.toNumber();
      const newBalance = currentBalance + amountToAdd;

      await prisma.user.update({
        where: { email: session.user.email },
        data: { balance: newBalance },
      });
      return NextResponse.json({ success: true, newBalance });
    }

    // Last seen güncelleme
    if (body.lastSeen) {
      await prisma.user.update({
        where: { email: session.user.email },
        data: { lastSeen: new Date(body.lastSeen) },
      });
      return NextResponse.json({ success: true });
    }

    // Eğer body boş veya alakasızsa
    return NextResponse.json(
      { error: "Güncellenecek veri bulunamadı" },
      { status: 400 }
    );
  } catch (error) {
    console.error("API PATCH /api/profile error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// GET: /api/profile/[id] - public profil
// export async function GET_BY_ID(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   const userId = Number(params.id);
//   if (!userId) {
//     return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
//   }
//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//     select: {
//       id: true,
//       nickname: true,
//       fullname: true,
//       avatar: true,
//       bio: true,
//       role: true,
//       rank: true,
//       isBanned: true,
//       banReason: true,
//       banUntil: true,
//       createdAt: true,
//       // lastSeen: true, // eğer eklenirse
//     },
//   });
//   if (!user) {
//     return NextResponse.json(
//       { error: "Kullanıcı bulunamadı" },
//       { status: 404 }
//     );
//   }
//   return NextResponse.json({ user });
// }
