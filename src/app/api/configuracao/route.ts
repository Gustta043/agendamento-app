import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const config = await prisma.configuracaoAdmin.findFirst();

    if (!config) {
      return NextResponse.json({
        antecedenciaMinima: 24,
        antecedenciaMaxima: 30,
        intervaloSlots: 60,
      });
    }

    const disponibilidades = await prisma.disponibilidade.findMany({
      where: { ativo: true },
      orderBy: { diaSemana: "asc" },
    });

    return NextResponse.json({ ...config, disponibilidades });
  } catch (error) {
    console.error("Erro ao buscar configuração:", error);
    return NextResponse.json(
      { error: "Erro ao buscar configuração" },
      { status: 500 }
    );
  }
}
