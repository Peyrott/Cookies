import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Menu, 
  X, 
  Award, 
  User, 
  Sparkles, 
  Phone, 
  ShieldCheck, 
  Package
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatarPreco } from '../utils/pricing';

interface NavbarProps {
  onOpenWhatsappModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenWhatsappModal }) => {
  const [menuAberto, setMenuAberto] = useState(false);
  const { quantidadeTotalItens, totais } = useCart();
  const { perfil, isAdmin, setRole } = useAuth();
  const location = useLocation();

  const rotas = [
    { caminho: '/', label: 'Início' },
    { caminho: '/cardapio', label: 'Cardápio' },
    { caminho: '/monte-seu-kit', label: 'Monte seu Kit', destaque: true },
    { caminho: '/sobre-faq', label: 'Sobre & FAQ' },
    { caminho: '/minha-conta', label: 'Fidelidade & Conta' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-cookie-200/60 shadow-sm transition-all">
      {/* Barra superior de aviso/benefício */}
      <div className="bg-gradient-to-r from-cookie-800 via-cookie-900 to-cookie-800 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
        <span>
          Entrega <strong>GRÁTIS</strong> na Unisinos (Portão B - Florindas) &bull; Ganhe pontos a cada cookie!
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Marca */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-cookie-700/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <span className="text-2xl sm:text-3xl select-none transform -rotate-12 group-hover:rotate-0 transition-transform">🍪</span>
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-cookie-900 block leading-none">
                Gabi Cookies
              </span>
              <span className="text-[10px] sm:text-xs text-cookie-600 font-medium tracking-wider uppercase block">
                Artesanais & Recheados
              </span>
            </div>
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {rotas.map((rota) => {
              const ativo = location.pathname === rota.caminho;
              return (
                <Link
                  key={rota.caminho}
                  to={rota.caminho}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                    ativo
                      ? 'bg-cookie-800 text-white shadow-sm'
                      : rota.destaque
                      ? 'bg-amber-100 text-cookie-900 hover:bg-amber-200 font-semibold'
                      : 'text-cookie-800 hover:bg-cookie-100/70 hover:text-cookie-950'
                  }`}
                >
                  {rota.label}
                </Link>
              );
            })}
          </nav>

          {/* Ações da Direita */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Seletor Rápido de Papel (Cliente vs Admin Gabi para testes) */}
            <div className="hidden lg:flex items-center bg-cookie-100 rounded-full p-1 text-xs border border-cookie-200">
              <button
                onClick={() => setRole('cliente')}
                className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                  !isAdmin ? 'bg-white text-cookie-900 shadow-xs' : 'text-cookie-600 hover:text-cookie-900'
                }`}
                title="Visualizar como Cliente"
              >
                Cliente
              </button>
              <button
                onClick={() => setRole('admin')}
                className={`px-2.5 py-1 rounded-full font-medium transition-all flex items-center gap-1 ${
                  isAdmin ? 'bg-cookie-800 text-white shadow-xs' : 'text-cookie-600 hover:text-cookie-900'
                }`}
                title="Acessar como Gabi (Admin)"
              >
                <ShieldCheck className="w-3 h-3 text-amber-300" />
                Painel Gabi
              </button>
            </div>

            {/* Link direto para Painel Admin se for admin */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span>Painel Admin</span>
              </Link>
            )}

            {/* Botão de Encomenda Especial WhatsApp */}
            <button
              onClick={onOpenWhatsappModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              title="Fazer pedido especial ou sob medida"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pedido Especial</span>
            </button>

            {/* Saldo de Pontos Rápido */}
            <Link
              to="/minha-conta"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-cookie-800 hover:bg-amber-100 transition-all text-xs font-medium"
              title="Seu saldo de fidelidade"
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-bold text-cookie-950">{perfil.saldo_pontos} pts</span>
            </Link>

            {/* Botão Carrinho */}
            <Link
              to="/carrinho"
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-cookie-800 hover:bg-cookie-900 text-white shadow-warm hover:shadow-warm-lg transition-all"
              aria-label="Carrinho de compras"
            >
              <ShoppingBag className="w-5 h-5 text-amber-300" />
              <span className="font-bold text-sm hidden sm:inline">
                {totais.total > 0 ? formatarPreco(totais.total) : 'Carrinho'}
              </span>
              {quantidadeTotalItens > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {quantidadeTotalItens}
                </span>
              )}
            </Link>

            {/* Botão Hamburguer Mobile */}
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="md:hidden p-2 rounded-xl text-cookie-700 hover:bg-cookie-100 focus:outline-hidden"
              aria-label="Abrir menu"
            >
              {menuAberto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile Lateral / Dropdown */}
      {menuAberto && (
        <div className="md:hidden border-t border-cookie-200 bg-white/98 px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top duration-200">
          
          {/* Seletor de Perfil no mobile */}
          <div className="flex items-center justify-between p-2.5 bg-cookie-100/70 rounded-xl text-xs">
            <span className="font-medium text-cookie-700">Alternar Perfil:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setRole('cliente')}
                className={`px-3 py-1 rounded-lg font-medium ${
                  !isAdmin ? 'bg-white text-cookie-950 shadow-xs' : 'text-cookie-600'
                }`}
              >
                Cliente
              </button>
              <button
                onClick={() => setRole('admin')}
                className={`px-3 py-1 rounded-lg font-medium ${
                  isAdmin ? 'bg-cookie-800 text-white shadow-xs' : 'text-cookie-600'
                }`}
              >
                Gabi (Admin)
              </button>
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            {rotas.map((rota) => {
              const ativo = location.pathname === rota.caminho;
              return (
                <Link
                  key={rota.caminho}
                  to={rota.caminho}
                  onClick={() => setMenuAberto(false)}
                  className={`px-4 py-3 rounded-xl text-base font-medium flex items-center justify-between ${
                    ativo
                      ? 'bg-cookie-800 text-white'
                      : rota.destaque
                      ? 'bg-amber-100/70 text-cookie-950 font-semibold'
                      : 'text-cookie-800 hover:bg-cookie-100'
                  }`}
                >
                  <span>{rota.label}</span>
                  {rota.destaque && (
                    <span className="text-xs bg-amber-200 text-cookie-900 px-2 py-0.5 rounded-full font-bold">
                      Desconto
                    </span>
                  )}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMenuAberto(false)}
                className="px-4 py-3 rounded-xl text-base font-semibold text-rose-800 bg-rose-50 flex items-center justify-between border border-rose-200"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-rose-600" />
                  <span>Painel Administrativo</span>
                </div>
                <span className="text-xs bg-rose-200 px-2 py-0.5 rounded-full">Admin</span>
              </Link>
            )}
          </div>

          <div className="pt-2 border-t border-cookie-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMenuAberto(false);
                onOpenWhatsappModal();
              }}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Pedido Especial no WhatsApp</span>
            </button>
            <div className="text-xs text-center text-cookie-600 pt-1">
              Olá, <strong>{perfil.nome}</strong> &bull; Saldo: <strong>{perfil.saldo_pontos} pontos</strong>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
