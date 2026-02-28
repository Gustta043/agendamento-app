import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10" as any,
});

export async function POST(request: NextRequest) {
  try {
    const { agendamentoId, sessionId } = await request.json();

    if (!agendamentoId) {
      return NextResponse.json(
        { error: "ID do agendamento é obrigatório" },
        { status: 400 }
      );
    }

    // Se tem sessionId real do Stripe, verificar se pagamento foi concluído
    if (sessionId && !sessionId.startsWith("sim_")) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status !== "paid") {
          return NextResponse.json(
            { error: "Pagamento não confirmado pelo Stripe" },
            { status: 400 }
          );
        }
      } catch (err) {
        console.error("Erro ao verificar sessão Stripe:", err);
        return NextResponse.json(
          { error: "Erro ao verificar pagamento" },
          { status: 500 }
        );
      }
    } else if (sessionId?.startsWith("sim_")) {
      // Simulação: só permitir em desenvolvimento
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Simulação de pagamento não permitida em produção" },
          { status: 403 }
        );
      }
    }

    // Confirmar agendamento como pago
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
