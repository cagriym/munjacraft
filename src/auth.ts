import NextAuth, { Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { JWT } from "next-auth/jwt";

// Debug loglarını kaldırıyorum
// console.log("---AUTH.TS LOADED---");
// console.log("DATABASE_URL:", process.env.DATABASE_URL);
// console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET);
// console.log("--------------------");

export const nextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Record<string, string> | undefined) {
        try {
          if (!credentials?.email || !credentials?.password)
            throw new Error("USER_NOT_FOUND");
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              password: true,
              role: true,
              fullname: true,
              nickname: true,
              birthdate: true,
              phone: true,
              country: true,
              city: true,
              district: true,
              address: true,
              bio: true,
              avatar: true,
              balance: true,
              createdAt: true,
              updatedAt: true,
              isAddressVerified: true,
              isBanned: true,
              banReason: true,
              banType: true,
              banUntil: true,
            },
          });
          if (!user) {
            throw new Error("USER_NOT_FOUND");
          }
          if (user.isBanned) {
            throw new Error("BANNED_USER");
          }
          const isValid = await compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error("INVALID_PASSWORD");
          }
          return {
            id: String(user.id),
            email: user.email,
            name: user.fullname,
            role: user.role,
            balance: user.balance.toNumber(),
            isAddressVerified: user.isAddressVerified,
            avatar: user.avatar ?? undefined,
            nickname: user.nickname ?? undefined,
            fullname: user.fullname ?? undefined,
          };
        } catch (e: any) {
          // NextAuth error handling: error.message will be passed to frontend
          throw new Error(e.message || "UNKNOWN_ERROR");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 5 * 60, // 5 dakika
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.balance = user.balance;
        token.isAddressVerified = user.isAddressVerified;
        token.avatar = user.avatar;
        token.nickname = user.nickname;
        token.fullname = user.fullname;
      }

      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: Number(token.id) },
        });
        if (dbUser) {
          token.balance = dbUser.balance.toNumber();
          token.role = dbUser.role;
          token.isAddressVerified = dbUser.isAddressVerified;
          token.avatar = dbUser.avatar ?? undefined;
          token.nickname = dbUser.nickname ?? undefined;
          token.fullname = dbUser.fullname ?? undefined;
        }
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.balance = token.balance;
        session.user.isAddressVerified = token.isAddressVerified;
        session.user.avatar = token.avatar;
        session.user.nickname = token.nickname;
        session.user.fullname = token.fullname;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(nextAuthConfig);

export { handler as GET, handler as POST };
