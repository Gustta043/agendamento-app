import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { agendamentoId, sessionId } = await request.json();

    if (!agendamentoId) {
      return NextResponse.json(
        { error: "ID do agendamento é obrigatório" },
        { status: 400 }
      );
    }

    // Confirmar agendamento como pago (fallback quando não há webhook)
    const agendamento = await prisma.agendamento.update({
      where: { id: agendamentoId },
      data: {
        status: "confirmado",
        pagamentoStatus: "pago",
        pagamentoId: sessionId || null,
      },
      include: { servico: true },
    });

    return NextResponse.json(agendamento);
  } catch (error) {
    console.error("Erro ao confirmar pagamento:", error);
    return NextResponse.json(
      { error: "Erro ao confirmar pagamento" },
      { status: 500 }
    );
  }
}
