import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { addMinutes, format, parse, isBefore, isAfter, startOfDay, addDays, addHours } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const data = searchParams.get("data");
    const servicoId = searchParams.get("servicoId");

    if (!data || !servicoId) {
      return NextResponse.json(
        { error: "Parâmetros 'data' e 'servicoId' são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar o serviço para saber a duração
    const servico = await prisma.servico.findUnique({
      where: { id: servicoId },
    });

    if (!servico) {
      return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
    }

    // Buscar configuração
    const config = await prisma.configuracaoAdmin.findFirst();
    const intervaloSlots = config?.intervaloSlots || 60;
    const antecedenciaMinima = config?.antecedenciaMinima || 24;

    // Verificar dia da semana
    const dataSelecionada = new Date(data + "T12:00:00");
    const diaSemana = dataSelecionada.getDay();

    // Buscar disponibilidade para esse dia
    const disponibilidade = await prisma.disponibilidade.findFirst({
      where: { diaSemana, ativo: true },
    });

    if (!disponibilidade) {
      return NextResponse.json({ slots: [], mensagem: "Sem expediente neste dia" });
    }

    // Buscar bloqueios
    const inicioDia = startOfDay(dataSelecionada);
    const fimDia = startOfDay(addDays(dataSelecionada, 1));

    const bloqueio = await prisma.bloqueioData.findFirst({
      where: {
        data: { gte: inicioDia, lt: fimDia },
      },
    });

    if (bloqueio) {
      return NextResponse.json({
        slots: [],
        mensagem: bloqueio.motivo || "Data bloqueada",
      });
    }

    // Buscar agendamentos do dia (não cancelados)
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        data: { gte: inicioDia, lt: fimDia },
        status: { not: "cancelado" },
      },
    });

    // Gerar slots
    const slots: { hora: string; disponivel: boolean }[] = [];
    const [horaInicioH, horaInicioM] = disponibilidade.horaInicio.split(":").map(Number);
    const [horaFimH, horaFimM] = disponibilidade.horaFim.split(":").map(Number);

    const agora = new Date();
    const minimoAgendamento = addHours(agora, antecedenciaMinima);

    let slotAtual = new Date(dataSelecionada);
    slotAtual.setHours(horaInicioH, horaInicioM, 0, 0);

    const fimExpediente = new Date(dataSelecionada);
    fimExpediente.setHours(horaFimH, horaFimM, 0, 0);

    while (slotAtual < fimExpediente) {
      const horaSlot = format(slotAtual, "HH:mm");
      const fimServico = addMinutes(slotAtual, servico.duracao);

      // Verificar se o serviço cabe no expediente
      if (fimServico > fimExpediente) {
        slotAtual = addMinutes(slotAtual, intervaloSlots);
        continue;
      }

      // Verificar antecedência mínima
      if (isBefore(slotAtual, minimoAgendamento)) {
        slots.push({ hora: horaSlot, disponivel: false });
        slotAtual = addMinutes(slotAtual, intervaloSlots);
        continue;
      }

      // Verificar conflito com agendamentos existentes
      const fimServicoStr = format(fimServico, "HH:mm");
      const temConflito = agendamentos.some((ag: { horaInicio: string; horaFim: string }) => {
        const agInicio = ag.horaInicio;
        const agFim = ag.horaFim;
        return horaSlot < agFim && fimServicoStr > agInicio;
      });

      slots.push({ hora: horaSlot, disponivel: !temConflito });
      slotAtual = addMinutes(slotAtual, intervaloSlots);
    }

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Erro ao buscar horários:", error);
    return NextResponse.json(
      { error: "Erro ao buscar horários disponíveis" },
      { status: 500 }
    );
  }
}
