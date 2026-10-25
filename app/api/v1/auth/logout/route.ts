import { revokeCurrentSession } from "@/lib/server/auth";
import { jsonData } from "@/lib/server/api";

export const runtime = "nodejs";

export async function POST() {
  await revokeCurrentSession();
  return jsonData({ loggedOut: true });
}
