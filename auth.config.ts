// // auth.config.ts
// import prisma from "@/lib/prisma";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import type { NextAuthConfig } from "next-auth";
// import Apple from "next-auth/providers/apple";
// import Google from "next-auth/providers/google";
// import Nodemailer from "next-auth/providers/nodemailer";

// export const authConfig = {
//   providers: [
//     Google({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     }),
//     Apple({
//       clientId: process.env.AUTH_APPLE_ID,
//       clientSecret: process.env.AUTH_APPLE_SECRET,
//     }),
//     Nodemailer({
//       server: {
//         host: process.env.EMAIL_SERVER_HOST,
//         port: Number(process.env.EMAIL_SERVER_PORT),
//         auth: {
//           user: process.env.EMAIL_SERVER_USER,
//           pass: process.env.EMAIL_SERVER_PASSWORD,
//         },
//       },
//       from: process.env.EMAIL_FROM,
//     }),
//   ],
//   pages: {
//     signIn: "/dashboard/login",
//     error: "/dashboard/error",
//   },
//   callbacks: {
//     authorized({ auth, request: { nextUrl } }) {
//       const isLoggedIn = !!auth;
//       const isPublicRoute = ["/dashboard/login", "/dashboard/error"].includes(nextUrl.pathname);
//       const isAdminRoute = nextUrl.pathname.startsWith('/dashboard/admin');

//       if (isAdminRoute && isLoggedIn) {
//         return true;
//       }
      
//       if (!isLoggedIn && !isPublicRoute) {
//         return Response.redirect(new URL('/dashboard/login', nextUrl));
//       }
      
//       return true;
//     },
//   },
//   adapter: PrismaAdapter(prisma),
//   session: { strategy: "jwt" },
// } satisfies NextAuthConfig;

// export default authConfig;