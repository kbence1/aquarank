import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { status: "ok", service: "aquarank" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
