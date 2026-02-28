import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  FiCheckCircle,
  FiClock,
  FiShield,
  FiStar,
  FiArrowRight,
} from "react-icons/fi";

async function getServicos() {
  try {
    return await prisma.servico.findMany({
      where: { ativo: true },
      orderBy: { preco: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function Home() {
  const servicos = await getServicos();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <FiStar className="text-yellow-300" size={16} />
              <span className="text-sm font-medium">
                +1.100 seguidores no Instagram
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Higienização e impermeabilização de{" "}
              <span className="text-yellow-300">estofados</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8 leading-relaxed">
              Serviço profissional de higienização de estofados residencial e
              automotivo, impermeabilização e limpeza de vidros. Agende online
              de forma rápida e prática.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/agendar"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 hover:text-primary-900 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Agendar Agora
                <FiArrowRight size={20} />
              </Link>
              <a
                href="#servicos"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300"
              >
                Ver Serviços
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiCheckCircle className="text-primary-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">
                  Agendamento Online
                </h3>
                <p className="text-gray-500 text-sm">
                  Escolha o serviço, data, horário e pague tudo pelo app.
                  Simples e rápido.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiShield className="text-accent-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">
                  Produtos Ecológicos
                </h3>
                <p className="text-gray-500 text-sm">
                  Utilizamos produtos ecológicos de alta qualidade, seguros
                  para crianças e pets.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiClock className="text-yellow-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">
                  Pontualidade Garantida
                </h3>
                <p className="text-gray-500 text-sm">
                  Chegamos no horário combinado. Seu tempo é valioso para
                  nós.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section id="servicos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Nossos Serviços
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Escolha o serviço ideal para você e agende em poucos minutos
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {servicos.map((servico: { id: string; nome: string; descricao: string; preco: number; duracao: number; imagem: string | null }) => (
              <div
                key={servico.id}
                className="card hover:shadow-md transition-shadow duration-300 flex flex-col"
              >
                <div className="h-40 bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
                  <span className="text-5xl">
                    {servico.nome.includes("Sofá")
                      ? "🛋️"
                      : servico.nome.includes("Colchão")
                      ? "🛏️"
                      : servico.nome.includes("Tapete")
                      ? "🧶"
                      : servico.nome.includes("Vidro")
                      ? "🪟"
                      : servico.nome.includes("Impermeabiliza")
                      ? "💧"
                      : servico.nome.includes("Automotivo") || servico.nome.includes("Banco")
                      ? "🚗"
                      : servico.nome.includes("Cadeira")
                      ? "💺"
                      : servico.nome.includes("Poltrona")
                      ? "🪑"
                      : "✨"}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 mb-2">
                    {servico.nome}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 flex-1 line-clamp-2">
                    {servico.descricao}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-extrabold text-primary-600">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(servico.preco)}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <FiClock size={12} />
                      {servico.duracao}min
                    </span>
                  </div>
                  <Link
                    href={`/agendar?servico=${servico.id}`}
                    className="btn-primary text-center text-sm !py-2.5"
                  >
                    Agendar
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {servicos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                Nenhum serviço disponível no momento.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Execute o seed do banco de dados para criar os serviços.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Pronto para renovar seus estofados?
          </h2>
          <p className="text-gray-500 text-lg mb-8">
            Agende agora mesmo com a EcoZelo e tenha seus estofados
            higienizados por profissionais.
          </p>
          <Link
            href="/agendar"
            className="inline-flex items-center gap-2 btn-primary text-lg !px-10 !py-4"
          >
            Agendar Serviço
            <FiArrowRight size={20} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
