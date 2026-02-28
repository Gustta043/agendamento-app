"use client";

import { useState, useEffect } from "react";
import { Agendamento, formatarMoeda, formatarDataCurta } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiPhone,
  FiMapPin,
  FiMail,
  FiCheckCircle,
  FiXCircle,
  FiDollarSign,
  FiFilter,
  FiRefreshCw,
  FiHome,
  FiList,
  FiBarChart2,
} from "react-icons/fi";
import toast from "react-hot-toast";
import Link from "next/link";

type Filtro = "todos" | "pendente" | "confirmado" | "cancelado" | "concluido";

export default function AdminPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [atualizando, setAtualizando] = useState<string | null>(null);

  const carregarAgendamentos = async () => {
    setLoading(true);
    try {
      const url =
        filtro === "todos"
          ? "/api/agendamentos"
          : `/api/agendamentos?status=${filtro}`;
      const res = await fetch(url);
      const data = await res.json();
      setAgendamentos(data);
    } catch {
      toast.error("Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAgendamentos();
  }, [filtro]);

  const atualizarStatus = async (id: string, status: string) => {
    setAtualizando(id);
    try {
      const res = await fetch(`/api/agendamentos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar");

      toast.success(`Agendamento ${status === "concluido" ? "concluído" : status}!`);
      carregarAgendamentos();
    } catch {
      toast.error("Erro ao atualizar agendamento");
    } finally {
      setAtualizando(null);
    }
  };

  const statusBadge = (status: string) => {
    const config: Record<string, { class: string; label: string }> = {
      pendente: { class: "badge-pendente", label: "Pendente" },
      confirmado: { class: "badge-confirmado", label: "Confirmado" },
      cancelado: { class: "badge-cancelado", label: "Cancelado" },
      concluido: { class: "badge-concluido", label: "Concluído" },
    };
    const c = config[status] || config.pendente;
    return <span className={c.class}>{c.label}</span>;
  };

  const pagamentoBadge = (status: string) => {
    if (status === "pago") return <span className="badge-pago">💳 Pago</span>;
    return <span className="badge-pendente">⏳ Pendente</span>;
  };

  // Estatísticas
  const stats = {
    total: agendamentos.length,
    confirmados: agendamentos.filter((a) => a.status === "confirmado").length,
    pendentes: agendamentos.filter((a) => a.status === "pendente").length,
    receita: agendamentos
      .filter((a) => a.pagamentoStatus === "pago")
      .reduce((acc, a) => acc + a.valorTotal, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Admin */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo-ecozelo.svg" alt="EcoZelo" className="h-8 w-auto" />
              <h1 className="font-bold text-gray-900">EcoZelo - Painel Admin</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={carregarAgendamentos}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Atualizar"
              >
                <FiRefreshCw size={18} className={loading ? "animate-spin" : ""} />
              </button>
              <Link
                href="/"
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <FiHome size={16} />
                Site
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FiList className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <FiCheckCircle className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900">
                  {stats.confirmados}
                </p>
                <p className="text-xs text-gray-500">Confirmados</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <FiClock className="text-yellow-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900">
                  {stats.pendentes}
                </p>
                <p className="text-xs text-gray-500">Pendentes</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <FiDollarSign className="text-emerald-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900">
                  {formatarMoeda(stats.receita)}
                </p>
                <p className="text-xs text-gray-500">Receita</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <FiFilter size={16} className="text-gray-400 flex-shrink-0" />
          {(
            [
              { value: "todos", label: "Todos" },
              { value: "pendente", label: "Pendentes" },
              { value: "confirmado", label: "Confirmados" },
              { value: "concluido", label: "Concluídos" },
              { value: "cancelado", label: "Cancelados" },
            ] as { value: Filtro; label: string }[]
          ).map((f) => (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
                filtro === f.value
                  ? "bg-primary-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista de Agendamentos */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : agendamentos.length === 0 ? (
          <div className="text-center py-20">
            <FiCalendar size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400 text-lg">Nenhum agendamento encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {agendamentos.map((ag) => (
              <div key={ag.id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900">
                        {ag.servico?.nome || "Serviço"}
                      </h3>
                      {statusBadge(ag.status)}
                      {pagamentoBadge(ag.pagamentoStatus)}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <FiCalendar size={14} />
                        {formatarDataCurta(ag.data)}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <FiClock size={14} />
                        {ag.horaInicio} - {ag.horaFim}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <FiUser size={14} />
                        {ag.clienteNome}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <FiPhone size={14} />
                        {ag.clienteTelefone}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FiMapPin size={14} />
                      {ag.clienteEndereco}
                    </div>

                    <div className="flex items-center gap-2">
                      <FiDollarSign size={14} className="text-green-600" />
                      <span className="font-bold text-green-600">
                        {formatarMoeda(ag.valorTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-wrap gap-2 lg:flex-col">
                    {ag.status === "confirmado" && (
                      <button
                        onClick={() => atualizarStatus(ag.id, "concluido")}
                        disabled={atualizando === ag.id}
                        className="text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center gap-1"
                      >
                        <FiCheckCircle size={14} />
                        Concluir
                      </button>
                    )}
                    {(ag.status === "pendente" || ag.status === "confirmado") && (
                      <button
                        onClick={() => atualizarStatus(ag.id, "cancelado")}
                        disabled={atualizando === ag.id}
                        className="text-sm bg-red-50 text-red-700 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center gap-1"
                      >
                        <FiXCircle size={14} />
                        Cancelar
                      </button>
                    )}
                    <a
                      href={`https://wa.me/${ag.clienteTelefone.replace(/\D/g, "")}?text=Olá ${ag.clienteNome}! Sobre seu agendamento de ${ag.servico?.nome} no dia ${formatarDataCurta(ag.data)} às ${ag.horaInicio}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center gap-1"
                    >
                      <FiPhone size={14} />
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
