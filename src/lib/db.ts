import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Prisma is imported while Next.js collects route metadata during builds.
  // The adapter will report a connection error when a request uses the client
  // if the runtime environment has not provided DATABASE_URL.
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL || "",
  });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export default db;
