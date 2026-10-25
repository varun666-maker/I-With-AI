import { jsonError } from "@/lib/server/api";

function trustedOrigins() {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  let configuredOrigin: string | undefined;
  try {
    configuredOrigin = configured ? new URL(configured).origin : undefined;
  } catch {
    configuredOrigin = undefined;
  }
  return new Set([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    ...(configuredOrigin ? [configuredOrigin] : []),
  ]);
}

export function rejectUntrustedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || trustedOrigins().has(origin)) return null;
  return jsonError("UNTRUSTED_ORIGIN", "This request origin is not allowed.", 403);
}

export function configuredLimit(name: string, fallback: number, minimum: number, maximum: number) {
  const value = Number(process.env[name] ?? fallback);
  return Number.isSafeInteger(value) && value >= minimum && value <= maximum ? value : fallback;
}
