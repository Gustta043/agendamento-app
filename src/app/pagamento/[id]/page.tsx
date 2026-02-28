"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Agendamento, formatarMoeda, formatarData } from "@/lib/types";
import {
  FiCreditCard,
  FiCalendar,
  FiClock,
  FiUser,
  FiShield,
  FiArrowLeft,
  FiAlertCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";

export default function PagamentoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const cancelado = searchParams.get("cancelado");

  const [agendamento, setAgendamento] = useState<Agendamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    if (cancelado) {
      toast.error("Pagamento cancelado. Você pode tentar novamente.");
    }
  }, [cancelado]);

  useEffect(() => {
    fetch(`/api/agendamentos/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setAgendamento(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Erro ao carregar agendamento");
        setLoading(false);
      });
  }, [id]);

  const iniciarPagamento = async () => {
    setProcessando(true);

    try {
      const res = await fetch("/api/pagamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agendamentoId: id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao iniciar pagamento");
      }

      // Redirecionar para Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL de pagamento não encontrada");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar pagamento");
      setProcessando(false);
    }
  };

  // Simular pagamento (modo dev sem stripe)
  const simularPagamento = async () => {
    setProcessando(true);

    try {
      const res = await fetch("/api/pagamento/confirmar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agendamentoId: id, sessionId: "sim_" + Date.now() }),
      });

      if (!res.ok) throw new Error("Erro ao confirmar pagamento");

      toast.success("Pagamento confirmado!");
      router.push(`/confirmacao/${id}`);
    } catch (error: any) {
      toast.error(error.message || "Erro ao confirmar pagamento");
      setProcessando(false);
    }
  };

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

  if (!agendamento) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FiAlertCircle size={48} className="mx-auto text-red-400 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Agendamento não encontrado
            </h2>
            <button
              onClick={() => router.push("/agendar")}
              className="btn-primary mt-4"
            >
              Novo Agendamento
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (agendamento.pagamentoStatus === "pago") {
    router.push(`/confirmacao/${id}`);
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 font-medium"
        >
          <FiArrowLeft size={18} />
          Voltar
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Pagamento</h1>

        {/* Resumo */}
        <div className="card p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">
            Resumo do Agendamento
          </h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">
                {agendamento.servico?.nome.includes("Sofá") ? "🛋️" : "✨"}
              </span>
              <div>
                <p className="font-semibold text-gray-900">
                  {agendamento.servico?.nome}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <FiCalendar size={16} />
              <span>
                {formatarData(agendamento.data)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <FiClock size={16} />
              <span>
                {agendamento.horaInicio} - {agendamento.horaFim}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <FiUser size={16} />
              <span>{agendamento.clienteNome}</span>
            </div>

            <div className="border-t border-gray-100 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-extrabold text-primary-600">
                  {formatarMoeda(agendamento.valorTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Botões de pagamento */}
        <div className="space-y-3">
          <button
            onClick={iniciarPagamento}
            disabled={processando}
            className="btn-success w-full text-lg !py-4 flex items-center justify-center gap-3"
          >
            {processando ? (
              <>
                <LoadingSpinner size="sm" />
                Processando...
              </>
            ) : (
              <>
                <FiCreditCard size={22} />
                Pagar com Cartão (Stripe)
              </>
            )}
          </button>

          {/* Modo desenvolvimento */}
          <button
            onClick={simularPagamento}
            disabled={processando}
            className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
          >
            🧪 Simular Pagamento (modo dev)
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 text-gray-400 text-sm">
          <FiShield size={16} />
          <span>Pagamento seguro processado pelo Stripe</span>
        </div>
      </main>

      <Footer />
    </div>
  );
}
