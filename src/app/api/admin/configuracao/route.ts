import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verificarAuthCookie } from "@/lib/auth";

// GET - Buscar configuração
export async function GET() {
  if (!verificarAuthCookie()) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const config = await prisma.configuracaoAdmin.findFirst();
    return NextResponse.json(config);
  } catch (error) {
    console.error("Erro ao buscar configuração:", error);
    return NextResponse.json(
      { error: "Erro ao buscar configuração" },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar configuração
export async function PATCH(request: NextRequest) {
  if (!verificarAuthCookie()) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { nomeEmpresa, telefoneWhatsapp, intervaloSlots, antecedenciaMinima, antecedenciaMaxima } = body;

    // Buscar config existente
    let config = await prisma.configuracaoAdmin.findFirst();

    if (!config) {
      config = await prisma.configuracaoAdmin.create({
        data: {
          nomeEmpresa: nomeEmpresa || "EcoZelo Higienização",
          telefoneWhatsapp: telefoneWhatsapp || "",
          intervaloSlots: Number(intervaloSlots) || 30,
          antecedenciaMinima: Number(antecedenciaMinima) || 24,
          antecedenciaMaxima: Number(antecedenciaMaxima) || 30,
        },
      });
      return NextResponse.json(config);
    }

    const data: Record<string, unknown> = {};
    if (nomeEmpresa !== undefined) data.nomeEmpresa = nomeEmpresa;
    if (telefoneWhatsapp !== undefined) data.telefoneWhatsapp = telefoneWhatsapp;
    if (intervaloSlots !== undefined) data.intervaloSlots = Number(intervaloSlots);
    if (antecedenciaMinima !== undefined) data.antecedenciaMinima = Number(antecedenciaMinima);
    if (antecedenciaMaxima !== undefined) data.antecedenciaMaxima = Number(antecedenciaMaxima);

    const updated = await prisma.configuracaoAdmin.update({
      where: { id: config.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar configuração:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar configuração" },
      { status: 500 }
    );
  }
}
