import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verificarAuthCookie } from "@/lib/auth";

// PATCH - Atualizar serviço
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verificarAuthCookie()) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { nome, descricao, preco, duracao, ativo } = body;

    const data: Record<string, unknown> = {};
    if (nome !== undefined) data.nome = nome;
    if (descricao !== undefined) data.descricao = descricao;
    if (preco !== undefined) data.preco = Number(preco);
    if (duracao !== undefined) data.duracao = Number(duracao);
    if (ativo !== undefined) data.ativo = Boolean(ativo);

    const servico = await prisma.servico.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(servico);
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar serviço" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir serviço (apenas se não tiver agendamentos)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verificarAuthCookie()) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    // Verificar se tem agendamentos vinculados
    const agendamentos = await prisma.agendamento.count({
      where: { servicoId: params.id },
    });

    if (agendamentos > 0) {
      // Se tem agendamentos, apenas desativar
      const servico = await prisma.servico.update({
        where: { id: params.id },
        data: { ativo: false },
      });
      return NextResponse.json({
        ...servico,
        aviso:
          "Serviço desativado pois possui agendamentos vinculados. Não foi possível excluir.",
      });
    }

    await prisma.servico.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ sucesso: true });
  } catch (error) {
    console.error("Erro ao excluir serviço:", error);
    return NextResponse.json(
      { error: "Erro ao excluir serviço" },
      { status: 500 }
    );
  }
}
