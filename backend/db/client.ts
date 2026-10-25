import dns from "node:dns";
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {}

import { neonConfig } from "@neondatabase/serverless";
import { PrismaClient } from "@prisma/client";
import { PrismaNeonHTTP } from "@prisma/adapter-neon";

// Configure resilient fetch retry on transient socket errors / resets
if (!neonConfig.fetchFunction) {
  neonConfig.fetchFunction = async (url: any, options: any) => {
    let lastError: unknown;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        return await fetch(url, options);
      } catch (err) {
        lastError = err;
        if (attempt < 3) {
          await new Promise((r) => setTimeout(r, 150 * attempt));
        }
      }
    }
    throw lastError;
  };
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) throw new Error("DATABASE_URL is required");

  // Direct compute endpoint is much faster for HTTP queries and avoids PgBouncer drops
  const connectionString = rawUrl
    .replace("-pooler", "")
    .replace("&channel_binding=require", "")
    .replace("?channel_binding=require&", "?")
    .replace("?channel_binding=require", "");

  const adapterFactory = new PrismaNeonHTTP(connectionString);
  const originalConnect = adapterFactory.connect.bind(adapterFactory);
  adapterFactory.connect = async () => {
    const adapter = await originalConnect();
    adapter.startTransaction = async () => {
      return {
        provider: "postgres",
        adapterName: "@prisma/adapter-neon",
        options: { usePhantomQuery: false },
        queryRaw: (q: any) => adapter.queryRaw(q),
        executeRaw: (q: any) => adapter.executeRaw(q),
        commit: async () => {},
        rollback: async () => {},
      };
    };
    return adapter;
  };

  const client = new PrismaClient({
    adapter: adapterFactory,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  return client;
}

const rawDb = globalForPrisma.prisma ?? createPrismaClient();

if (rawDb && !(rawDb as any).__txPolyfilled) {
  const originalTx = rawDb.$transaction.bind(rawDb);
  rawDb.$transaction = (async (arg: any, options?: any) => {
    if (typeof arg === "function") {
      return arg(rawDb);
    }
    if (Array.isArray(arg)) {
      const results = [];
      for (const item of arg) {
        results.push(await item);
      }
      return results;
    }
    return originalTx(arg, options);
  }) as any;
  (rawDb as any).__txPolyfilled = true;
}

export const db = rawDb;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

