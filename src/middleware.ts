import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // SUPER_ADMIN faqat /admin yo'liga ega bo'lishi mumkin
    if (path.startsWith("/admin") && token?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/users/:path*",
    "/payments/:path*",
    "/exams/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/schedule/:path*",
    "/homework/:path*",
    "/crm/:path*",
    "/admin/:path*",
  ],
};
