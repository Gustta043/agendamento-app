import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10" as any,
});

export async function POST(request: NextRequest) {
  try {
    const { agendamentoId } = await request.json();

    if (!agendamentoId) {
      return NextResponse.json(
        { error: "ID do agendamento é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar agendamento
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: agendamentoId },
      include: { servico: true },
    });

    if (!agendamento) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      );
    }

    if (agendamento.pagamentoStatus === "pago") {
      return NextResponse.json(
        { error: "Este agendamento já foi pago" },
        { status: 400 }
      );
    }

    // Criar sessão do Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: agendamento.servico.nome,
              description: `Agendamento para ${new Date(agendamento.data).toLocaleDateString("pt-BR")} às ${agendamento.horaInicio}`,
            },
            unit_amount: Math.round(agendamento.valorTotal * 100), // Stripe usa centavos
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/confirmacao/${agendamento.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pagamento/${agendamento.id}?cancelado=true`,
      customer_email: agendamento.clienteEmail,
      metadata: {
        agendamentoId: agendamento.id,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Erro ao criar sessão de pagamento:", error);
    return NextResponse.json(
      { error: "Erro ao iniciar pagamento" },
      { status: 500 }
    );
  }
}
