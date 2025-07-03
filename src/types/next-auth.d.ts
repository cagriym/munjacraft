import { Role } from "@prisma/client";
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      balance: number;
      isAddressVerified?: boolean;
      avatar?: string;
      nickname?: string;
      fullname?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: Role;
    balance: number;
    isAddressVerified?: boolean;
    avatar?: string;
    nickname?: string;
    fullname?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: Role;
    balance: number;
    isAddressVerified?: boolean;
    avatar?: string;
    nickname?: string;
    fullname?: string;
  }
}
