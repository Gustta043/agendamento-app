"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Agendamento, formatarMoeda, formatarData } from "@/lib/types";
import {
  FiCheckCircle,
  FiCalendar,
  FiClock,
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail,
  FiHome,
} from "react-icons/fi";
import Link from "next/link";
import toast from "react-hot-toast";
import { emojiServico } from "@/lib/emojis";

export default function ConfirmacaoPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <ConfirmacaoPage />
    </Suspense>
  );
}

function ConfirmacaoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const sessionId = searchParams.get("session_id");

  const [agendamento, setAgendamento] = useState<Agendamento | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const confirmar = async () => {
      // Se veio do Stripe, confirmar pagamento
      if (sessionId) {
        try {
          await fetch("/api/pagamento/confirmar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ agendamentoId: id, sessionId }),
          });
        } catch (e) {
          console.error("Erro ao confirmar:", e);
        }
      }

      // Buscar agendamento atualizado
      try {
        const res = await fetch(`/api/agendamentos/${id}`);
        const data = await res.json();
        setAgendamento(data);
      } catch {
        toast.error("Erro ao carregar confirmação");
      } finally {
        setLoading(false);
      }
    };

    confirmar();
  }, [id, sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-500">Confirmando pagamento...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!agendamento) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Agendamento não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="text-center mb-8 animate-slideUp">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="text-green-500" size={40} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Agendamento Confirmado!
          </h1>
          <p className="text-gray-500 text-lg">
            Seu serviço foi agendado e o pagamento foi recebido com sucesso.
          </p>
        </div>

        <div className="card p-6 mb-6 animate-fadeIn">
          <div className="flex items-center gap-2 mb-4">
            <span className="badge-confirmado">✅ Confirmado</span>
            <span className="badge-pago">💳 Pago</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
              <span className="text-2xl">
                {emojiServico(agendamento.servico?.nome || "")}
              </span>
              <div>
                <p className="font-bold text-gray-900 text-lg">
                  {agendamento.servico?.nome}
                </p>
                <p className="text-sm text-gray-500">
                  Duração: {agendamento.servico?.duracao} minutos
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <FiCalendar className="text-primary-500" size={18} />
                <div>
                  <p className="text-xs text-gray-400">Data</p>
                  <p className="font-medium text-gray-900">
                    {formatarData(agendamento.data)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FiClock className="text-primary-500" size={18} />
                <div>
                  <p className="text-xs text-gray-400">Horário</p>
                  <p className="font-medium text-gray-900">
                    {agendamento.horaInicio} - {agendamento.horaFim}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FiUser className="text-primary-500" size={18} />
                <div>
                  <p className="text-xs text-gray-400">Cliente</p>
                  <p className="font-medium text-gray-900">
                    {agendamento.clienteNome}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FiPhone className="text-primary-500" size={18} />
                <div>
                  <p className="text-xs text-gray-400">Telefone</p>
                  <p className="font-medium text-gray-900">
                    {agendamento.clienteTelefone}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <FiMapPin className="text-primary-500" size={18} />
                <div>
                  <p className="text-xs text-gray-400">Endereço</p>
                  <p className="font-medium text-gray-900">
                    {agendamento.clienteEndereco}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">
                  Total Pago
                </span>
                <span className="text-2xl font-extrabold text-green-600">
                  {formatarMoeda(agendamento.valorTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-5 mb-6 bg-blue-50 border-blue-100">
          <p className="text-blue-800 text-sm">
            � O profissional entrará em contato pelo WhatsApp no dia do serviço.
            Em caso de dúvidas, entre em contato pelo{" "}
            <a
              href="https://wa.me/5543991583833"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline text-primary-600 hover:text-primary-700"
            >
              WhatsApp
            </a>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/" className="btn-primary flex-1 text-center">
            <span className="flex items-center justify-center gap-2">
              <FiHome size={18} />
              Voltar ao Início
            </span>
          </Link>
          <Link href="/agendar" className="btn-secondary flex-1 text-center">
            Agendar Outro Serviço
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
