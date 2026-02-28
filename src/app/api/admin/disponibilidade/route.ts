import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verificarAuthCookie } from "@/lib/auth";

// GET - Listar disponibilidades
export async function GET() {
  if (!verificarAuthCookie()) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const disponibilidades = await prisma.disponibilidade.findMany({
      orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }],
    });
    return NextResponse.json(disponibilidades);
  } catch (error) {
    console.error("Erro ao listar disponibilidades:", error);
    return NextResponse.json(
      { error: "Erro ao listar disponibilidades" },
      { status: 500 }
    );
  }
}

// POST - Criar nova disponibilidade
export async function POST(request: NextRequest) {
  if (!verificarAuthCookie()) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { diaSemana, horaInicio, horaFim } = body;

    if (diaSemana == null || !horaInicio || !horaFim) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    if (diaSemana < 0 || diaSemana > 6) {
      return NextResponse.json(
        { error: "Dia da semana inválido (0-6)" },
        { status: 400 }
      );
    }

    const disponibilidade = await prisma.disponibilidade.create({
      data: {
        diaSemana: Number(diaSemana),
        horaInicio,
        horaFim,
        ativo: true,
      },
    });

    return NextResponse.json(disponibilidade, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar disponibilidade:", error);
    return NextResponse.json(
      { error: "Erro ao criar disponibilidade" },
      { status: 500 }
    );
  }
}
