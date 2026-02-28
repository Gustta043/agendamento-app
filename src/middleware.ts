import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger páginas e APIs admin (exceto login)
  if (
    pathname.startsWith("/admin") ||
    (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/login"))
  ) {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      // Se é uma API, retornar 401
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Não autorizado" },
          { status: 401 }
        );
      }

      // Se é a página, deixar passar (a página tem seu próprio form de login)
      // Mas mantém proteção base — sem token, o middleware permite
      // porque o login está embutido na página admin
    }
  }

  // Proteger GET /api/agendamentos (listar todos) — apenas admin
  if (pathname === "/api/agendamentos" && request.method === "GET") {
    const token = request.cookies.get("admin_token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
  }

  // Proteger PATCH /api/agendamentos/[id] — apenas admin
  if (
    pathname.match(/^\/api\/agendamentos\/[^/]+$/) &&
    request.method === "PATCH"
  ) {
    const token = request.cookies.get("admin_token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/agendamentos/:path*",
  ],
};
