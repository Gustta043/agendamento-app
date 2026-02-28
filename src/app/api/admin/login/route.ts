import { NextRequest, NextResponse } from "next/server";
import { criarSessao, COOKIE_OPTIONS } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { senha } = await request.json();
    const senhaCorreta = process.env.ADMIN_PASSWORD;

    if (!senhaCorreta) {
      console.error("ADMIN_PASSWORD não configurada no .env");
      return NextResponse.json(
        { error: "Erro de configuração do servidor" },
        { status: 500 }
      );
    }

    if (senha !== senhaCorreta) {
      return NextResponse.json(
        { error: "Senha incorreta" },
        { status: 401 }
      );
    }

    // Gerar token seguro aleatório
    const token = criarSessao();

    const response = NextResponse.json({ success: true });

    // Setar cookie HTTP-only (expira em 7 dias)
    response.cookies.set("admin_token", token, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      { error: "Erro ao processar login" },
      { status: 500 }
    );
  }
}
