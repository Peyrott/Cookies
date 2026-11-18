import React from 'react';
import { Plus, Sparkles, Check } from 'lucide-react';
import { Cookie } from '../types';
import { formatarPreco } from '../utils/pricing';
import { useCart } from '../context/CartContext';

interface CookieCardProps {
  cookie: Cookie;
  onSelect: (cookie: Cookie) => void;
}

export const CookieCard: React.FC<CookieCardProps> = ({ cookie, onSelect }) => {
  const { adicionarItem } = useCart();
  const [adicionado, setAdicionado] = React.useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cookie.disponivel_hoje) return;
    adicionarItem(cookie, 1);
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 800);
  };

  return (
    <div
      onClick={() => onSelect(cookie)}
      className={`group relative bg-white rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col cursor-pointer ${
        cookie.disponivel_hoje
          ? 'border-cookie-200/80 hover:border-cookie-400 hover:shadow-warm-lg hover:-translate-y-1'
          : 'border-cookie-200/50 opacity-80 bg-cookie-50/50'
      }`}
    >
      {/* Imagem do Cookie */}
      <div className="relative aspect-4/3 w-full bg-cookie-100 overflow-hidden">
        <img
          src={cookie.imagem}
          alt={cookie.nome}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            !cookie.disponivel_hoje ? 'grayscale-40' : ''
          }`}
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

        {/* Badges superiores */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          {cookie.mais_vendido && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-xs flex items-center gap-1 backdrop-blur-xs">
              <Sparkles className="w-3 h-3" /> Top 3
            </span>
          )}
          {cookie.tipo === 'sazonal' && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500 text-white shadow-xs">
              Sazonal
            </span>
          )}
          {cookie.tipo === 'especial' && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-600 text-white shadow-xs">
              Especial
            </span>
          )}
        </div>

        {/* Badge de Disponibilidade Hoje */}
        <div className="absolute top-3 right-3">
          {cookie.disponivel_hoje ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white backdrop-blur-xs">
              Fornada de Hoje
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800/85 text-white backdrop-blur-xs">
              Esgotado Hoje
            </span>
          )}
        </div>

        {/* Preço flutuante sobre a imagem no rodapé */}
        <div className="absolute bottom-3 left-3 text-white font-serif font-bold text-lg drop-shadow-md">
          {formatarPreco(cookie.preco)}
        </div>
      </div>

      {/* Conteúdo textual */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[11px] font-semibold text-cookie-500 uppercase tracking-wider block mb-1">
            {cookie.categoria}
          </span>
          <h3 className="font-serif text-lg font-bold text-cookie-950 group-hover:text-cookie-800 transition-colors line-clamp-1">
            {cookie.nome}
          </h3>
          <p className="text-xs text-cookie-600 line-clamp-2 mt-1.5 leading-relaxed">
            {cookie.descricao}
          </p>
        </div>

        {/* Botão de ação inferior */}
        <div className="pt-4 mt-2 border-t border-cookie-100 flex items-center justify-between">
          <span className="text-xs text-cookie-500 group-hover:text-cookie-800 font-medium">
            Ver detalhes &rarr;
          </span>

          {cookie.disponivel_hoje ? (
            <button
              onClick={handleQuickAdd}
              className={`p-2.5 rounded-2xl transition-all shadow-xs ${
                adicionado
                  ? 'bg-emerald-600 text-white'
                  : 'bg-cookie-100 hover:bg-cookie-800 text-cookie-900 hover:text-white'
              }`}
              title="Adicionar 1 ao carrinho"
              aria-label="Adicionar ao carrinho"
            >
              {adicionado ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          ) : (
            <span className="text-[11px] text-cookie-400 font-medium italic">
              Indisponível
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
