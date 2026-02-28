// Mapeamento unificado de emojis por tipo de serviço
const emojiMap: Record<string, string> = {
  Sofá: "🛋️",
  Colchão: "🛏️",
  Cadeira: "🪑",
  Poltrona: "🛋️",
  Tapete: "🧶",
  Automotivo: "🚗",
  Banco: "🚗",
  Vidro: "🪟",
  Impermeabiliza: "💧",
};

export function emojiServico(nomeServico: string): string {
  for (const [chave, emoji] of Object.entries(emojiMap)) {
    if (nomeServico.includes(chave)) return emoji;
  }
  return "✨";
}
