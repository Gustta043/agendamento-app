import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const servicos = await prisma.servico.findMany({
      where: { ativo: true },
      orderBy: { preco: "asc" },
    });
    return NextResponse.json(servicos);
  } catch (error) {
    console.error("Erro ao buscar servicos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar servicos" },
      { status: 500 }
    );
  }
}
