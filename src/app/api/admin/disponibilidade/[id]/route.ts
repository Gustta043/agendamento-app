import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verificarAuthCookie } from "@/lib/auth";

// PATCH - Atualizar disponibilidade
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verificarAuthCookie()) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { diaSemana, horaInicio, horaFim, ativo } = body;

    const data: Record<string, unknown> = {};
    if (diaSemana !== undefined) data.diaSemana = Number(diaSemana);
    if (horaInicio !== undefined) data.horaInicio = horaInicio;
    if (horaFim !== undefined) data.horaFim = horaFim;
    if (ativo !== undefined) data.ativo = Boolean(ativo);

    const disponibilidade = await prisma.disponibilidade.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(disponibilidade);
  } catch (error) {
    console.error("Erro ao atualizar disponibilidade:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar disponibilidade" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir disponibilidade
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verificarAuthCookie()) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    await prisma.disponibilidade.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ sucesso: true });
  } catch (error) {
    console.error("Erro ao excluir disponibilidade:", error);
    return NextResponse.json(
      { error: "Erro ao excluir disponibilidade" },
      { status: 500 }
    );
  }
}
