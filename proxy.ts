import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1) Forcer HTTPS + WWW (corrige pages en double + page avec redirection)
  if (
    request.nextUrl.protocol === "http:" ||
    request.nextUrl.hostname === "conseiller-conjugal-israel.com"
  ) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = "www.conseiller-conjugal-israel.com";
    return NextResponse.redirect(url, 301);
  }

  // 2) Corriger le 404 : ancienne URL -> nouvelle URL
  if (pathname === "/qui-suis-je") {
    const url = request.nextUrl.clone();
    url.pathname = "/qui-sommes-nous";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

// (optionnel mais propre) limiter le proxy aux pages, pas aux assets
export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
