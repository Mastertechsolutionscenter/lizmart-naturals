
export const runtime = "nodejs";

import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import authCommon from "./auth.common";



export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authCommon,
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    
    ...authCommon.providers,
    
    Nodemailer({
      server: {
        host: process.env.EMAIL_SERVER_HOST!,
        port: Number(process.env.EMAIL_SERVER_PORT!),
        auth: {
          user: process.env.EMAIL_SERVER_USER!,
          pass: process.env.EMAIL_SERVER_PASSWORD!,
        },
      },
      from: process.env.EMAIL_FROM!,
    }),
  ],
   callbacks: {
    ...authCommon.callbacks,
    async jwt({ token, user }) {
      // When user first signs in, persist their role
      if (user) {
        token.id = user.id;
        token.role = user.role; // ✅ include role
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string; // ✅ include role in session
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },
  
});
