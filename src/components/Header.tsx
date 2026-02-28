"use client";

import Link from "next/link";
import { FiMenu, FiX, FiPhone } from "react-icons/fi";
import { useState } from "react";

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-ecozelo.svg" alt="EcoZelo" className="h-10 w-auto" />
            <div>
              <span className="font-bold text-lg text-primary-700">EcoZelo</span>
              <span className="text-sky-500 font-bold text-sm ml-1">Higienização</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              Início
            </Link>
            <Link href="/#servicos" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              Serviços
            </Link>
            <Link href="/agendar" className="btn-primary text-sm !py-2 !px-4">
              Agendar Agora
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {menuAberto ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile nav */}
        {menuAberto && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fadeIn">
            <div className="flex flex-col gap-3">
              <Link href="/" className="text-gray-600 hover:text-primary-600 font-medium py-2" onClick={() => setMenuAberto(false)}>
                Início
              </Link>
              <Link href="/#servicos" className="text-gray-600 hover:text-primary-600 font-medium py-2" onClick={() => setMenuAberto(false)}>
                Serviços
              </Link>
              <Link href="/agendar" className="btn-primary text-center text-sm" onClick={() => setMenuAberto(false)}>
                Agendar Agora
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
