import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Note: We handle authentication in client-side components
  // because the token is stored in localStorage (not cookies)
  // This middleware is just a placeholder for future server-side checks
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

