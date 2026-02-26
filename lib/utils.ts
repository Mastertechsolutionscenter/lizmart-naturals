
import { ReadonlyURLSearchParams } from 'next/navigation';

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// utils.ts (or inside your component file)
import type { MerchandiseSnapshot } from "@/types/merchandise";



export const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:3000';

/**
 * Builds a full URL with optional query parameters
 */
export const createUrl = (
  pathname: string,
  params?: URLSearchParams | ReadonlyURLSearchParams
) => {
  if (!params) return pathname;
  const paramsString = params.toString();
  const queryString = paramsString.length ? `?${paramsString}` : '';
  return `${pathname}${queryString}`;
};

/**
 * Ensures a string starts with a given prefix
 */
export const ensureStartsWith = (stringToCheck: string, startsWith: string) =>
  stringToCheck.startsWith(startsWith)
    ? stringToCheck
    : `${startsWith}${stringToCheck}`;

/**
 * Validates environment variables for your Prisma setup
 */
export const validateEnvironmentVariables = () => {
  const requiredEnvironmentVariables = [
    'DATABASE_URL', // Prisma database connection
    'VERCEL_PROJECT_PRODUCTION_URL' // optional for baseUrl
  ];

  const missingEnvironmentVariables: string[] = [];

  requiredEnvironmentVariables.forEach((envVar) => {
    if (!process.env[envVar]) missingEnvironmentVariables.push(envVar);
  });

  if (missingEnvironmentVariables.length) {
    throw new Error(
      `The following environment variables are missing. Your site may not work without them:\n\n${missingEnvironmentVariables.join(
        '\n'
      )}`
    );
  }
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}




export function parseJsonField(raw: any): any {
  if (raw == null) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      // not JSON string — return raw primitive or string
      return raw;
    }
  }
  // already object/array
  return raw;
}

export function isMerchandiseSnapshot(v: any): v is MerchandiseSnapshot {
  if (!v || typeof v !== "object") return false;
  // Check presence of expected keys (loose check)
  return (
    "product" in v ||
    "variant" in v ||
    "selectedOptions" in v
  );
}

