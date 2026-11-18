import React, { useState } from 'react';
import { 
  Heart, 
  Sparkles, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Instagram, 
  MessageCircle, 
  Coffee,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface AboutFaqProps {
  onOpenWhatsappModal: () => void;
}

export const AboutFaqPage: React.FC<AboutFaqProps> = ({ onOpenWhatsappModal }) => {
  const { faqs, config } = useStore();
  const [faqAberto, setFaqAberto] = useState<string | null>(faqs[0]?.id || null);

  const toggleFaq = (id: string) => {
    setFaqAberto(faqAberto === id ? null : id);
  };

  const fotosGaleria = [
    {
      url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80',
      legenda: 'Chocolate Belga saindo do forno',
    },
    {
      url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80',
      legenda: 'Double Chocolate Intenso & Macio',
    },
    {
      url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=600&q=80',
      legenda: 'Pistache Siciliano com Framboesa',
    },
    {
      url: 'https://images.unsplash.com/photo-1618923834413-27710e54b15d?auto=format&fit=crop&w=600&q=80',
      legenda: 'Red Velvet aveludado com Ninho',
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      
      {/* HISTÓRIA DA GABI */}
      <section className="bg-white rounded-3xl p-6 sm:p-12 border border-cookie-200 shadow-warm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-cookie-900 text-xs font-bold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
            <span>Nossa História & Propósito</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-cookie-950 leading-tight">
            Amor, manteiga de verdade e chocolates nobres.
          </h1>

          <div className="space-y-3 text-sm sm:text-base text-cookie-700 leading-relaxed font-light">
            <p>
              A <strong>Gabi Cookies</strong> nasceu de um desejo simples: criar aquele cookie perfeito no estilo nova-iorquino — com bordas ligeiramente douradas e crocantes, mas com um coração denso, úmido e transbordando chocolate nobre derretido.
            </p>
            <p>
              Cada lote é preparado artesanalmente em São Leopoldo, sem conservantes, aromatizantes artificiais ou pré-misturas industriais. Usamos ovos frescos, baunilha natural e os melhores chocolates nacionais e importados.
            </p>
            <p>
              Para nós, cookie não é apenas uma sobremesa: é uma pausa acolhedora no meio do dia de estudos, trabalho ou café entre amigos na Unisinos.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-cookie-800">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>100% Pura Manteiga</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Chocolates Nobres</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Assados Diariamente</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="aspect-4/5 rounded-3xl overflow-hidden shadow-xl border-4 border-white">
            <img
              src="https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80"
              alt="Cookies artesanais saindo do forno"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-4 -left-4 bg-amber-400 text-cookie-950 font-serif font-bold p-4 rounded-2xl shadow-lg text-xs sm:text-sm">
            🍪 Feito com amor em São Leopoldo
          </div>
        </div>
      </section>

      {/* GALERIA DE FOTOS */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold text-cookie-500 uppercase tracking-wider">
            Do Nosso Forninho
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-cookie-950">
            Galeria de Delícias
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {fotosGaleria.map((foto, idx) => (
            <div
              key={idx}
              className="group relative aspect-square rounded-3xl overflow-hidden shadow-sm border border-cookie-200"
            >
              <img
                src={foto.url}
                alt={foto.legenda}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <span className="text-white text-xs font-medium leading-tight">
                  {foto.legenda}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ INTERATIVO */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-cookie-200 shadow-warm space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-cookie-950">
            Perguntas Frequentes (FAQ)
          </h2>
          <p className="text-xs sm:text-sm text-cookie-600">
            Tire todas as suas dúvidas sobre entregas, kits, pontos e pedidos.
          </p>
        </div>

        <div className="space-y-3 max-w-2xl mx-auto pt-2">
          {faqs.map((faq) => {
            const aberto = faqAberto === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all ${
                  aberto ? 'border-cookie-700 bg-cookie-50/50' : 'border-cookie-200 bg-white'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4"
                >
                  <span className="font-serif font-bold text-sm sm:text-base text-cookie-950">
                    {faq.pergunta}
                  </span>
                  {aberto ? (
                    <ChevronUp className="w-4 h-4 text-cookie-700 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-cookie-400 shrink-0" />
                  )}
                </button>

                {aberto && (
                  <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-cookie-700 leading-relaxed border-t border-cookie-100 pt-3">
                    {faq.resposta}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CONTATOS & REDES SOCIAIS */}
      <section className="rounded-3xl bg-gradient-to-r from-cookie-900 via-cookie-950 to-cookie-900 text-white p-8 sm:p-12 text-center space-y-6">
        <div className="max-w-md mx-auto space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold">
            Acompanhe Nosso Dia a Dia
          </h2>
          <p className="text-xs sm:text-sm text-cookie-300">
            Fique por dentro das novidades, fornadas do dia e vídeos apetitosos nos nossos canais oficiais.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={onOpenWhatsappModal}
            className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            <span>WhatsApp da Gabi</span>
          </button>

          <a
            href={`https://instagram.com/${config.instagram_gabi || 'gabicookies_artesanal'}`}
            target="_blank"
            rel="noreferrer"
            className="py-3 px-6 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Instagram className="w-5 h-5" />
            <span>Instagram @{config.instagram_gabi || 'gabicookies_artesanal'}</span>
          </a>
        </div>
      </section>

    </div>
  );
};
