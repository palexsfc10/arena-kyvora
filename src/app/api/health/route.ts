import { NextResponse } from "next/server";

/** Liveness probe for Docker / Cloudflare — no secrets, no DB, no upstream API. */
export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "arena-web",
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
