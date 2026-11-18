import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, AlertCircle, Sparkles, Check } from 'lucide-react';
import { Cookie } from '../types';
import { formatarPreco } from '../utils/pricing';
import { useCart } from '../context/CartContext';

interface CookieModalProps {
  cookie: Cookie | null;
  onClose: () => void;
  onOpenWhatsapp?: () => void;
}

export const CookieDetailModal: React.FC<CookieModalProps> = ({ cookie, onClose, onOpenWhatsapp }) => {
  const [quantidade, setQuantidade] = useState(1);
  const [adicionado, setAdicionado] = useState(false);
  const { adicionarItem } = useCart();

  if (!cookie) return null;

  const handleAdicionar = () => {
    if (!cookie.disponivel_hoje) return;
    adicionarItem(cookie, quantidade);
    setAdicionado(true);
    setTimeout(() => {
      setAdicionado(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cookie-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative border border-cookie-200 max-h-[90vh] flex flex-col">
        
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-cookie-800 shadow-md backdrop-blur-xs transition-colors"
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Imagem */}
        <div className="relative h-56 sm:h-64 w-full bg-cookie-100 shrink-0">
          <img
            src={cookie.imagem}
            alt={cookie.nome}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          
          {/* Badges sobre a foto */}
          <div className="absolute bottom-3 left-4 flex flex-wrap gap-1.5">
            {cookie.mais_vendido && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Mais Vendido
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-cookie-900 backdrop-blur-xs">
              {cookie.categoria}
            </span>
          </div>
        </div>

        {/* Conteúdo com rolagem se necessário */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-serif text-2xl font-bold text-cookie-950">
                {cookie.nome}
              </h3>
              <p className="text-xl font-bold text-cookie-700 mt-1">
                {formatarPreco(cookie.preco)}
              </p>
            </div>

            {cookie.disponivel_hoje ? (
              <span className="shrink-0 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Fornada de Hoje ✨
              </span>
            ) : (
              <span className="shrink-0 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                Esgotado Hoje
              </span>
            )}
          </div>

          <p className="text-sm text-cookie-700 leading-relaxed">
            {cookie.descricao}
          </p>

          {/* Ingredientes */}
          {cookie.ingredientes && cookie.ingredientes.length > 0 && (
            <div className="pt-2 border-t border-cookie-100">
              <h4 className="text-xs font-bold text-cookie-800 uppercase tracking-wider mb-2">
                Ingredientes Selecionados
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {cookie.ingredientes.map((ing, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-lg bg-cookie-50 text-cookie-700 border border-cookie-200/60"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Alérgenos */}
          {cookie.alergenos && cookie.alergenos.length > 0 && (
            <div className="pt-1">
              <div className="flex items-center gap-1.5 text-xs text-cookie-500">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{cookie.alergenos.join(' • ')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé / Botão de Ação */}
        <div className="p-4 sm:p-6 bg-cookie-50 border-t border-cookie-100 mt-auto shrink-0">
          {cookie.disponivel_hoje ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-cookie-300 rounded-2xl bg-white px-2 py-1">
                <button
                  type="button"
                  onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                  className="p-2 text-cookie-700 hover:text-cookie-950 disabled:opacity-40"
                  disabled={quantidade <= 1}
                  aria-label="Diminuir"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-sm text-cookie-950 w-8 text-center">
                  {quantidade}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantidade((q) => q + 1)}
                  className="p-2 text-cookie-700 hover:text-cookie-950"
                  aria-label="Aumentar"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdicionar}
                className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md ${
                  adicionado
                    ? 'bg-emerald-600 text-white'
                    : 'bg-cookie-800 hover:bg-cookie-900 text-white'
                }`}
              >
                {adicionado ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Adicionado!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 text-amber-300" />
                    <span>Adicionar &bull; {formatarPreco(cookie.preco * quantidade)}</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-cookie-800">
                Este sabor não está disponível na fornada de hoje, mas você pode pedir sob encomenda!
              </div>
              {onOpenWhatsapp && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenWhatsapp();
                  }}
                  className="w-full py-2.5 rounded-xl border border-emerald-600 text-emerald-800 font-bold text-xs hover:bg-emerald-50 transition-colors"
                >
                  Pedir Este Sabor sob Encomenda no WhatsApp
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
