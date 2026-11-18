import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  QrCode, 
  Copy, 
  MessageCircle, 
  ArrowLeft, 
  Package, 
  Truck, 
  ChefHat, 
  Check, 
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Pedido, StatusPedido } from '../types';
import { StoreService } from '../services/store';
import { formatarPreco } from '../utils/pricing';
import { useStore } from '../context/StoreContext';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { config } = useStore();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const carregarPedido = async () => {
    if (!id) return;
    const p = await StoreService.getPedidoById(id);
    setPedido(p);
    setCarregando(false);
  };

  useEffect(() => {
    carregarPedido();

    // Dispara confetes na abertura
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#B45309', '#4A2E1B', '#10B981'],
      });
    } catch {}

    // Polling / listener para atualizar status em tempo real
    const intervalo = setInterval(() => {
      carregarPedido();
    }, 4000);

    return () => clearInterval(intervalo);
  }, [id]);

  const handleCopiarPix = () => {
    if (!pedido?.pix_copia_cola) return;
    navigator.clipboard.writeText(pedido.pix_copia_cola);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleAbrirWhatsappGabi = () => {
    if (!pedido) return;
    const numero = config.whatsapp_gabi || '5551999999999';
    const msg = `Olá Gabi! 🥰 Acabei de fazer o pedido *#${pedido.codigo_exibicao}* no site da Gabi Cookies no valor de *${formatarPreco(pedido.total)}*!\n\nPode confirmar se está tudo certinho?`;
    window.open(`https://wa.me/${numero.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (carregando) {
    return (
      <div className="py-20 text-center text-cookie-700">
        <Sparkles className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
        <p className="font-medium">Carregando detalhes do seu pedido...</p>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-cookie-950">Pedido não encontrado</h2>
        <p className="text-sm text-cookie-600">Não localizamos nenhum pedido com o código informado.</p>
        <Link to="/" className="inline-block py-2.5 px-6 rounded-2xl bg-cookie-800 text-white font-bold text-sm">
          Voltar ao Início
        </Link>
      </div>
    );
  }

  // Definição dos passos do Stepper
  const statusSteps: { chave: StatusPedido; label: string; icon: any }[] = [
    { chave: 'aguardando_pagamento', label: 'Pagamento', icon: QrCode },
    { chave: 'recebido', label: 'Recebido', icon: CheckCircle2 },
    { chave: 'em_preparo', label: 'No Forno', icon: ChefHat },
    { chave: 'pronto', label: 'Pronto', icon: Package },
    { chave: 'saiu_para_entrega', label: 'A Caminho', icon: Truck },
    { chave: 'concluido', label: 'Concluído', icon: Sparkles },
  ];

  const getStepIndex = (status: StatusPedido) => {
    if (status === 'cancelado' || status === 'expirado') return -1;
    return statusSteps.findIndex((s) => s.chave === status);
  };

  const currentIndex = getStepIndex(pedido.status);

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      
      {/* CABEÇALHO DO PEDIDO */}
      <div className="text-center space-y-3 pt-2">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-cookie-100 text-cookie-900">
          Pedido #{pedido.codigo_exibicao}
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-cookie-950">
          Pedido Enviado com Sucesso!
        </h1>

        <p className="text-xs sm:text-sm text-cookie-600 max-w-lg mx-auto">
          Obrigado, <strong>{pedido.cliente_nome}</strong>! Os cookies são sempre preparados frescos para o dia de hoje.
        </p>
      </div>

      {/* AVISO IMPORTANTE SOBRE HORÁRIO E WHATSAPP */}
      <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-cookie-800 flex items-start gap-3 shadow-xs">
        <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-cookie-950">
            A Gabi informará o horário exato pelo WhatsApp quando estiver pronto!
          </p>
          <p className="text-cookie-700">
            Como os cookies são assados sob demanda para garantir a melhor casquinha crocante e centro cremoso, você receberá uma notificação assim que seu pacote estiver saindo do forno.
          </p>
          {pedido.horario_pronto_informado && (
            <div className="pt-1 font-bold text-emerald-800">
              Previsão informada pela Gabi: {pedido.horario_pronto_informado}
            </div>
          )}
        </div>
      </div>

      {/* STEPPER DE STATUS EM TEMPO REAL */}
      <div className="p-6 rounded-3xl bg-white border border-cookie-200 shadow-warm space-y-4">
        <div className="flex items-center justify-between border-b border-cookie-100 pb-3">
          <h3 className="font-serif font-bold text-cookie-950 text-base">
            Status do Pedido
          </h3>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cookie-100 text-cookie-800">
            {pedido.status.replace(/_/g, ' ')}
          </span>
        </div>

        {pedido.status === 'cancelado' ? (
          <div className="p-4 rounded-2xl bg-rose-50 text-rose-800 text-xs font-medium border border-rose-200">
            Este pedido foi cancelado. Se você utilizou pontos de fidelidade, eles foram estornados para o seu saldo.
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
            {statusSteps.map((step, idx) => {
              const Icon = step.icon;
              const concluido = idx <= currentIndex;
              const atual = idx === currentIndex;

              return (
                <div key={step.chave} className="flex flex-col items-center text-center space-y-1.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                      atual
                        ? 'bg-cookie-800 text-white ring-4 ring-amber-300 shadow-md animate-pulse'
                        : concluido
                        ? 'bg-emerald-600 text-white'
                        : 'bg-cookie-100 text-cookie-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[11px] font-semibold leading-tight ${
                      atual ? 'text-cookie-950 font-bold' : concluido ? 'text-cookie-800' : 'text-cookie-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* COBRANÇA PIX ONLINE SE STATUS AGUARDANDO PAGAMENTO */}
      {pedido.status === 'aguardando_pagamento' && pedido.pix_copia_cola && (
        <div className="p-6 rounded-3xl bg-white border-2 border-emerald-500 shadow-warm space-y-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
            <QrCode className="w-3.5 h-3.5" />
            <span>Pague com Pix (AbacatePay)</span>
          </div>

          <h3 className="font-serif text-2xl font-bold text-cookie-950">
            Escaneie o QR Code ou Copie o Código
          </h3>

          <p className="text-xs text-cookie-600 max-w-sm mx-auto">
            Abra seu app do banco, selecione Pix e aponte a câmera para o QR Code abaixo.
          </p>

          {pedido.pix_qr_code_url && (
            <div className="p-3 bg-white border border-cookie-200 rounded-2xl inline-block shadow-inner">
              <img
                src={pedido.pix_qr_code_url}
                alt="QR Code Pix"
                className="w-48 h-48 mx-auto"
              />
            </div>
          )}

          <div className="max-w-md mx-auto space-y-2">
            <div className="p-3 bg-cookie-50 rounded-xl border border-cookie-200 text-xs text-cookie-700 font-mono break-all line-clamp-2">
              {pedido.pix_copia_cola}
            </div>
            <button
              onClick={handleCopiarPix}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiado ? 'Código Copiado com Sucesso!' : 'Copiar Código Pix (Copia e Cola)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* DETALHES DOS ITENS E VALORES */}
      <div className="p-6 rounded-3xl bg-white border border-cookie-200 space-y-4">
        <h3 className="font-serif font-bold text-cookie-950 text-base border-b border-cookie-100 pb-2">
          Itens do Pedido
        </h3>

        <div className="space-y-3">
          {pedido.itens.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start text-xs sm:text-sm">
              <div>
                <span className="font-bold text-cookie-950">
                  {item.quantidade}x {item.cookie?.nome || `Kit com ${item.kit_tamanho} cookies`}
                </span>
                {item.is_gratis && (
                  <span className="ml-2 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    GRÁTIS
                  </span>
                )}
                {item.tipo === 'kit' && item.sabores_kit && (
                  <div className="text-[11px] text-cookie-500 pl-2 mt-0.5">
                    {item.sabores_kit.map((s) => `${s.quantidade}x ${s.nome}`).join(', ')}
                  </div>
                )}
              </div>
              <span className="font-semibold text-cookie-900">
                {item.is_gratis ? 'R$ 0,00' : formatarPreco(item.subtotal)}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-cookie-100 space-y-1.5 text-xs text-cookie-600">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatarPreco(pedido.subtotal)}</span>
          </div>
          {pedido.desconto_kit > 0 && (
            <div className="flex justify-between text-amber-600 font-semibold">
              <span>Desconto de Kits:</span>
              <span>-{formatarPreco(pedido.desconto_kit)}</span>
            </div>
          )}
          {pedido.desconto_pontos > 0 && (
            <div className="flex justify-between text-amber-600 font-semibold">
              <span>Desconto de Pontos:</span>
              <span>-{formatarPreco(pedido.desconto_pontos)}</span>
            </div>
          )}
          {pedido.desconto_cupom > 0 && (
            <div className="flex justify-between text-amber-600 font-semibold">
              <span>Desconto de Cupom:</span>
              <span>-{formatarPreco(pedido.desconto_cupom)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Frete:</span>
            <span>{pedido.frete === 0 ? 'GRÁTIS' : formatarPreco(pedido.frete)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-cookie-200 font-serif font-bold text-base text-cookie-950">
            <span>Total:</span>
            <span>{formatarPreco(pedido.total)}</span>
          </div>
        </div>
      </div>

      {/* BOTÕES DE AÇÃO: WHATSAPP DA GABI + VOLTAR */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAbrirWhatsappGabi}
          className="flex-1 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Falar com a Gabi sobre o Pedido #{pedido.codigo_exibicao}</span>
        </button>

        <Link
          to="/"
          className="py-3.5 px-6 rounded-2xl bg-cookie-100 hover:bg-cookie-200 text-cookie-900 font-bold text-sm flex items-center justify-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar à Loja</span>
        </Link>
      </div>

    </div>
  );
};
