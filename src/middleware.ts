import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Korunan rotalar ve admin rotası
  const protectedRoutes = ["/admin", "/profile", "/messages"];
  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Eğer rota korunmuyorsa devam et
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Token'ı al
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Eğer token yoksa (giriş yapılmamışsa) login sayfasına yönlendir
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Eğer admin rotasıysa ve kullanıcının rolü ADMIN değilse anasayfaya yönlendir
  if (isAdminRoute && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Middleware'in hangi rotalarda çalışacağını belirtir
export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/messages/:path*"],
};
