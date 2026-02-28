import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { addMinutes, format } from "date-fns";
import { z } from "zod";

const agendamentoSchema = z.object({
  servicoId: z.string().min(1, "Serviço é obrigatório"),
  data: z.string().min(1, "Data é obrigatória"),
  horaInicio: z.string().min(1, "Horário é obrigatório"),
  clienteNome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  clienteEmail: z.string().email("Email inválido"),
  clienteTelefone: z.string().min(10, "Telefone inválido"),
  clienteEndereco: z.string().min(5, "Endereço é obrigatório"),
  observacoes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dados = agendamentoSchema.parse(body);

    // Buscar serviço
    const servico = await prisma.servico.findUnique({
      where: { id: dados.servicoId },
    });

    if (!servico) {
      return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
    }

    // Calcular hora de fim
    const [h, m] = dados.horaInicio.split(":").map(Number);
    const inicioDate = new Date();
    inicioDate.setHours(h, m, 0, 0);
    const fimDate = addMinutes(inicioDate, servico.duracao);
    const horaFim = format(fimDate, "HH:mm");

    // Verificar conflito
    const dataSelecionada = new Date(dados.data + "T12:00:00");
    const inicioDia = new Date(dataSelecionada);
    inicioDia.setHours(0, 0, 0, 0);
    const fimDia = new Date(dataSelecionada);
    fimDia.setHours(23, 59, 59, 999);

    const conflito = await prisma.agendamento.findFirst({
      where: {
        data: { gte: inicioDia, lte: fimDia },
        status: { not: "cancelado" },
        AND: [
          { horaInicio: { lt: horaFim } },
          { horaFim: { gt: dados.horaInicio } },
        ],
      },
    });

    if (conflito) {
      return NextResponse.json(
        { error: "Este horário já está ocupado. Por favor, escolha outro." },
        { status: 409 }
      );
    }

    // Criar agendamento
    const agendamento = await prisma.agendamento.create({
      data: {
        clienteNome: dados.clienteNome,
        clienteEmail: dados.clienteEmail,
        clienteTelefone: dados.clienteTelefone,
        clienteEndereco: dados.clienteEndereco,
        servicoId: dados.servicoId,
        data: dataSelecionada,
        horaInicio: dados.horaInicio,
        horaFim,
        valorTotal: servico.preco,
        observacoes: dados.observacoes || null,
        status: "pendente",
        pagamentoStatus: "pendente",
      },
      include: { servico: true },
    });

    return NextResponse.json(agendamento, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", detalhes: error.errors },
        { status: 400 }
      );
    }
    console.error("Erro ao criar agendamento:", error);
    return NextResponse.json(
      { error: "Erro ao criar agendamento" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status) where.status = status;

    const agendamentos = await prisma.agendamento.findMany({
      where,
      include: { servico: true },
      orderBy: [{ data: "desc" }, { horaInicio: "asc" }],
    });

    return NextResponse.json(agendamentos);
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar agendamentos" },
      { status: 500 }
    );
  }
}
