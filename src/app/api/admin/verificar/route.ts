import { NextRequest, NextResponse } from "next/server";
import { verificarSessao } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;

    if (!token || !verificarSessao(token)) {
      return NextResponse.json(
        { autenticado: false },
        { status: 401 }
      );
    }

    return NextResponse.json({ autenticado: true });
  } catch (error) {
    return NextResponse.json(
      { autenticado: false },
      { status: 401 }
    );
  }
}
