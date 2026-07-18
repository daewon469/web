import { NextRequest, NextResponse } from "next/server";

const APEX_HOST = "daewon469.com";
const MOBILE_WWW_HOST = "www.daewon469.com";

function hostname(req: NextRequest) {
  return (req.headers.get("host") ?? "").split(":")[0].toLowerCase();
}

function isMobileUserAgent(ua: string) {
  return /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(ua);
}

function isLocalHost(host: string) {
  return host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
}

export function middleware(req: NextRequest) {
  const host = hostname(req);

  if (isLocalHost(host)) return NextResponse.next();

  const ua = req.headers.get("user-agent") ?? "";
  if (host === MOBILE_WWW_HOST) return NextResponse.next();
  if (host !== APEX_HOST) return NextResponse.next();

  if (!isMobileUserAgent(ua)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.protocol = "https:";
  url.host = MOBILE_WWW_HOST;
  return NextResponse.redirect(url, 302);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json|webmanifest)$).*)",
  ],
};
