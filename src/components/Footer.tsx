import Link from "next/link";
import { FiPhone, FiMail, FiMapPin, FiInstagram } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo e descrição */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo-ecozelo.svg" alt="EcoZelo" className="h-10 w-auto rounded-lg" />
              <span className="font-bold text-lg text-white">
                EcoZelo <span className="text-primary-400">Higienização</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Higienização e impermeabilização de estofados residencial e automotivo. Limpeza profissional de vidros.
            </p>
          </div>

          {/* Links rápidos */}
          <div>
            <h3 className="text-white font-semibold mb-4">Links Rápidos</h3>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                Início
              </Link>
              <Link href="/#servicos" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                Serviços
              </Link>
              <Link href="/agendar" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                Agendar Serviço
              </Link>
            </div>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contato</h3>
            <div className="flex flex-col gap-3">
              <a href="https://wa.me/5543991583833" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-primary-400 transition-colors text-sm">
                <FiPhone size={16} />
                (43) 99158-3833
              </a>
              <a href="https://instagram.com/ecozelohigienizacao" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-primary-400 transition-colors text-sm">
                <FiInstagram size={16} />
                @ecozelohigienizacao
              </a>
              <span className="flex items-center gap-2 text-gray-400 text-sm">
                <FiMapPin size={16} />
                Cambé / Ibiporã - PR
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} EcoZelo Higienização. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
