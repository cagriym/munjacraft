import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { fullname, birthdate, email, nickname, password } = await req.json();
    if (!fullname || !birthdate || !email || !nickname || !password) {
      return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
    }
    // Email veya nickname zaten var mı?
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { nickname }],
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email veya nick zaten kayıtlı" },
        { status: 409 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        fullname,
        birthdate: new Date(birthdate),
        email,
        nickname,
        password: hashedPassword,
      },
    });
    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, nickname: user.nickname },
    });
  } catch (e) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
