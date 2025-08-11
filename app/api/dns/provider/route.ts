// app/api/dns/provider/route.ts
import { NextResponse } from "next/server";
import dns from "dns/promises";

const providerMap: Record<string, string> = {
  "cloudflare": "Cloudflare",
  "godaddy": "GoDaddy",
  "namecheap": "Namecheap",
  "google": "Google Domains",
  "hostgator": "HostGator",
  "bluehost": "Bluehost",
  "azure": "Azure DNS",
  "route53": "AWS Route 53",
  "digitalocean": "DigitalOcean DNS",
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const domain = url.searchParams.get("domain");

  if (!domain) {
    return NextResponse.json({ message: "Domain is required" }, { status: 400 });
  }

  try {
    const nsRecords = await dns.resolveNs(domain);
    const lowerNameservers = nsRecords.map((ns) => ns.toLowerCase());
    const match = Object.entries(providerMap).find(([key]) =>
      lowerNameservers.some((ns) => ns.includes(key))
    );

    return NextResponse.json({
      provider: match ? match[1] : null,
      nameservers: nsRecords,
    });
  } catch (err: any) {
    console.error("DNS lookup failed:", err);
    return NextResponse.json(
      { message: "Failed to detect DNS provider" },
      { status: 500 }
    );
  }
}
