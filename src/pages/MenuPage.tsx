import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Sparkles, Filter, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CookieCard } from '../components/CookieCard';
import { Cookie } from '../types';

interface MenuPageProps {
  onSelectCookie: (cookie: Cookie) => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({ onSelectCookie }) => {
  const { cookies, categorias } = useStore();
  const [searchParams] = useSearchParams();
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('todas');

  // Ref para controlar rolagem
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const catUrl = searchParams.get('categoria');
    if (catUrl) {
      setCategoriaAtiva(catUrl);
      setTimeout(() => {
        const el = categoryRefs.current[catUrl];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [searchParams]);

  // Filtragem dos cookies
  const cookiesFiltrados = useMemo(() => {
    return cookies.filter((cookie) => {
      const matchBusca =
        cookie.nome.toLowerCase().includes(busca.toLowerCase()) ||
        cookie.descricao.toLowerCase().includes(busca.toLowerCase());
      const matchCategoria =
        categoriaAtiva === 'todas' || cookie.categoria_id === categoriaAtiva;

      return matchBusca && matchCategoria;
    });
  }, [cookies, busca, categoriaAtiva]);

  // Agrupamento por categoria quando visualizando todas
  const cookiesPorCategoria = useMemo(() => {
    const mapa: Record<string, Cookie[]> = {};
    for (const cat of categorias) {
      mapa[cat.id] = cookies.filter((c) => {
        const matchBusca =
          c.nome.toLowerCase().includes(busca.toLowerCase()) ||
          c.descricao.toLowerCase().includes(busca.toLowerCase());
        return c.categoria_id === cat.id && matchBusca;
      });
    }
    return mapa;
  }, [cookies, categorias, busca]);

  return (
    <div className="space-y-8 sm:space-y-10 pb-16">
      
      {/* Cabeçalho da Página */}
      <div className="text-center max-w-2xl mx-auto space-y-3 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-cookie-900 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Fornadas Diárias &bull; Ingredientes Selecionados</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-cookie-950">
          Nosso Cardápio
        </h1>
        <p className="text-sm sm:text-base text-cookie-600">
          Escolha cookies individuais ou clique em "Monte seu Kit" para garantir seu desconto de até R$ 6,00!
        </p>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="sticky top-20 z-30 bg-cookie-50/95 backdrop-blur-md py-3 -mx-4 px-4 sm:mx-0 sm:px-0 space-y-3">
        <div className="max-w-xl mx-auto relative">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-cookie-400" />
          <input
            type="text"
            placeholder="Buscar por sabor, recheio ou ingrediente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-cookie-200/90 text-sm shadow-xs focus:outline-hidden focus:border-cookie-700 focus:ring-2 focus:ring-cookie-700/20"
          />
          {busca && (
            <button
              onClick={() => setBusca('')}
              className="absolute right-4 top-3 text-xs text-cookie-400 hover:text-cookie-700 font-bold"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Abas de Categorias */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setCategoriaAtiva('todas')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              categoriaAtiva === 'todas'
                ? 'bg-cookie-800 text-white shadow-xs'
                : 'bg-white text-cookie-700 border border-cookie-200 hover:bg-cookie-100'
            }`}
          >
            Todos os Sabores ({cookies.length})
          </button>

          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategoriaAtiva(cat.id);
                const el = categoryRefs.current[cat.id];
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                categoriaAtiva === cat.id
                  ? 'bg-cookie-800 text-white shadow-xs'
                  : 'bg-white text-cookie-700 border border-cookie-200 hover:bg-cookie-100'
              }`}
            >
              {cat.nome}
            </button>
          ))}
        </div>
      </div>

      {/* Listagem de Cookies */}
      {categoriaAtiva === 'todas' && !busca ? (
        // Visualização organizada por Seções
        <div className="space-y-12">
          {categorias.map((cat) => {
            const cookiesDaCat = cookiesPorCategoria[cat.id] || [];
            if (cookiesDaCat.length === 0) return null;

            return (
              <div
                key={cat.id}
                ref={(el) => {
                  categoryRefs.current[cat.id] = el;
                }}
                className="space-y-4 pt-4"
              >
                <div className="flex items-baseline justify-between border-b border-cookie-200 pb-2">
                  <h2 className="font-serif text-2xl font-bold text-cookie-950">
                    {cat.nome}
                  </h2>
                  <span className="text-xs text-cookie-500 font-medium">
                    {cookiesDaCat.length} sabores
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cookiesDaCat.map((cookie) => (
                    <CookieCard
                      key={cookie.id}
                      cookie={cookie}
                      onSelect={onSelectCookie}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Visualização filtrada por busca ou categoria única
        <div>
          {cookiesFiltrados.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-cookie-200 p-8 space-y-3">
              <AlertCircle className="w-10 h-10 text-cookie-400 mx-auto" />
              <h3 className="font-serif text-xl font-bold text-cookie-900">
                Nenhum cookie encontrado
              </h3>
              <p className="text-xs sm:text-sm text-cookie-600">
                Não encontramos cookies correspondentes a "{busca}". Tente outro termo ou limpe os filtros.
              </p>
              <button
                onClick={() => {
                  setBusca('');
                  setCategoriaAtiva('todas');
                }}
                className="mt-2 py-2 px-4 rounded-xl bg-cookie-800 text-white text-xs font-bold"
              >
                Ver todos os cookies
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cookiesFiltrados.map((cookie) => (
                <CookieCard
                  key={cookie.id}
                  cookie={cookie}
                  onSelect={onSelectCookie}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Aviso de Fornadas e Horário */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs sm:text-sm text-cookie-800 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>Produção artesanal diária:</strong> Todos os pedidos são assados e preparados para o próprio dia. Sabores marcados como "Esgotado Hoje" esgotaram na fornada atual, mas voltam no próximo dia ou podem ser encomendados com antecedência!
        </div>
      </div>

    </div>
  );
};
