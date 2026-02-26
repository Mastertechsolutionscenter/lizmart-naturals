// auth.common.ts
import type { NextAuthConfig } from "next-auth";
import Apple from "next-auth/providers/apple";
import Google from "next-auth/providers/google";


const authCommon: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Apple({
      clientId: process.env.AUTH_APPLE_ID!,
      clientSecret: process.env.AUTH_APPLE_SECRET!,
    }),
  ],
  pages: {
    signIn: "/dashboard/login",
    error: "/dashboard/error",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth;
      const isPublicRoute = ["/dashboard/login", "/dashboard/error","/"].includes(nextUrl.pathname);
      const isAdminRoute = nextUrl.pathname.startsWith("/dashboard/admin");

      if (isAdminRoute && isLoggedIn) {
        return true;
      }
      if (!isLoggedIn && isAdminRoute) {
        return Response.redirect(new URL("/dashboard/login", nextUrl));
      }
      return true;
    },
  },
  session: { strategy: "jwt" },  
};

export default authCommon;
