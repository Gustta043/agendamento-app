import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verificarAuthCookie } from "@/lib/auth";

// GET - Listar bloqueios de data
export async function GET() {
  if (!verificarAuthCookie()) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const bloqueios = await prisma.bloqueioData.findMany({
      orderBy: { data: "asc" },
    });
    return NextResponse.json(bloqueios);
  } catch (error) {
    console.error("Erro ao listar bloqueios:", error);
    return NextResponse.json(
      { error: "Erro ao listar bloqueios" },
      { status: 500 }
    );
  }
}

// POST - Criar novo bloqueio de data
export async function POST(request: NextRequest) {
  if (!verificarAuthCookie()) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { data, motivo } = body;

    if (!data) {
      return NextResponse.json(
        { error: "Data é obrigatória" },
        { status: 400 }
      );
    }

    const bloqueio = await prisma.bloqueioData.create({
      data: {
        data: new Date(data + "T12:00:00"),
        motivo: motivo || null,
      },
    });

    return NextResponse.json(bloqueio, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar bloqueio:", error);
    return NextResponse.json(
      { error: "Erro ao criar bloqueio" },
      { status: 500 }
    );
  }
}
