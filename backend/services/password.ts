import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";

function scrypt(
  password: string,
  salt: Buffer,
  keyLength: number,
  options: { N: number; r: number; p: number; maxmem: number },
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    nodeScrypt(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey as Buffer);
    });
  });
}
const KEY_LENGTH = 64;
const COST = 16384;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = await scrypt(password, salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELIZATION,
    maxmem: 32 * 1024 * 1024,
  });

  return [
    "scrypt",
    `N=${COST},r=${BLOCK_SIZE},p=${PARALLELIZATION}`,
    salt.toString("base64url"),
    derivedKey.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [algorithm, parameters, saltValue, hashValue] = encoded.split("$");
  if (algorithm !== "scrypt" || !parameters || !saltValue || !hashValue) return false;

  const params = Object.fromEntries(
    parameters.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, Number(value)];
    }),
  ) as { N?: number; r?: number; p?: number };

  if (!params.N || !params.r || !params.p) return false;
  if (params.N > 1 << 18 || params.r > 32 || params.p > 4) return false;

  const salt = Buffer.from(saltValue, "base64url");
  const expected = Buffer.from(hashValue, "base64url");
  const actual = await scrypt(password, salt, expected.length, {
    N: params.N,
    r: params.r,
    p: params.p,
    maxmem: 64 * 1024 * 1024,
  });

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
