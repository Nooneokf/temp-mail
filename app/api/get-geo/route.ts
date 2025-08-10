import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // 1. Try getting the IP from Cloudflare or Forwarded header
  let ip =
    req.headers.get("cf-connecting-ip") || // Cloudflare
    req.headers.get("x-forwarded-for")?.split(",")[0] || // Proxies
    req.ip || // Native
    "0.0.0.0";

  // 2. Fetch geo info from ip-api
  const res = await fetch(`http://ip-api.com/json/${ip}`);
  const data = await res.json();

  return NextResponse.json(data);
}
