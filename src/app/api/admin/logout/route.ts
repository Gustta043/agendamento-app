import { NextRequest, NextResponse } from "next/server";
import { invalidarSessao, COOKIE_OPTIONS } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  if (token) {
    invalidarSessao(token);
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set("admin_token", "", {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });

  return response;
}
