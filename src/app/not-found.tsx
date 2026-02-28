import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center animate-fadeIn">
          <p className="text-8xl font-extrabold text-primary-200 mb-4">404</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Página não encontrada
          </h1>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            A página que você está procurando não existe ou foi movida.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="btn-primary text-center">
              Voltar ao Início
            </Link>
            <Link href="/agendar" className="btn-secondary text-center">
              Agendar Serviço
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
