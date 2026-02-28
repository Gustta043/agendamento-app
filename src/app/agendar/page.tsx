"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Servico, SlotHorario } from "@/lib/types";
import { formatarMoeda } from "@/lib/types";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiArrowLeft,
  FiArrowRight,
  FiFileText,
} from "react-icons/fi";
import toast from "react-hot-toast";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isAfter,
  isBefore,
  addHours,
} from "date-fns";
import { ptBR } from "date-fns/locale";

type Etapa = 1 | 2 | 3 | 4;

export default function AgendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const servicoIdParam = searchParams.get("servico");

  const [etapa, setEtapa] = useState<Etapa>(1);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(null);
  const [slots, setSlots] = useState<SlotHorario[]>([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mensagemSlots, setMensagemSlots] = useState("");

  // Dados do cliente
  const [clienteNome, setClienteNome] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [clienteEndereco, setClienteEndereco] = useState("");
  const [observacoes, setObservacoes] = useState("");

  // Carregar serviços
  useEffect(() => {
    fetch("/api/servicos")
      .then((res) => res.json())
      .then((data) => {
        setServicos(data);
        if (servicoIdParam) {
          const servico = data.find((s: Servico) => s.id === servicoIdParam);
          if (servico) {
            setServicoSelecionado(servico);
            setEtapa(2);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        toast.error("Erro ao carregar serviços");
        setLoading(false);
      });
  }, [servicoIdParam]);

  // Carregar slots quando data muda
  const carregarSlots = useCallback(async () => {
    if (!dataSelecionada || !servicoSelecionado) return;

    setLoadingSlots(true);
    setSlots([]);
    setHorarioSelecionado(null);
    setMensagemSlots("");

    try {
      const dataStr = format(dataSelecionada, "yyyy-MM-dd");
      const res = await fetch(
        `/api/horarios?data=${dataStr}&servicoId=${servicoSelecionado.id}`
      );
      const data = await res.json();
      setSlots(data.slots || []);
      setMensagemSlots(data.mensagem || "");
    } catch {
      toast.error("Erro ao carregar horários");
    } finally {
      setLoadingSlots(false);
    }
  }, [dataSelecionada, servicoSelecionado]);

  useEffect(() => {
    carregarSlots();
  }, [carregarSlots]);

  // Funções do calendário
  const diasDoMes = () => {
    const inicio = startOfWeek(startOfMonth(mesAtual), { weekStartsOn: 0 });
    const fim = endOfWeek(endOfMonth(mesAtual), { weekStartsOn: 0 });
    const dias: Date[] = [];
    let dia = inicio;
    while (dia <= fim) {
      dias.push(dia);
      dia = addDays(dia, 1);
    }
    return dias;
  };

  const podeSelecionar = (dia: Date) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const maxDate = addDays(hoje, 30);
    return (
      isAfter(dia, addDays(hoje, -1)) &&
      isBefore(dia, addDays(maxDate, 1)) &&
      isSameMonth(dia, mesAtual) &&
      dia.getDay() !== 0 // sem domingo
    );
  };

  // Submit do agendamento
  const handleSubmit = async () => {
    if (!servicoSelecionado || !dataSelecionada || !horarioSelecionado) return;

    if (!clienteNome || !clienteEmail || !clienteTelefone || !clienteEndereco) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          servicoId: servicoSelecionado.id,
          data: format(dataSelecionada, "yyyy-MM-dd"),
          horaInicio: horarioSelecionado,
          clienteNome,
          clienteEmail,
          clienteTelefone,
          clienteEndereco,
          observacoes: observacoes || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao criar agendamento");
      }

      const agendamento = await res.json();
      toast.success("Agendamento criado! Redirecionando para pagamento...");
      router.push(`/pagamento/${agendamento.id}`);
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar agendamento");
    } finally {
      setSubmitting(false);
    }
  };

  const nomeDiaSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Progresso */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[
              { num: 1, label: "Serviço" },
              { num: 2, label: "Data e Hora" },
              { num: 3, label: "Seus Dados" },
              { num: 4, label: "Confirmar" },
            ].map((step, i) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      etapa >= step.num
                        ? "bg-primary-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {etapa > step.num ? <FiCheck size={16} /> : step.num}
                  </div>
                  <span
                    className={`text-sm font-medium hidden sm:block ${
                      etapa >= step.num ? "text-primary-600" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < 3 && (
                  <div
                    className={`flex-1 h-0.5 mx-3 ${
                      etapa > step.num ? "bg-primary-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ETAPA 1: Escolher Serviço */}
        {etapa === 1 && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Escolha o Serviço
            </h2>
            <p className="text-gray-500 mb-6">
              Selecione o tipo de limpeza que você precisa
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {servicos.map((servico) => (
                <button
                  key={servico.id}
                  onClick={() => {
                    setServicoSelecionado(servico);
                    setEtapa(2);
                  }}
                  className={`card p-5 text-left hover:shadow-md transition-all duration-200 border-2 ${
                    servicoSelecionado?.id === servico.id
                      ? "border-primary-500 bg-primary-50"
                      : "border-transparent hover:border-primary-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{servico.nome}</h3>
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                        {servico.descricao}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-lg font-extrabold text-primary-600">
                          {formatarMoeda(servico.preco)}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <FiClock size={12} />
                          {servico.duracao}min
                        </span>
                      </div>
                    </div>
                    <span className="text-3xl">
                      {servico.nome.includes("Sofá")
                        ? "🛋️"
                        : servico.nome.includes("Colchão")
                        ? "🛏️"
                        : servico.nome.includes("Tapete")
                        ? "🧶"
                        : servico.nome.includes("Cadeira")
                        ? "💺"
                        : servico.nome.includes("Poltrona")
                        ? "🪑"
                        : "✨"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ETAPA 2: Data e Hora */}
        {etapa === 2 && servicoSelecionado && (
          <div className="animate-fadeIn">
            <button
              onClick={() => setEtapa(1)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 font-medium"
            >
              <FiArrowLeft size={18} />
              Voltar
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Escolha a Data e Horário
            </h2>
            <p className="text-gray-500 mb-6">
              {servicoSelecionado.nome} — {formatarMoeda(servicoSelecionado.preco)}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendário */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setMesAtual(subMonths(mesAtual, 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  <h3 className="font-bold text-gray-900 capitalize">
                    {format(mesAtual, "MMMM yyyy", { locale: ptBR })}
                  </h3>
                  <button
                    onClick={() => setMesAtual(addMonths(mesAtual, 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiChevronRight size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {nomeDiaSemana.map((d) => (
                    <div
                      key={d}
                      className="text-center text-xs font-medium text-gray-400 py-2"
                    >
                      {d}
                    </div>
                  ))}
                  {diasDoMes().map((dia, idx) => {
                    const selecionavel = podeSelecionar(dia);
                    const selecionado = dataSelecionada && isSameDay(dia, dataSelecionada);
                    const noMes = isSameMonth(dia, mesAtual);

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (selecionavel) {
                            setDataSelecionada(dia);
                            setHorarioSelecionado(null);
                          }
                        }}
                        disabled={!selecionavel}
                        className={`
                          relative h-10 rounded-lg text-sm font-medium transition-all duration-200
                          ${!noMes ? "text-gray-200" : ""}
                          ${
                            selecionado
                              ? "bg-primary-600 text-white shadow-md"
                              : selecionavel
                              ? "text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                              : "text-gray-300 cursor-not-allowed"
                          }
                        `}
                      >
                        {format(dia, "d")}
                        {isSameDay(dia, new Date()) && !selecionado && (
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Horários */}
              <div className="card p-5">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiClock size={18} />
                  {dataSelecionada
                    ? format(dataSelecionada, "dd 'de' MMMM", { locale: ptBR })
                    : "Selecione uma data"}
                </h3>

                {!dataSelecionada && (
                  <div className="flex items-center justify-center h-48 text-gray-400">
                    <div className="text-center">
                      <FiCalendar size={48} className="mx-auto mb-3 opacity-30" />
                      <p>Selecione uma data no calendário</p>
                    </div>
                  </div>
                )}

                {dataSelecionada && loadingSlots && (
                  <div className="flex items-center justify-center h-48">
                    <LoadingSpinner />
                  </div>
                )}

                {dataSelecionada && !loadingSlots && mensagemSlots && (
                  <div className="flex items-center justify-center h-48 text-gray-400">
                    <p>{mensagemSlots}</p>
                  </div>
                )}

                {dataSelecionada && !loadingSlots && !mensagemSlots && (
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                    {slots.map((slot) => (
                      <button
                        key={slot.hora}
                        onClick={() => {
                          if (slot.disponivel) setHorarioSelecionado(slot.hora);
                        }}
                        disabled={!slot.disponivel}
                        className={`
                          py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200
                          ${
                            horarioSelecionado === slot.hora
                              ? "bg-primary-600 text-white shadow-md"
                              : slot.disponivel
                              ? "bg-gray-50 text-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-gray-200"
                              : "bg-gray-100 text-gray-300 cursor-not-allowed line-through"
                          }
                        `}
                      >
                        {slot.hora}
                      </button>
                    ))}
                    {slots.length === 0 && (
                      <p className="col-span-3 text-center text-gray-400 py-8">
                        Nenhum horário disponível para esta data
                      </p>
                    )}
                  </div>
                )}

                {horarioSelecionado && (
                  <button
                    onClick={() => setEtapa(3)}
                    className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
                  >
                    Continuar
                    <FiArrowRight size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 3: Dados do Cliente */}
        {etapa === 3 && (
          <div className="animate-fadeIn">
            <button
              onClick={() => setEtapa(2)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 font-medium"
            >
              <FiArrowLeft size={18} />
              Voltar
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Seus Dados
            </h2>
            <p className="text-gray-500 mb-6">
              Preencha seus dados para confirmar o agendamento
            </p>

            <div className="card p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label flex items-center gap-1">
                    <FiUser size={14} /> Nome completo *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Seu nome completo"
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label flex items-center gap-1">
                    <FiMail size={14} /> E-mail *
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="seu@email.com"
                    value={clienteEmail}
                    onChange={(e) => setClienteEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label flex items-center gap-1">
                    <FiPhone size={14} /> Telefone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="(11) 99999-9999"
                    value={clienteTelefone}
                    onChange={(e) => setClienteTelefone(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label flex items-center gap-1">
                    <FiMapPin size={14} /> Endereço completo *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Rua, número, bairro, cidade"
                    value={clienteEndereco}
                    onChange={(e) => setClienteEndereco(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label flex items-center gap-1">
                    <FiFileText size={14} /> Observações (opcional)
                  </label>
                  <textarea
                    className="input-field resize-none"
                    rows={3}
                    placeholder="Alguma observação sobre o serviço..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (!clienteNome || !clienteEmail || !clienteTelefone || !clienteEndereco) {
                    toast.error("Preencha todos os campos obrigatórios");
                    return;
                  }
                  setEtapa(4);
                }}
                className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
              >
                Revisar Agendamento
                <FiArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 4: Confirmação */}
        {etapa === 4 && servicoSelecionado && dataSelecionada && (
          <div className="animate-fadeIn">
            <button
              onClick={() => setEtapa(3)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 font-medium"
            >
              <FiArrowLeft size={18} />
              Voltar
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Confirme seu Agendamento
            </h2>
            <p className="text-gray-500 mb-6">
              Revise os detalhes antes de prosseguir para o pagamento
            </p>

            <div className="card p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">
                Resumo do Agendamento
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                  <span className="text-2xl">
                    {servicoSelecionado.nome.includes("Sofá")
                      ? "🛋️"
                      : servicoSelecionado.nome.includes("Colchão")
                      ? "🛏️"
                      : "✨"}
                  </span>
                  <div>
                    <p className="font-bold text-gray-900">
                      {servicoSelecionado.nome}
                    </p>
                    <p className="text-sm text-gray-500">
                      Duração: {servicoSelecionado.duracao} minutos
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="text-primary-500" size={18} />
                    <div>
                      <p className="text-xs text-gray-400">Data</p>
                      <p className="font-medium text-gray-900">
                        {format(dataSelecionada, "dd 'de' MMMM 'de' yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiClock className="text-primary-500" size={18} />
                    <div>
                      <p className="text-xs text-gray-400">Horário</p>
                      <p className="font-medium text-gray-900">
                        {horarioSelecionado}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <FiUser className="text-primary-500" size={18} />
                    <div>
                      <p className="text-xs text-gray-400">Nome</p>
                      <p className="font-medium text-gray-900">{clienteNome}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiPhone className="text-primary-500" size={18} />
                    <div>
                      <p className="text-xs text-gray-400">Telefone</p>
                      <p className="font-medium text-gray-900">
                        {clienteTelefone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMail className="text-primary-500" size={18} />
                    <div>
                      <p className="text-xs text-gray-400">Email</p>
                      <p className="font-medium text-gray-900">{clienteEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMapPin className="text-primary-500" size={18} />
                    <div>
                      <p className="text-xs text-gray-400">Endereço</p>
                      <p className="font-medium text-gray-900">
                        {clienteEndereco}
                      </p>
                    </div>
                  </div>
                </div>

                {observacoes && (
                  <div className="pb-4 border-b border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">Observações</p>
                    <p className="text-gray-700 text-sm">{observacoes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-extrabold text-primary-600">
                    {formatarMoeda(servicoSelecionado.preco)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-success w-full text-lg !py-4 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Processando...
                </>
              ) : (
                <>
                  Ir para Pagamento
                  <FiArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
