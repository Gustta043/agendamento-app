import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verificarAuthCookie } from "@/lib/auth";

// DELETE - Excluir bloqueio de data
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verificarAuthCookie()) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    await prisma.bloqueioData.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ sucesso: true });
  } catch (error) {
    console.error("Erro ao excluir bloqueio:", error);
    return NextResponse.json(
      { error: "Erro ao excluir bloqueio" },
      { status: 500 }
    );
  }
}
