import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Limpar dados existentes
  await prisma.agendamento.deleteMany();
  await prisma.servico.deleteMany();
  await prisma.disponibilidade.deleteMany();
  await prisma.bloqueioData.deleteMany();
  await prisma.configuracaoAdmin.deleteMany();

  // Criar configuração admin
  await prisma.configuracaoAdmin.create({
    data: {
      nomeEmpresa: "EcoZelo Higienização",
      telefoneWhatsapp: "5543991583833",
      intervaloSlots: 60,
      antecedenciaMinima: 24,
      antecedenciaMaxima: 30,
    },
  });

  // Criar serviços
  const servicos = await Promise.all([
    prisma.servico.create({
      data: {
        nome: "Higienização de Sofá (2 lugares)",
        descricao:
          "Higienização completa de sofá de 2 lugares. Aspiração, aplicação de produto ecológico, escovação e extração profunda de sujeira.",
        preco: 150.0,
        duracao: 60,
        imagem: "/images/sofa-2.jpg",
      },
    }),
    prisma.servico.create({
      data: {
        nome: "Higienização de Sofá (3 lugares)",
        descricao:
          "Higienização completa de sofá de 3 lugares. Processo completo com produtos profissionais e equipamentos de alta performance.",
        preco: 200.0,
        duracao: 90,
        imagem: "/images/sofa-3.jpg",
      },
    }),
    prisma.servico.create({
      data: {
        nome: "Higienização de Sofá (L ou Canto)",
        descricao:
          "Higienização completa de sofá em L ou de canto. Processo profissional com produtos ecológicos e equipamentos de alta performance.",
        preco: 280.0,
        duracao: 120,
        imagem: "/images/sofa-l.jpg",
      },
    }),
    prisma.servico.create({
      data: {
        nome: "Higienização de Colchão Solteiro",
        descricao:
          "Higienização profunda de colchão solteiro. Eliminação de ácaros, bactérias e manchas. Ideal para alérgicos.",
        preco: 100.0,
        duracao: 45,
        imagem: "/images/colchao-solteiro.jpg",
      },
    }),
    prisma.servico.create({
      data: {
        nome: "Higienização de Colchão Casal",
        descricao:
          "Higienização profunda de colchão casal. Eliminação de ácaros, bactérias e manchas. Ideal para alérgicos.",
        preco: 130.0,
        duracao: 60,
        imagem: "/images/colchao-casal.jpg",
      },
    }),
    prisma.servico.create({
      data: {
        nome: "Higienização de Banco Automotivo",
        descricao:
          "Higienização completa de bancos de carro. Limpeza profunda de estofados automotivos com produtos específicos.",
        preco: 180.0,
        duracao: 90,
        imagem: "/images/banco-auto.jpg",
      },
    }),
    prisma.servico.create({
      data: {
        nome: "Impermeabilização de Estofados",
        descricao:
          "Impermeabilização profissional de estofados. Proteção contra líquidos, manchas e sujeira. Prolonga a vida útil do tecido.",
        preco: 200.0,
        duracao: 60,
        imagem: "/images/impermeabilizacao.jpg",
      },
    }),
    prisma.servico.create({
      data: {
        nome: "Limpeza Profissional de Vidros",
        descricao:
          "Limpeza profissional de vidros residenciais e comerciais. Vidros cristalinos sem manchas ou marcas.",
        preco: 120.0,
        duracao: 60,
        imagem: "/images/vidros.jpg",
      },
    }),
    prisma.servico.create({
      data: {
        nome: "Higienização de Cadeira de Escritório",
        descricao:
          "Higienização completa de cadeira de escritório. Ideal para manter o ambiente de trabalho limpo e saudável.",
        preco: 60.0,
        duracao: 30,
        imagem: "/images/cadeira.jpg",
      },
    }),
    prisma.servico.create({
      data: {
        nome: "Higienização de Poltrona",
        descricao:
          "Higienização profunda de poltrona. Processo completo com aspiração, aplicação de produto e extração.",
        preco: 80.0,
        duracao: 45,
        imagem: "/images/poltrona.jpg",
      },
    }),
    prisma.servico.create({
      data: {
        nome: "Higienização de Tapete (até 4m²)",
        descricao:
          "Limpeza profissional de tapete com até 4m². Remoção de manchas, odores e sujeira impregnada.",
        preco: 120.0,
        duracao: 60,
        imagem: "/images/tapete.jpg",
      },
    }),
  ]);

  // Criar disponibilidade (Segunda a Sábado, 08:00 às 18:00)
  const diasSemana = [
    { dia: 1, nome: "Segunda" },
    { dia: 2, nome: "Terça" },
    { dia: 3, nome: "Quarta" },
    { dia: 4, nome: "Quinta" },
    { dia: 5, nome: "Sexta" },
    { dia: 6, nome: "Sábado" },
  ];

  for (const dia of diasSemana) {
    await prisma.disponibilidade.create({
      data: {
        diaSemana: dia.dia,
        horaInicio: "08:00",
        horaFim: dia.dia === 6 ? "13:00" : "18:00", // Sábado até 13h
        ativo: true,
      },
    });
  }

  console.log(`✅ ${servicos.length} serviços criados`);
  console.log(`✅ ${diasSemana.length} disponibilidades criadas`);
  console.log("✅ Configuração admin criada");
  console.log("🎉 Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
