import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Gift, 
  Award, 
  Truck, 
  Heart, 
  MessageCircle,
  Flame,
  CheckCircle2,
  Package
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CookieCard } from '../components/CookieCard';
import { Cookie } from '../types';

interface HomePageProps {
  onSelectCookie: (cookie: Cookie) => void;
  onOpenWhatsappModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectCookie, onOpenWhatsappModal }) => {
  const { cookies, categorias } = useStore();

  // Top 3 mais vendidos
  const top3Cookies = cookies.filter((c) => c.mais_vendido).slice(0, 3);

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cookie-900 via-cookie-800 to-cookie-950 text-white p-6 sm:p-12 lg:p-16 shadow-warm-lg">
        {/* Elementos visuais de fundo */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-10 -top-10 w-64 h-64 rounded-full bg-rose-500/10 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/20 text-amber-300 text-xs sm:text-sm font-semibold border border-amber-300/30 backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Fornadas Diárias &bull; Pura Manteiga & Chocolate Nobre</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Cookies artesanais recheados, quentinhos para o seu dia.
          </h1>

          <p className="text-sm sm:text-base text-cookie-200/90 leading-relaxed font-light">
            Feitos à mão um a um com ingredientes de verdade. Casquinha dourada crocante, centro ultra macio e muito recheio derretido.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/cardapio"
              className="py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-cookie-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-102"
            >
              <span>Ver Cardápio de Hoje</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/monte-seu-kit"
              className="py-3.5 px-6 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base border border-white/20 backdrop-blur-xs flex items-center justify-center gap-2 transition-all"
            >
              <Gift className="w-4 h-4 text-amber-300" />
              <span>Monte seu Kit com Desconto</span>
            </Link>
          </div>

          {/* Destaque rápido de benefícios */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10 text-xs text-cookie-200">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong>Grátis</strong> Portão B Unisinos</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong>10 Dias</strong> = 1 Cookie Grátis</span>
            </div>
            <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
              <Flame className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Fornadas fresquinhas</span>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIAS RÁPIDAS (Scroll suave para o cardápio) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-cookie-950">
              Categorias do Cardápio
            </h2>
            <p className="text-xs sm:text-sm text-cookie-600">
              Escolha sua categoria favorita para navegar diretamente
            </p>
          </div>
          <Link
            to="/cardapio"
            className="text-xs sm:text-sm font-semibold text-cookie-800 hover:text-cookie-950 flex items-center gap-1"
          >
            Ver tudo &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {categorias.map((cat, idx) => {
            const cores = [
              'from-amber-50 to-orange-100 border-amber-200 text-amber-950',
              'from-rose-50 to-pink-100 border-rose-200 text-rose-950',
              'from-purple-50 to-indigo-100 border-purple-200 text-purple-950',
            ];
            const badges = ['R$ 11,00 cada', 'R$ 12,00 cada', 'R$ 12,50 cada'];
            const cor = cores[idx % cores.length];

            return (
              <Link
                key={cat.id}
                to={`/cardapio?categoria=${cat.id}`}
                className={`p-5 rounded-3xl bg-gradient-to-br ${cor} border shadow-xs hover:shadow-warm transition-all hover:-translate-y-1 group flex flex-col justify-between h-36`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-2xl">
                    {idx === 0 ? '🍪' : idx === 1 ? '🍓' : '✨'}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-xs">
                    {badges[idx]}
                  </span>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold group-hover:text-cookie-900 transition-colors">
                    {cat.nome}
                  </h3>
                  <span className="text-xs font-medium opacity-80 flex items-center gap-1 mt-0.5">
                    Ir para seção &rarr;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* TOP 3 MAIS VENDIDOS */}
      {top3Cookies.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-cookie-950">
                  Os Mais Queridinhos (Top 3)
                </h2>
                <p className="text-xs sm:text-sm text-cookie-600">
                  Os sabores campeões de pedidos e elogios
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {top3Cookies.map((cookie) => (
              <CookieCard
                key={cookie.id}
                cookie={cookie}
                onSelect={onSelectCookie}
              />
            ))}
          </div>
        </section>
      )}

      {/* BANNER INTERATIVO: MONTE SEU KIT COM DESCONTO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white p-6 sm:p-10 shadow-warm">
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 text-white text-xs font-bold uppercase tracking-wider">
            <Package className="w-3.5 h-3.5" />
            <span>Economize nos Kits</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
            Monte sua caixinha e ganhe até R$ 6,00 de desconto!
          </h2>

          <p className="text-sm sm:text-base text-amber-100 leading-relaxed font-light">
            R$ 1,50 de desconto a cada 2 cookies em caixas de 3, 5 ou 8 unidades. Combine seus sabores favoritos livremente!
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <span className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-xs text-xs font-semibold">
              Kit 3: <strong>-R$ 1,50</strong>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-xs text-xs font-semibold">
              Kit 5: <strong>-R$ 3,00</strong>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-xs text-xs font-semibold">
              Kit 8: <strong>-R$ 6,00</strong>
            </span>
          </div>

          <div className="pt-2">
            <Link
              to="/monte-seu-kit"
              className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-cookie-950 hover:bg-black text-white font-bold text-sm shadow-md transition-all hover:scale-102"
            >
              <span>Personalizar Meu Kit Agora</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CLUBE DE FIDELIDADE (10 DIAS = 1 COOKIE GRÁTIS + PONTOS) */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-cookie-200/80 shadow-warm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-cookie-950">
                Programa de Fidelidade Gabi Cookies
              </h2>
              <p className="text-xs sm:text-sm text-cookie-600">
                Quanto mais você adora, mais vantagens e cookies você ganha!
              </p>
            </div>
          </div>

          <Link
            to="/minha-conta"
            className="py-2.5 px-5 rounded-2xl bg-cookie-100 hover:bg-cookie-200 text-cookie-900 font-bold text-xs sm:text-sm self-start sm:self-auto transition-colors"
          >
            Ver Meu Cartão de Fidelidade &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Card 1: 10 Dias de Fidelidade */}
          <div className="p-5 rounded-2xl bg-cookie-50/70 border border-cookie-200/60 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Carimbos Diários
                </span>
                <span className="text-xs text-cookie-500 font-medium">1 carimbo por compra diária</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-cookie-900">
                Cartão de 10 Dias = 1 Cookie Grátis!
              </h3>
              <p className="text-xs sm:text-sm text-cookie-600 leading-relaxed">
                A cada dia que você concluir um pedido, você ganha 1 carimbo no seu cartão virtual. Ao completar 10 dias, resgate qualquer cookie do cardápio 100% grátis!
              </p>
            </div>

            {/* Simulação visual dos 10 carimbos */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 pt-2">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-xl flex items-center justify-center text-xs font-bold border transition-all ${
                    i < 8
                      ? 'bg-amber-400 border-amber-500 text-cookie-950 shadow-xs'
                      : 'bg-white border-dashed border-cookie-300 text-cookie-400'
                  }`}
                  title={i < 8 ? `Dia ${i + 1} Concluído` : `Dia ${i + 1}`}
                >
                  {i < 8 ? '🍪' : i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Pontos por Cookie */}
          <div className="p-5 rounded-2xl bg-cookie-50/70 border border-cookie-200/60 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Desconto Direto
                </span>
                <span className="text-xs text-cookie-500 font-medium">1 ponto = 1% off</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-cookie-900">
                +1 Ponto por Cookie Comprado
              </h3>
              <p className="text-xs sm:text-sm text-cookie-600 leading-relaxed">
                Cada cookie comprado rende 1 ponto na sua conta. No carrinho, você escolhe quantos pontos usar para abater o valor, podendo chegar a até 100% de desconto nos produtos!
              </p>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-cookie-200/80 text-xs text-cookie-700 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>Acumula com cupons:</strong> use seus pontos e cupom de desconto juntos na mesma compra!
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO PEDIDO ESPECIAL / ENCOMENDAS PERSONALIZADAS */}
      <section className="rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/60 border border-emerald-200 p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-lg text-center sm:text-left">
          <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">
            <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600" />
            <span>Feito com todo carinho</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-emerald-950">
            Precisa de um Pedido Diferente?
          </h2>
          <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
            Caixas de presente, sabores especiais para aniversários, lembrancinhas de casamento ou eventos corporativos na Unisinos e região. Fale direto com a Gabi!
          </p>
        </div>

        <button
          onClick={onOpenWhatsappModal}
          className="py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-600/30 transition-all hover:scale-102 shrink-0"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Falar no WhatsApp da Gabi</span>
        </button>
      </section>

    </div>
  );
};
