import { jsonData, jsonError } from "@/lib/server/api";
import { getCurrentUser, publicUser } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("UNAUTHENTICATED", "Sign in to continue.", 401);
  return jsonData({ user: publicUser(user) });
}
