import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Minus, 
  Check, 
  Sparkles, 
  ArrowRight, 
  ShoppingBag,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { KitSaborItem } from '../types';
import { calcularDescontoKit, formatarPreco } from '../utils/pricing';

export const KitBuilderPage: React.FC = () => {
  const { cookies } = useStore();
  const { adicionarKit } = useCart();
  const navigate = useNavigate();

  // Tamanho do kit selecionado: 3, 5 ou 8
  const [tamanhoKit, setTamanhoKit] = useState<3 | 5 | 8>(5);
  
  // Mapeamento de quantidades de cada sabor no kit atual: { [cookieId]: number }
  const [selecoes, setSelecoes] = useState<Record<string, number>>({});

  // Filtrar apenas cookies disponíveis na fornada de hoje
  const cookiesDisponiveis = useMemo(() => {
    return cookies.filter((c) => c.ativo && c.disponivel_hoje);
  }, [cookies]);

  // Total de cookies atualmente escolhidos
  const totalEscolhidos = useMemo(() => {
    return Object.values(selecoes).reduce((acc, q) => acc + q, 0);
  }, [selecoes]);

  const kitCompleto = totalEscolhidos === tamanhoKit;
  const faltamQuantos = Math.max(0, tamanhoKit - totalEscolhidos);

  // Troca de tamanho do kit: zera as seleções se exceder o novo tamanho
  const handleTrocarTamanho = (novoTamanho: 3 | 5 | 8) => {
    setTamanhoKit(novoTamanho);
    setSelecoes({});
  };

  const handleIncrementarSabor = (cookieId: string) => {
    if (totalEscolhidos >= tamanhoKit) return;
    setSelecoes((prev) => ({
      ...prev,
      [cookieId]: (prev[cookieId] || 0) + 1,
    }));
  };

  const handleDecrementarSabor = (cookieId: string) => {
    setSelecoes((prev) => {
      const atual = prev[cookieId] || 0;
      if (atual <= 1) {
        const copia = { ...prev };
        delete copia[cookieId];
        return copia;
      }
      return {
        ...prev,
        [cookieId]: atual - 1,
      };
    });
  };

  // Cálculo de valores em tempo real do kit
  const calculoValores = useMemo(() => {
    let subtotalSabores = 0;
    const saboresArray: KitSaborItem[] = [];

    for (const [id, qtd] of Object.entries(selecoes)) {
      if (qtd > 0) {
        const c = cookies.find((item) => item.id === id);
        const precoUnit = c?.preco || 11.00;
        subtotalSabores += precoUnit * qtd;
        saboresArray.push({
          cookie_id: id,
          nome: c?.nome || 'Cookie',
          quantidade: qtd,
          preco: precoUnit,
        });
      }
    }

    const desconto = calcularDescontoKit(tamanhoKit);
    const precoFinal = Math.max(0, subtotalSabores - desconto);

    return {
      subtotalSabores,
      desconto,
      precoFinal,
      saboresArray,
    };
  }, [selecoes, cookies, tamanhoKit]);

  const handleAdicionarAoCarrinho = () => {
    if (!kitCompleto) return;
    adicionarKit(tamanhoKit, calculoValores.saboresArray);
    navigate('/carrinho');
  };

  return (
    <div className="space-y-8 sm:space-y-10 pb-20">
      
      {/* Cabeçalho */}
      <div className="text-center max-w-2xl mx-auto space-y-3 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-cookie-900 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Desconto a cada 2 cookies</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-cookie-950">
          Monte seu Kit de Cookies
        </h1>
        <p className="text-sm sm:text-base text-cookie-600">
          Escolha o tamanho do kit e misture seus sabores favoritos da fornada de hoje. O desconto é calculado na hora!
        </p>
      </div>

      {/* 1. SELEÇÃO DO TAMANHO DO KIT */}
      <div className="space-y-3">
        <label className="block text-center text-xs font-bold text-cookie-800 uppercase tracking-wider">
          1. Escolha o tamanho da sua caixa:
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { tamanho: 3 as const, desconto: 1.50, desc: 'Perfeito para um lanchinho especial' },
            { tamanho: 5 as const, desconto: 3.00, desc: 'O mais pedido para compartilhar', popular: true },
            { tamanho: 8 as const, desconto: 6.00, desc: 'Maior economia para a família ou grupo' },
          ].map((op) => {
            const ativo = tamanhoKit === op.tamanho;
            return (
              <button
                key={op.tamanho}
                type="button"
                onClick={() => handleTrocarTamanho(op.tamanho)}
                className={`p-5 rounded-3xl border-2 text-left transition-all relative flex flex-col justify-between ${
                  ativo
                    ? 'border-cookie-800 bg-cookie-50/90 shadow-warm ring-2 ring-cookie-800/10'
                    : 'border-cookie-200 bg-white hover:border-cookie-400'
                }`}
              >
                {op.popular && (
                  <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                    Mais Popular
                  </span>
                )}
                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="font-serif text-2xl font-bold text-cookie-950">
                      Kit {op.tamanho} Cookies
                    </span>
                  </div>
                  <p className="text-xs text-cookie-600 leading-relaxed">
                    {op.desc}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-cookie-200/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">
                    Desconto de {formatarPreco(op.desconto)}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      ativo ? 'border-cookie-800 bg-cookie-800 text-white' : 'border-cookie-300'
                    }`}
                  >
                    {ativo && <Check className="w-3 h-3 stroke-3" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. BARRA DE PROGRESSO DO KIT */}
      <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-cookie-200/90 shadow-warm max-w-3xl mx-auto space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-cookie-800" />
            <span className="font-serif text-lg font-bold text-cookie-950">
              {totalEscolhidos} de {tamanhoKit} cookies escolhidos
            </span>
          </div>

          <div>
            {kitCompleto ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-300">
                <Check className="w-3.5 h-3.5" /> Kit Completo!
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-cookie-900 border border-amber-300">
                Faltam {faltamQuantos} {faltamQuantos === 1 ? 'cookie' : 'cookies'}
              </span>
            )}
          </div>
        </div>

        {/* Barra de progresso visual */}
        <div className="w-full bg-cookie-100 h-3 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              kitCompleto ? 'bg-emerald-600' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(100, (totalEscolhidos / tamanhoKit) * 100)}%` }}
          ></div>
        </div>

        {/* Resumo de Sabores Selecionados na Barra */}
        {totalEscolhidos > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {calculoValores.saboresArray.map((s) => (
              <span
                key={s.cookie_id}
                className="text-xs px-2.5 py-1 rounded-full bg-cookie-100 text-cookie-800 font-medium flex items-center gap-1"
              >
                <strong>{s.quantidade}x</strong> {s.nome}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 3. SELEÇÃO DOS SABORES */}
      <div className="max-w-4xl mx-auto space-y-4">
        <label className="block text-xs font-bold text-cookie-800 uppercase tracking-wider">
          2. Escolha os sabores da fornada de hoje (+/- para adicionar):
        </label>

        {cookiesDisponiveis.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-cookie-200">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-cookie-800 font-medium">Nenhum cookie marcado como disponível hoje.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cookiesDisponiveis.map((cookie) => {
              const qtdAtual = selecoes[cookie.id] || 0;
              const podeAdicionarMais = totalEscolhidos < tamanhoKit;

              return (
                <div
                  key={cookie.id}
                  className={`p-4 rounded-3xl bg-white border transition-all flex items-center gap-4 ${
                    qtdAtual > 0
                      ? 'border-cookie-700 shadow-sm ring-1 ring-cookie-700/20'
                      : 'border-cookie-200 hover:border-cookie-300'
                  }`}
                >
                  <img
                    src={cookie.imagem}
                    alt={cookie.nome}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-cookie-500 uppercase tracking-wider block">
                      {cookie.categoria}
                    </span>
                    <h3 className="font-serif font-bold text-cookie-950 text-sm sm:text-base truncate">
                      {cookie.nome}
                    </h3>
                    <p className="text-xs text-cookie-700 font-bold mt-0.5">
                      {formatarPreco(cookie.preco)}
                    </p>
                  </div>

                  {/* Controles + e - */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDecrementarSabor(cookie.id)}
                      disabled={qtdAtual <= 0}
                      className="w-8 h-8 rounded-full border border-cookie-300 flex items-center justify-center text-cookie-700 hover:bg-cookie-100 disabled:opacity-20 disabled:hover:bg-transparent"
                      aria-label="Diminuir"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span className="font-bold text-sm text-cookie-950 w-5 text-center">
                      {qtdAtual}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleIncrementarSabor(cookie.id)}
                      disabled={!podeAdicionarMais}
                      className="w-8 h-8 rounded-full bg-cookie-800 text-white flex items-center justify-center hover:bg-cookie-900 disabled:opacity-20 disabled:hover:bg-cookie-800"
                      aria-label="Aumentar"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. RODAPÉ FIXO OU FLUTUANTE COM TOTAIS DO KIT E BOTÃO ADICIONAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-cookie-200 p-4 shadow-2xl">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <div>
              <span className="text-xs text-cookie-500 font-medium block">
                Total do Kit {tamanhoKit}:
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl font-bold text-cookie-950">
                  {formatarPreco(calculoValores.precoFinal)}
                </span>
                {calculoValores.subtotalSabores > 0 && (
                  <span className="text-xs text-cookie-400 line-through">
                    {formatarPreco(calculoValores.subtotalSabores)}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right sm:text-left">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                Desconto do kit: -{formatarPreco(calculoValores.desconto)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdicionarAoCarrinho}
            disabled={!kitCompleto}
            className={`w-full sm:w-auto py-3.5 px-8 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md ${
              kitCompleto
                ? 'bg-cookie-800 hover:bg-cookie-900 text-white hover:scale-102 cursor-pointer'
                : 'bg-cookie-200 text-cookie-400 cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="w-5 h-5 text-amber-300" />
            <span>
              {kitCompleto ? 'Adicionar Kit ao Carrinho' : `Escolha mais ${faltamQuantos} cookies`}
            </span>
          </button>
        </div>
      </div>

    </div>
  );
};
