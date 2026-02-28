export interface Servico {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracao: number;
  imagem: string | null;
  ativo: boolean;
}

export interface SlotHorario {
  hora: string;
  disponivel: boolean;
}

export interface DadosAgendamento {
  servicoId: string;
  data: string;
  horaInicio: string;
  clienteNome: string;
  clienteEmail: string;
  clienteTelefone: string;
  clienteEndereco: string;
  observacoes?: string;
}

export interface Agendamento {
  id: string;
  clienteNome: string;
  clienteEmail: string;
  clienteTelefone: string;
  clienteEndereco: string;
  servicoId: string;
  servico?: Servico;
  data: string;
  horaInicio: string;
  horaFim: string;
  status: string;
  pagamentoStatus: string;
  pagamentoId: string | null;
  valorTotal: number;
  observacoes: string | null;
  criadoEm: string;
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export function formatarData(data: string | Date): string {
  const d = typeof data === "string" ? new Date(data) : data;
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatarDataCurta(data: string | Date): string {
  const d = typeof data === "string" ? new Date(data) : data;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}
