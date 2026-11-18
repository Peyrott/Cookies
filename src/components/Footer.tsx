import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Instagram, MessageCircle, MapPin, Sparkles, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

interface FooterProps {
  onOpenWhatsappModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenWhatsappModal }) => {
  const { config } = useStore();
  const { setRole } = useAuth();

  return (
    <footer className="bg-cookie-950 text-cookie-200 border-t border-cookie-900 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Coluna 1: Marca */}
          <div className="space-y-3 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-3xl">🍪</span>
              <span className="font-serif text-2xl font-bold text-white tracking-tight">
                Gabi Cookies
              </span>
            </Link>
            <p className="text-xs text-cookie-300 leading-relaxed font-light">
              Cookies artesanais recheados assados diariamente com amor, ovos frescos, pura manteiga e chocolates nobres.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={onOpenWhatsappModal}
                className="w-8 h-8 rounded-full bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <a
                href={`https://instagram.com/${config.instagram_gabi || 'gabicookies_artesanal'}`}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-pink-600/30 hover:bg-pink-600 text-pink-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Coluna 2: Navegação */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-white text-sm uppercase tracking-wider">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs text-cookie-300">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Início</Link>
              </li>
              <li>
                <Link to="/cardapio" className="hover:text-white transition-colors">Cardápio do Dia</Link>
              </li>
              <li>
                <Link to="/monte-seu-kit" className="hover:text-white transition-colors">Monte seu Kit</Link>
              </li>
              <li>
                <Link to="/sobre-faq" className="hover:text-white transition-colors">Nossa História & FAQ</Link>
              </li>
              <li>
                <Link to="/minha-conta" className="hover:text-white transition-colors">Cartão Fidelidade & Conta</Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Retirada & Entrega */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-white text-sm uppercase tracking-wider">
              Pontos & Entregas
            </h4>
            <div className="space-y-2 text-xs text-cookie-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Entrega Grátis:</strong> Campus Unisinos São Leopoldo (Portão B - Florindas).
                </span>
              </div>
              <p className="text-cookie-400">
                Entregas por km em toda a região de São Leopoldo e Vale dos Sinos.
              </p>
              <p className="text-cookie-400">
                Pedidos para o mesmo dia, avisamos no WhatsApp quando estiver saindo do forno!
              </p>
            </div>
          </div>

          {/* Coluna 4: Programa de Fidelidade */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-white text-sm uppercase tracking-wider">
              Vantagens
            </h4>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-xs space-y-1.5 text-cookie-300">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>10 Dias = 1 Cookie Grátis</span>
              </div>
              <p className="text-[11px] text-cookie-300">
                +1 ponto por cookie comprado. Cada ponto vale 1% de desconto até 100%!
              </p>
            </div>

            <div className="pt-1">
              <button
                onClick={() => {
                  setRole('admin');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-[11px] text-cookie-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Acesso Painel da Gabi (Admin)</span>
              </button>
            </div>
          </div>

        </div>

        {/* Linha Inferior */}
        <div className="pt-6 border-t border-cookie-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cookie-400">
          <p>
            &copy; {new Date().getFullYear()} Gabi Cookies. Todos os direitos reservados.
          </p>
          <p className="flex items-center gap-1 text-[11px]">
            <span>Feito com</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>em São Leopoldo - RS</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
