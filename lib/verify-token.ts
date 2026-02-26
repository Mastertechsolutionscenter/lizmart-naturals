// lib/verify-token.ts
import { auth } from "@/auth/auth.node";
import type { NextRequest } from "next/server";

async function verifySessionToken(req: NextRequest): Promise<boolean> {
  try {
    // Cast to any to satisfy TypeScript overloads
    const session = await (auth as unknown as (r: any) => Promise<any>)(req);
    return !!session;
  } catch (error) {
    console.error("Token verification error:", error);
    return false;
  }
}

export default verifySessionToken;
