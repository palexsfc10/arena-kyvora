import { NextResponse } from "next/server";

/** Liveness probe for Docker / Cloudflare — no secrets, no DB. */
export function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}
