import { cookies } from "next/headers";
import { randomBytes, createHash } from "crypto";

// Gerar token seguro aleatório
export function gerarTokenSeguro(): string {
  return randomBytes(48).toString("hex");
}

// Hash do token para armazenamento (não guardar token original)
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Armazenamento de sessão em memória (em produção usar Redis)
const sessoes = new Map<string, { criadoEm: number; expiraEm: number }>();

// Limpar sessões expiradas periodicamente
function limparSessoesExpiradas() {
  const agora = Date.now();
  const chaves = Array.from(sessoes.keys());
  for (const hash of chaves) {
    const sessao = sessoes.get(hash);
    if (sessao && agora > sessao.expiraEm) {
      sessoes.delete(hash);
    }
  }
}

// Criar nova sessão (retorna o token para enviar ao cliente)
export function criarSessao(): string {
  limparSessoesExpiradas();
  const token = gerarTokenSeguro();
  const hash = hashToken(token);
  const SETE_DIAS = 7 * 24 * 60 * 60 * 1000;

  sessoes.set(hash, {
    criadoEm: Date.now(),
    expiraEm: Date.now() + SETE_DIAS,
  });

  return token;
}

// Verificar se token é válido
export function verificarSessao(token: string): boolean {
  limparSessoesExpiradas();
  const hash = hashToken(token);
  const sessao = sessoes.get(hash);
  if (!sessao) return false;
  if (Date.now() > sessao.expiraEm) {
    sessoes.delete(hash);
    return false;
  }
  return true;
}

// Invalidar sessão (logout)
export function invalidarSessao(token: string): void {
  const hash = hashToken(token);
  sessoes.delete(hash);
}

// Verificar autenticação a partir dos cookies (para uso nos API routes)
export function verificarAuthCookie(): boolean {
  const cookieStore = cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;
  return verificarSessao(token);
}

// Constantes de cookie
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
