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
  FiLock,
  FiLogOut,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSave,
  FiX,
  FiPackage,
  FiToggleLeft,
  FiToggleRight,
  FiSettings,
  FiSlash,
} from "react-icons/fi";
import toast from "react-hot-toast";
import Link from "next/link";

interface Servico {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracao: number;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

interface Disponibilidade {
  id: string;
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  ativo: boolean;
}

interface BloqueioData {
  id: string;
  data: string;
  motivo: string | null;
}

interface Configuracao {
  id: string;
  nomeEmpresa: string;
  telefoneWhatsapp: string;
  intervaloSlots: number;
  antecedenciaMinima: number;
  antecedenciaMaxima: number;
}

type Filtro = "todos" | "pendente" | "confirmado" | "cancelado" | "concluido";
type AbaAdmin = "agendamentos" | "servicos" | "horarios" | "configuracoes";

const DIAS_SEMANA = [
  "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado",
];

const servicoVazio = {
  nome: "",
  descricao: "",
  preco: 0,
  duracao: 60,
};

export default function AdminPage() {
  // Auth state
  const [autenticado, setAutenticado] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [senha, setSenha] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard state
  const [abaAtiva, setAbaAtiva] = useState<AbaAdmin>("agendamentos");
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [atualizando, setAtualizando] = useState<string | null>(null);

  // Serviços state
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loadingServicos, setLoadingServicos] = useState(false);
  const [editandoServico, setEditandoServico] = useState<string | null>(null);
  const [novoServico, setNovoServico] = useState(false);
  const [formServico, setFormServico] = useState(servicoVazio);
  const [salvandoServico, setSalvandoServico] = useState(false);

  // Disponibilidade state
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidade[]>([]);
  const [loadingDisp, setLoadingDisp] = useState(false);
  const [novaDisp, setNovaDisp] = useState(false);
  const [formDisp, setFormDisp] = useState({ diaSemana: 1, horaInicio: "08:00", horaFim: "18:00" });

  // Bloqueios state
  const [bloqueios, setBloqueios] = useState<BloqueioData[]>([]);
  const [loadingBloq, setLoadingBloq] = useState(false);
  const [novoBloq, setNovoBloq] = useState(false);
  const [formBloq, setFormBloq] = useState({ data: "", motivo: "" });

  // Configuração state
  const [config, setConfig] = useState<Configuracao | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [salvandoConfig, setSalvandoConfig] = useState(false);

  // Verificar autenticação ao carregar
  useEffect(() => {
    fetch("/api/admin/verificar")
      .then((res) => {
        if (res.ok) setAutenticado(true);
      })
      .catch(() => {})
      .finally(() => setVerificando(false));
  }, []);

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senha.trim()) {
      toast.error("Digite a senha");
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha }),
      });

      if (!res.ok) {
        toast.error("Senha incorreta");
        return;
      }

      setAutenticado(true);
      toast.success("Login realizado com sucesso!");
    } catch {
      toast.error("Erro ao fazer login");
    } finally {
      setLoginLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setAutenticado(false);
      setSenha("");
      toast.success("Logout realizado");
    } catch {
      toast.error("Erro ao fazer logout");
    }
  };

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
    if (abaAtiva === "agendamentos") carregarAgendamentos();
  }, [filtro, abaAtiva]);

  useEffect(() => {
    if (abaAtiva === "servicos") carregarServicos();
  }, [abaAtiva]);

  useEffect(() => {
    if (abaAtiva === "horarios") {
      carregarDisponibilidades();
      carregarBloqueios();
    }
  }, [abaAtiva]);

  useEffect(() => {
    if (abaAtiva === "configuracoes") carregarConfig();
  }, [abaAtiva]);

  // ---- Serviços CRUD ----
  const carregarServicos = async () => {
    setLoadingServicos(true);
    try {
      const res = await fetch("/api/admin/servicos");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setServicos(data);
    } catch {
      toast.error("Erro ao carregar serviços");
    } finally {
      setLoadingServicos(false);
    }
  };

  const iniciarEdicao = (s: Servico) => {
    setEditandoServico(s.id);
    setNovoServico(false);
    setFormServico({
      nome: s.nome,
      descricao: s.descricao,
      preco: s.preco,
      duracao: s.duracao,
    });
  };

  const iniciarNovo = () => {
    setNovoServico(true);
    setEditandoServico(null);
    setFormServico(servicoVazio);
  };

  const cancelarForm = () => {
    setNovoServico(false);
    setEditandoServico(null);
    setFormServico(servicoVazio);
  };

  const salvarServico = async () => {
    if (!formServico.nome.trim() || !formServico.descricao.trim()) {
      toast.error("Preencha o nome e a descrição");
      return;
    }
    if (formServico.preco <= 0) {
      toast.error("O preço deve ser maior que zero");
      return;
    }

    setSalvandoServico(true);
    try {
      if (novoServico) {
        const res = await fetch("/api/admin/servicos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formServico),
        });
        if (!res.ok) throw new Error();
        toast.success("Serviço criado com sucesso!");
      } else if (editandoServico) {
        const res = await fetch(`/api/admin/servicos/${editandoServico}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formServico),
        });
        if (!res.ok) throw new Error();
        toast.success("Serviço atualizado!");
      }
      cancelarForm();
      carregarServicos();
    } catch {
      toast.error("Erro ao salvar serviço");
    } finally {
      setSalvandoServico(false);
    }
  };

  const toggleAtivoServico = async (s: Servico) => {
    try {
      const res = await fetch(`/api/admin/servicos/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !s.ativo }),
      });
      if (!res.ok) throw new Error();
      toast.success(s.ativo ? "Serviço desativado" : "Serviço ativado");
      carregarServicos();
    } catch {
      toast.error("Erro ao atualizar serviço");
    }
  };

  const excluirServico = async (s: Servico) => {
    if (!confirm(`Tem certeza que deseja excluir "${s.nome}"?`)) return;
    try {
      const res = await fetch(`/api/admin/servicos/${s.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.aviso) {
        toast(data.aviso, { icon: "⚠️", duration: 5000 });
      } else {
        toast.success("Serviço excluído!");
      }
      carregarServicos();
    } catch {
      toast.error("Erro ao excluir serviço");
    }
  };

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

  // ---- Disponibilidades ----
  const carregarDisponibilidades = async () => {
    setLoadingDisp(true);
    try {
      const res = await fetch("/api/admin/disponibilidade");
      if (!res.ok) throw new Error();
      setDisponibilidades(await res.json());
    } catch {
      toast.error("Erro ao carregar horários");
    } finally {
      setLoadingDisp(false);
    }
  };

  const criarDisponibilidade = async () => {
    try {
      const res = await fetch("/api/admin/disponibilidade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formDisp),
      });
      if (!res.ok) throw new Error();
      toast.success("Horário adicionado!");
      setNovaDisp(false);
      setFormDisp({ diaSemana: 1, horaInicio: "08:00", horaFim: "18:00" });
      carregarDisponibilidades();
    } catch {
      toast.error("Erro ao adicionar horário");
    }
  };

  const toggleDisponibilidade = async (d: Disponibilidade) => {
    try {
      const res = await fetch(`/api/admin/disponibilidade/${d.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !d.ativo }),
      });
      if (!res.ok) throw new Error();
      toast.success(d.ativo ? "Horário desativado" : "Horário ativado");
      carregarDisponibilidades();
    } catch {
      toast.error("Erro ao atualizar horário");
    }
  };

  const excluirDisponibilidade = async (d: Disponibilidade) => {
    if (!confirm(`Excluir horário de ${DIAS_SEMANA[d.diaSemana]}?`)) return;
    try {
      await fetch(`/api/admin/disponibilidade/${d.id}`, { method: "DELETE" });
      toast.success("Horário excluído!");
      carregarDisponibilidades();
    } catch {
      toast.error("Erro ao excluir horário");
    }
  };

  // ---- Bloqueios de Data ----
  const carregarBloqueios = async () => {
    setLoadingBloq(true);
    try {
      const res = await fetch("/api/admin/bloqueios");
      if (!res.ok) throw new Error();
      setBloqueios(await res.json());
    } catch {
      toast.error("Erro ao carregar bloqueios");
    } finally {
      setLoadingBloq(false);
    }
  };

  const criarBloqueio = async () => {
    if (!formBloq.data) {
      toast.error("Selecione uma data");
      return;
    }
    try {
      const res = await fetch("/api/admin/bloqueios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formBloq),
      });
      if (!res.ok) throw new Error();
      toast.success("Data bloqueada!");
      setNovoBloq(false);
      setFormBloq({ data: "", motivo: "" });
      carregarBloqueios();
    } catch {
      toast.error("Erro ao bloquear data");
    }
  };

  const excluirBloqueio = async (b: BloqueioData) => {
    try {
      await fetch(`/api/admin/bloqueios/${b.id}`, { method: "DELETE" });
      toast.success("Bloqueio removido!");
      carregarBloqueios();
    } catch {
      toast.error("Erro ao remover bloqueio");
    }
  };

  // ---- Configuração ----
  const carregarConfig = async () => {
    setLoadingConfig(true);
    try {
      const res = await fetch("/api/admin/configuracao");
      if (!res.ok) throw new Error();
      setConfig(await res.json());
    } catch {
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoadingConfig(false);
    }
  };

  const salvarConfig = async () => {
    if (!config) return;
    setSalvandoConfig(true);
    try {
      const res = await fetch("/api/admin/configuracao", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error();
      toast.success("Configurações salvas!");
      setConfig(await res.json());
    } catch {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSalvandoConfig(false);
    }
  };

  const statusBadge = (status: string) => {
    const badgeConfig: Record<string, { class: string; label: string }> = {
      pendente: { class: "badge-pendente", label: "Pendente" },
      confirmado: { class: "badge-confirmado", label: "Confirmado" },
      cancelado: { class: "badge-cancelado", label: "Cancelado" },
      concluido: { class: "badge-concluido", label: "Concluído" },
    };
    const c = badgeConfig[status] || badgeConfig.pendente;
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

  // Tela de verificação
  if (verificando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Tela de login
  if (!autenticado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="card p-8 w-full max-w-sm animate-fadeIn">
          <div className="text-center mb-6">
            <img src="/logo-ecozelo.svg" alt="EcoZelo" className="h-16 w-auto mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="text-gray-500 text-sm mt-1">Digite a senha para acessar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label flex items-center gap-1">
                <FiLock size={14} /> Senha
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Digite a senha de acesso"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Entrando...
                </>
              ) : (
                <>
                  <FiLock size={16} />
                  Entrar
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
              ← Voltar ao site
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors"
                title="Sair"
              >
                <FiLogOut size={16} />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Abas */}
        <div className="flex gap-1 mb-8 bg-white rounded-xl p-1 shadow-sm border border-gray-200 w-fit">
          <button
            onClick={() => setAbaAtiva("agendamentos")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              abaAtiva === "agendamentos"
                ? "bg-primary-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FiCalendar size={16} />
            Agendamentos
          </button>
          <button
            onClick={() => setAbaAtiva("servicos")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              abaAtiva === "servicos"
                ? "bg-primary-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FiPackage size={16} />
            Serviços
          </button>
          <button
            onClick={() => setAbaAtiva("horarios")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              abaAtiva === "horarios"
                ? "bg-primary-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FiClock size={16} />
            Horários
          </button>
          <button
            onClick={() => setAbaAtiva("configuracoes")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              abaAtiva === "configuracoes"
                ? "bg-primary-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FiSettings size={16} />
            Config
          </button>
        </div>

        {abaAtiva === "agendamentos" && (<>
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
        </>)}

        {/* ===== ABA SERVIÇOS ===== */}
        {abaAtiva === "servicos" && (
          <div className="space-y-6">
            {/* Header + Botão Novo */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Gerenciar Serviços</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {servicos.length} serviço{servicos.length !== 1 ? "s" : ""} cadastrado{servicos.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={iniciarNovo}
                className="btn-primary flex items-center gap-2"
                disabled={novoServico}
              >
                <FiPlus size={16} />
                Novo Serviço
              </button>
            </div>

            {/* Formulário Novo Serviço */}
            {novoServico && (
              <div className="card p-6 border-2 border-primary-200 bg-primary-50/30">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiPlus size={16} className="text-primary-600" />
                  Novo Serviço
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Nome *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Ex: Higienização de Sofá 3 Lugares"
                      value={formServico.nome}
                      onChange={(e) => setFormServico({ ...formServico, nome: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Descrição *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Ex: Limpeza profunda com extratora"
                      value={formServico.descricao}
                      onChange={(e) => setFormServico({ ...formServico, descricao: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Preço (R$) *</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="0,00"
                      min="0"
                      step="0.01"
                      value={formServico.preco || ""}
                      onChange={(e) => setFormServico({ ...formServico, preco: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="label">Duração (minutos) *</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="60"
                      min="15"
                      step="15"
                      value={formServico.duracao || ""}
                      onChange={(e) => setFormServico({ ...formServico, duracao: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={salvarServico}
                    disabled={salvandoServico}
                    className="btn-primary flex items-center gap-2"
                  >
                    {salvandoServico ? <LoadingSpinner size="sm" /> : <FiSave size={16} />}
                    Salvar
                  </button>
                  <button
                    onClick={cancelarForm}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                  >
                    <FiX size={16} />
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Lista de Serviços */}
            {loadingServicos ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" />
              </div>
            ) : servicos.length === 0 ? (
              <div className="text-center py-20">
                <FiPackage size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-400 text-lg">Nenhum serviço cadastrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {servicos.map((s) => (
                  <div
                    key={s.id}
                    className={`card p-5 transition-shadow hover:shadow-md ${
                      !s.ativo ? "opacity-60 bg-gray-50" : ""
                    } ${editandoServico === s.id ? "ring-2 ring-primary-400" : ""}`}
                  >
                    {editandoServico === s.id ? (
                      /* Modo de edição */
                      <div>
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <FiEdit2 size={16} className="text-primary-600" />
                          Editando Serviço
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="label">Nome</label>
                            <input
                              type="text"
                              className="input-field"
                              value={formServico.nome}
                              onChange={(e) => setFormServico({ ...formServico, nome: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="label">Descrição</label>
                            <input
                              type="text"
                              className="input-field"
                              value={formServico.descricao}
                              onChange={(e) => setFormServico({ ...formServico, descricao: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="label">Preço (R$)</label>
                            <input
                              type="number"
                              className="input-field"
                              min="0"
                              step="0.01"
                              value={formServico.preco || ""}
                              onChange={(e) => setFormServico({ ...formServico, preco: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                          <div>
                            <label className="label">Duração (min)</label>
                            <input
                              type="number"
                              className="input-field"
                              min="15"
                              step="15"
                              value={formServico.duracao || ""}
                              onChange={(e) => setFormServico({ ...formServico, duracao: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={salvarServico}
                            disabled={salvandoServico}
                            className="btn-primary flex items-center gap-2"
                          >
                            {salvandoServico ? <LoadingSpinner size="sm" /> : <FiSave size={16} />}
                            Salvar
                          </button>
                          <button
                            onClick={cancelarForm}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                          >
                            <FiX size={16} />
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Modo de visualização */
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-900">{s.nome}</h3>
                            {!s.ativo && (
                              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                                Inativo
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{s.descricao}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="font-bold text-green-600">
                              {formatarMoeda(s.preco)}
                            </span>
                            <span className="text-gray-400 flex items-center gap-1">
                              <FiClock size={14} />
                              {s.duracao} min
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleAtivoServico(s)}
                            className={`p-2 rounded-lg transition-colors ${
                              s.ativo
                                ? "text-green-600 hover:bg-green-50"
                                : "text-gray-400 hover:bg-gray-100"
                            }`}
                            title={s.ativo ? "Desativar" : "Ativar"}
                          >
                            {s.ativo ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                          </button>
                          <button
                            onClick={() => iniciarEdicao(s)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => excluirServico(s)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== ABA HORÁRIOS ===== */}
        {abaAtiva === "horarios" && (
          <div className="space-y-8">
            {/* Disponibilidade Semanal */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Horários de Funcionamento</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Defina os dias e horários disponíveis para agendamento
                  </p>
                </div>
                <button
                  onClick={() => setNovaDisp(true)}
                  className="btn-primary flex items-center gap-2"
                  disabled={novaDisp}
                >
                  <FiPlus size={16} />
                  Novo Horário
                </button>
              </div>

              {novaDisp && (
                <div className="card p-6 border-2 border-primary-200 bg-primary-50/30 mb-4">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiPlus size={16} className="text-primary-600" />
                    Novo Horário
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">Dia da Semana</label>
                      <select
                        className="input-field"
                        value={formDisp.diaSemana}
                        onChange={(e) => setFormDisp({ ...formDisp, diaSemana: Number(e.target.value) })}
                      >
                        {DIAS_SEMANA.map((dia, i) => (
                          <option key={i} value={i}>{dia}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Hora Início</label>
                      <input
                        type="time"
                        className="input-field"
                        value={formDisp.horaInicio}
                        onChange={(e) => setFormDisp({ ...formDisp, horaInicio: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label">Hora Fim</label>
                      <input
                        type="time"
                        className="input-field"
                        value={formDisp.horaFim}
                        onChange={(e) => setFormDisp({ ...formDisp, horaFim: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={criarDisponibilidade} className="btn-primary flex items-center gap-2">
                      <FiSave size={16} /> Salvar
                    </button>
                    <button
                      onClick={() => setNovaDisp(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                    >
                      <FiX size={16} /> Cancelar
                    </button>
                  </div>
                </div>
              )}

              {loadingDisp ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : disponibilidades.length === 0 ? (
                <div className="text-center py-12">
                  <FiClock size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-400 text-lg">Nenhum horário configurado</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {disponibilidades.map((d) => (
                    <div
                      key={d.id}
                      className={`card p-4 flex items-center justify-between ${!d.ativo ? "opacity-60 bg-gray-50" : ""}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`font-bold text-sm w-20 ${d.ativo ? "text-gray-900" : "text-gray-400"}`}>
                          {DIAS_SEMANA[d.diaSemana]}
                        </span>
                        <span className="text-gray-600 flex items-center gap-1">
                          <FiClock size={14} />
                          {d.horaInicio} - {d.horaFim}
                        </span>
                        {!d.ativo && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Inativo</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleDisponibilidade(d)}
                          className={`p-2 rounded-lg transition-colors ${
                            d.ativo ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"
                          }`}
                          title={d.ativo ? "Desativar" : "Ativar"}
                        >
                          {d.ativo ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                        </button>
                        <button
                          onClick={() => excluirDisponibilidade(d)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bloqueios de Data */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Datas Bloqueadas</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Bloqueie dias específicos (feriados, folgas, etc.)
                  </p>
                </div>
                <button
                  onClick={() => setNovoBloq(true)}
                  className="btn-primary flex items-center gap-2"
                  disabled={novoBloq}
                >
                  <FiPlus size={16} />
                  Bloquear Data
                </button>
              </div>

              {novoBloq && (
                <div className="card p-6 border-2 border-red-200 bg-red-50/30 mb-4">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiSlash size={16} className="text-red-600" />
                    Bloquear Data
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Data *</label>
                      <input
                        type="date"
                        className="input-field"
                        value={formBloq.data}
                        onChange={(e) => setFormBloq({ ...formBloq, data: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label">Motivo (opcional)</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Ex: Feriado, Folga pessoal..."
                        value={formBloq.motivo}
                        onChange={(e) => setFormBloq({ ...formBloq, motivo: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={criarBloqueio} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
                      <FiSlash size={16} /> Bloquear
                    </button>
                    <button
                      onClick={() => setNovoBloq(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                    >
                      <FiX size={16} /> Cancelar
                    </button>
                  </div>
                </div>
              )}

              {loadingBloq ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : bloqueios.length === 0 ? (
                <div className="text-center py-8 card">
                  <FiCheckCircle size={32} className="mx-auto text-green-400 mb-2" />
                  <p className="text-gray-400">Nenhuma data bloqueada</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {bloqueios.map((b) => (
                    <div key={b.id} className="card p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-red-600 flex items-center gap-1">
                          <FiSlash size={16} />
                          {new Date(b.data).toLocaleDateString("pt-BR", {
                            weekday: "long",
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        {b.motivo && (
                          <span className="text-sm text-gray-500">— {b.motivo}</span>
                        )}
                      </div>
                      <button
                        onClick={() => excluirBloqueio(b)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover bloqueio"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== ABA CONFIGURAÇÕES ===== */}
        {abaAtiva === "configuracoes" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Configurações do Sistema</h2>
            <p className="text-sm text-gray-500 mb-6">
              Ajuste as configurações gerais do agendamento
            </p>

            {loadingConfig ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" />
              </div>
            ) : config ? (
              <div className="card p-6 max-w-2xl">
                <div className="space-y-5">
                  <div>
                    <label className="label">Nome da Empresa</label>
                    <input
                      type="text"
                      className="input-field"
                      value={config.nomeEmpresa}
                      onChange={(e) => setConfig({ ...config, nomeEmpresa: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">WhatsApp (com DDD)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="5543991583833"
                      value={config.telefoneWhatsapp}
                      onChange={(e) => setConfig({ ...config, telefoneWhatsapp: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="label">Intervalo entre Slots (min)</label>
                      <input
                        type="number"
                        className="input-field"
                        min="15"
                        step="15"
                        value={config.intervaloSlots}
                        onChange={(e) => setConfig({ ...config, intervaloSlots: parseInt(e.target.value) || 30 })}
                      />
                      <p className="text-xs text-gray-400 mt-1">Ex: 30 = slots a cada 30 min</p>
                    </div>
                    <div>
                      <label className="label">Antecedência Mínima (h)</label>
                      <input
                        type="number"
                        className="input-field"
                        min="1"
                        value={config.antecedenciaMinima}
                        onChange={(e) => setConfig({ ...config, antecedenciaMinima: parseInt(e.target.value) || 24 })}
                      />
                      <p className="text-xs text-gray-400 mt-1">Horas antes do horário</p>
                    </div>
                    <div>
                      <label className="label">Antecedência Máxima (dias)</label>
                      <input
                        type="number"
                        className="input-field"
                        min="1"
                        value={config.antecedenciaMaxima}
                        onChange={(e) => setConfig({ ...config, antecedenciaMaxima: parseInt(e.target.value) || 30 })}
                      />
                      <p className="text-xs text-gray-400 mt-1">Dias no futuro para agendar</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={salvarConfig}
                      disabled={salvandoConfig}
                      className="btn-primary flex items-center gap-2"
                    >
                      {salvandoConfig ? <LoadingSpinner size="sm" /> : <FiSave size={16} />}
                      Salvar Configurações
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <FiSettings size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-400 text-lg">Configuração não encontrada</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
