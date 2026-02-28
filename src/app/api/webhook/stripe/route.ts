import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10" as any,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    if (!sig) {
      return NextResponse.json({ error: "Signature missing" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );
    } catch (err) {
      console.error("Erro ao validar webhook:", err);
      return NextResponse.json({ error: "Webhook inválido" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const agendamentoId = session.metadata?.agendamentoId;

      if (agendamentoId) {
        // Atualizar agendamento para confirmado e pago
        await prisma.agendamento.update({
          where: { id: agendamentoId },
          data: {
            status: "confirmado",
            pagamentoStatus: "pago",
            pagamentoId: session.payment_intent as string,
          },
        });

        console.log(`✅ Agendamento ${agendamentoId} confirmado e pago!`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro no webhook:", error);
    return NextResponse.json(
      { error: "Erro ao processar webhook" },
      { status: 500 }
    );
  }
}
