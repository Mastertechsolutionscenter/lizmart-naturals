import { Allowed, UserRole } from "@prisma/client";
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

// 👇 Define your extended user type
export type ExtendedUser = DefaultSession["user"] & {
  role: UserRole;
  allowed: Allowed;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
};

// ✅ Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }

  interface User extends DefaultUser {
    role: UserRole;
    allowed: Allowed;
    isTwoFactorEnabled: boolean;
    isOAuth: boolean;
  }
}

// ✅ Extend JWT type as well (important for server components)
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    allowed?: Allowed;
    isTwoFactorEnabled?: boolean;
    isOAuth?: boolean;
  }
}
