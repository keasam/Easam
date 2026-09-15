import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from '@prisma/client'

/**
 * Dev-only resilience: `prisma db push` / `generate` can introduce new schema
 * fields while the Next.js dev server is still holding a PrismaClient created
 * from the OLD generated client (cached on globalThis to survive HMR).
 * The stale instance rejects unknown fields (e.g. a freshly added column),
 * so we fingerprint the schema and drop the cached client when it changes.
 */
function schemaFingerprint(): string | null {
  if (process.env.NODE_ENV === "production") return null;
  try {
    const src = readFileSync(join(process.cwd(), "prisma", "schema.prisma"), "utf8");
    let h = 5381;
    for (let i = 0; i < src.length; i++) h = ((h << 5) + h + src.charCodeAt(i)) | 0;
    return String(h);
  } catch {
    return null;
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaSchemaFp?: string | null
}

function getClient(): PrismaClient {
  const fp = schemaFingerprint();

  if (globalForPrisma.prisma && fp !== null && globalForPrisma.prismaSchemaFp !== fp) {
    // schema changed since this client was created — replace it
    void globalForPrisma.prisma.$disconnect().catch(() => {});
    globalForPrisma.prisma = undefined;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: ['query'],
    });
    globalForPrisma.prismaSchemaFp = fp;
  }

  return globalForPrisma.prisma;
}

export const db = getClient();
