import { PrismaClient } from "@prisma/client";

// Cached on globalThis: without it, hot reload opens a new pool on every save
// until Postgres refuses connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Constructed on first use, not at import. Without a DATABASE_URL the client
 * cannot be built, and this module is reachable from a request path that is
 * allowed to run without one — see lib/demo-store.ts.
 */
export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }

  return globalForPrisma.prisma;
}
