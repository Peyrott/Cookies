import React, { useState } from 'react';
import { X, MessageCircle, Sparkles, Send, Gift, Calendar, Heart } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface WhatsappModalProps {
  aberto: boolean;
  onClose: () => void;
}

export const WhatsappCustomOrderModal: React.FC<WhatsappModalProps> = ({ aberto, onClose }) => {
  const { config } = useStore();
  const [tipoEvento, setTipoEvento] = useState('Personalizado');
  const [detalhes, setDetalhes] = useState('');
  const [dataEvento, setDataEvento] = useState('');

  if (!aberto) return null;

  const handleEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    const numero = config.whatsapp_gabi || '5551999999999';
    let mensagem = `Olá Gabi! Gostaria de fazer um *Pedido Especial / Diferente* de cookies artesanais!\n\n`;
    mensagem += `*Tipo:* ${tipoEvento}\n`;
    if (dataEvento) {
      mensagem += `*Data desejada:* ${dataEvento}\n`;
    }
    if (detalhes) {
      mensagem += `*Detalhes e sabores:* ${detalhes}\n`;
    }
    mensagem += `\nPode me passar mais informações e disponibilidade? Obrigado! 🍪❤️`;

    const url = `https://wa.me/${numero.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cookie-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-cookie-200">
        
        {/* Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-cookie-500 hover:text-cookie-900 hover:bg-cookie-100 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <MessageCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-cookie-950">
              Pedido Especial ou Diferente
            </h3>
            <p className="text-xs sm:text-sm text-cookie-600">
              Fale direto com a Gabi no WhatsApp para encomendas sob medida!
            </p>
          </div>
        </div>

        <form onSubmit={handleEnviar} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-cookie-800 uppercase tracking-wider mb-2">
              Tipo de Encomenda
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Presente / Caixa', icon: Gift, label: 'Presente' },
                { id: 'Festa ou Evento', icon: Sparkles, label: 'Evento' },
                { id: 'Personalizado', icon: Heart, label: 'Sabores Especiais' },
              ].map((item) => {
                const Icon = item.icon;
                const selecionado = tipoEvento === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTipoEvento(item.id)}
                    className={`p-3 rounded-2xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                      selecionado
                        ? 'border-cookie-800 bg-cookie-50 text-cookie-950 ring-2 ring-cookie-800/20 font-bold'
                        : 'border-cookie-200 text-cookie-600 hover:border-cookie-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${selecionado ? 'text-cookie-800' : 'text-cookie-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-cookie-800 uppercase tracking-wider mb-1">
              Data Desejada (Opcional)
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-3.5 text-cookie-400" />
              <input
                type="text"
                placeholder="Ex: Sexta-feira às 15h, ou 25 de Novembro"
                value={dataEvento}
                onChange={(e) => setDataEvento(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cookie-200 text-sm focus:outline-hidden focus:border-cookie-800 focus:ring-1 focus:ring-cookie-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-cookie-800 uppercase tracking-wider mb-1">
              Detalhes, Sabores ou Quantidade
            </label>
            <textarea
              rows={3}
              placeholder="Descreva o que você gostaria: sabores, recheios especiais, quantidade de pessoas..."
              value={detalhes}
              onChange={(e) => setDetalhes(e.target.value)}
              className="w-full p-3 rounded-xl border border-cookie-200 text-sm focus:outline-hidden focus:border-cookie-800 focus:ring-1 focus:ring-cookie-800 resize-none"
            ></textarea>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-600/30 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Abrir WhatsApp da Gabi com Mensagem Pronta</span>
            </button>
            <p className="text-[11px] text-center text-cookie-500 mt-2">
              A Gabi responde rapidinho combinando valores e horários!
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
