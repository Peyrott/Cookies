import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingBag, 
  Truck, 
  Award, 
  Tag, 
  CreditCard, 
  DollarSign, 
  QrCode, 
  MapPin, 
  AlertCircle, 
  Sparkles,
  Gift,
  Check
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { StoreService } from '../services/store';
import { formatarPreco } from '../utils/pricing';
import { FormaPagamento, TipoEntrega } from '../types';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { perfil, recarregarPerfil } = useAuth();
  const { cookies } = useStore();
  const {
    itens,
    removerItem,
    atualizarQuantidade,
    limparCarrinho,
    adicionarCookieGratis,
    removerCookieGratis,
    temCookieGratisNoCarrinho,
    pontosUsados,
    setPontosUsados,
    cupom,
    aplicarCupom,
    removerCupom,
    tipoEntrega,
    setTipoEntrega,
    enderecoEntrega,
    setEnderecoEntrega,
    formaPagamento,
    setFormaPagamento,
    trocoPara,
    setTrocoPara,
    observacoes,
    setObservacoes,
    totais,
    quantidadeTotalItens,
  } = useCart();

  // Estados locais para inputs
  const [cupomInput, setCupomInput] = useState('');
  const [mensagemCupom, setMensagemCupom] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [modalResgateAberto, setModalResgateAberto] = useState(false);
  const [enviandoPedido, setEnviandoPedido] = useState(false);

  // Dados do cliente para o pedido
  const [nomeCliente, setNomeCliente] = useState(perfil.nome || '');
  const [whatsappCliente, setWhatsappCliente] = useState(perfil.whatsapp || '');
  const [enderecoManual, setEnderecoManual] = useState({
    cep: '93022-714',
    logradouro: 'Av. Unisinos',
    numero: '950',
    bairro: 'Cristo Rei',
    cidade: 'São Leopoldo',
    complemento: '',
    distancia_km: 3.5,
  });

  const cookiesDisponiveis = cookies.filter((c) => c.ativo && c.disponivel_hoje);

  const handleAplicarCupom = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagemCupom(null);
    const res = await aplicarCupom(cupomInput);
    if (res.sucesso) {
      setMensagemCupom({ tipo: 'sucesso', texto: res.mensagem });
      setCupomInput('');
    } else {
      setMensagemCupom({ tipo: 'erro', texto: res.mensagem });
    }
  };

  const handleFinalizarPedido = async () => {
    if (itens.length === 0) return;
    if (!nomeCliente.trim()) {
      alert('Por favor, informe seu nome.');
      return;
    }
    if (!whatsappCliente.trim()) {
      alert('Por favor, informe seu WhatsApp para o aviso de pedido pronto.');
      return;
    }

    setEnviandoPedido(true);

    try {
      const novoPedido = await StoreService.criarPedido({
        cliente_id: perfil.id,
        cliente_nome: nomeCliente,
        cliente_whatsapp: whatsappCliente,
        tipo_entrega: tipoEntrega,
        endereco: tipoEntrega === 'entrega' ? enderecoManual : undefined,
        distancia_km: tipoEntrega === 'entrega' ? enderecoManual.distancia_km : 0,
        frete: totais.frete,
        forma_pagamento: formaPagamento,
        troco_para: formaPagamento === 'entrega_dinheiro' ? trocoPara : undefined,
        itens,
        subtotal: totais.subtotal,
        desconto_kit: totais.desconto_kit,
        cupom_codigo: cupom ? cupom.codigo : undefined,
        desconto_cupom: totais.desconto_cupom,
        pontos_usados: pontosUsados,
        desconto_pontos: totais.desconto_pontos,
        total: totais.total,
        observacoes,
      });

      limparCarrinho();
      await recarregarPerfil();
      navigate(`/pedido/${novoPedido.id}`);
    } catch (e: any) {
      alert('Erro ao processar pedido: ' + e.message);
    } finally {
      setEnviandoPedido(false);
    }
  };

  if (itens.length === 0) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4">
        <div className="w-20 h-20 rounded-full bg-amber-100 text-cookie-800 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-cookie-950">
          Seu carrinho está vazio
        </h2>
        <p className="text-sm text-cookie-600">
          Que tal experimentar nossa fornada quentinha de hoje ou montar um kit com desconto?
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Link
            to="/cardapio"
            className="py-3 px-6 rounded-2xl bg-cookie-800 hover:bg-cookie-900 text-white font-bold text-sm"
          >
            Ver Cardápio
          </Link>
          <Link
            to="/monte-seu-kit"
            className="py-3 px-6 rounded-2xl bg-amber-100 hover:bg-amber-200 text-cookie-950 font-bold text-sm"
          >
            Monte seu Kit
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      
      {/* Título */}
      <div className="flex items-center justify-between border-b border-cookie-200 pb-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-cookie-950">
            Meu Carrinho
          </h1>
          <p className="text-xs sm:text-sm text-cookie-600">
            {quantidadeTotalItens} {quantidadeTotalItens === 1 ? 'item' : 'itens'} no seu pedido
          </p>
        </div>
        <button
          onClick={limparCarrinho}
          className="text-xs text-rose-600 hover:text-rose-800 font-medium"
        >
          Esvaziar carrinho
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUNA ESQUERDA: LISTA DE ITENS + BENEFÍCIOS */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* BANNER DE RESGATE DE COOKIE GRÁTIS DISPONÍVEL */}
          {perfil.cookies_gratis_disponiveis > 0 && !temCookieGratisNoCarrinho && (
            <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-400 to-amber-500 text-cookie-950 shadow-md flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/30 backdrop-blur-xs flex items-center justify-center text-xl">
                  🎁
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm sm:text-base">
                    Você tem {perfil.cookies_gratis_disponiveis} Cookie Grátis para resgatar!
                  </h4>
                  <p className="text-xs text-cookie-900 font-medium">
                    Escolha qualquer sabor disponível da fornada de hoje.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalResgateAberto(true)}
                className="py-2 px-4 rounded-xl bg-cookie-950 text-white text-xs font-bold hover:bg-black transition-all shrink-0 shadow-sm"
              >
                Resgatar Agora
              </button>
            </div>
          )}

          {/* LISTA DE ITENS */}
          <div className="space-y-3">
            {itens.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-3xl bg-white border transition-all ${
                  item.is_gratis
                    ? 'border-amber-400 bg-amber-50/50 ring-2 ring-amber-400/20'
                    : 'border-cookie-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Foto ou Ícone */}
                  {item.cookie?.imagem ? (
                    <img
                      src={item.cookie.imagem}
                      alt={item.cookie.nome}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl shrink-0">
                      📦
                    </div>
                  )}

                  {/* Informações */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {item.is_gratis ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-white uppercase tracking-wider">
                            Resgate de Fidelidade (Grátis)
                          </span>
                        ) : item.tipo === 'kit' ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cookie-100 text-cookie-800 uppercase tracking-wider">
                            Kit {item.kit_tamanho} Cookies
                          </span>
                        ) : null}

                        <h3 className="font-serif font-bold text-cookie-950 text-base mt-0.5">
                          {item.cookie?.nome || `Kit com ${item.kit_tamanho} cookies`}
                        </h3>
                      </div>

                      {/* Botão Remover */}
                      <button
                        onClick={() =>
                          item.is_gratis ? removerCookieGratis() : removerItem(item.id)
                        }
                        className="text-cookie-400 hover:text-rose-600 p-1"
                        title="Remover"
                        aria-label="Remover item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Sabores do Kit discriminados */}
                    {item.tipo === 'kit' && item.sabores_kit && (
                      <div className="text-xs text-cookie-600 mt-1 space-y-0.5 bg-cookie-50 p-2 rounded-xl border border-cookie-100">
                        {item.sabores_kit.map((s) => (
                          <div key={s.cookie_id} className="flex justify-between">
                            <span>
                              {s.quantidade}x {s.nome}
                            </span>
                            <span className="text-cookie-400">
                              {formatarPreco(s.preco * s.quantidade)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Preço e Controles */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-cookie-100">
                      <div>
                        {item.is_gratis ? (
                          <span className="font-bold text-emerald-700 text-sm">
                            GRÁTIS (R$ 0,00)
                          </span>
                        ) : (
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-cookie-950 text-sm sm:text-base">
                              {formatarPreco(item.subtotal)}
                            </span>
                            {item.quantidade > 1 && (
                              <span className="text-xs text-cookie-500">
                                ({formatarPreco(item.preco_unitario)} cada)
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Controle de quantidade (se não for grátis) */}
                      {!item.is_gratis && (
                        <div className="flex items-center border border-cookie-200 rounded-xl bg-cookie-50 px-2 py-0.5">
                          <button
                            type="button"
                            onClick={() => atualizarQuantidade(item.id, item.quantidade - 1)}
                            className="p-1 text-cookie-600 hover:text-cookie-900"
                            aria-label="Diminuir"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold text-xs text-cookie-950 w-6 text-center">
                            {item.quantidade}
                          </span>
                          <button
                            type="button"
                            onClick={() => atualizarQuantidade(item.id, item.quantidade + 1)}
                            className="p-1 text-cookie-600 hover:text-cookie-900"
                            aria-label="Aumentar"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ÁREA DE FIDELIDADE (PONTOS) */}
          <div className="p-5 rounded-3xl bg-white border border-cookie-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <h3 className="font-serif font-bold text-cookie-950 text-base">
                  Usar Pontos de Fidelidade
                </h3>
              </div>
              <span className="text-xs font-bold text-cookie-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                Seu saldo: {perfil.saldo_pontos} pts
              </span>
            </div>

            <p className="text-xs text-cookie-600">
              Cada 1 ponto equivale a <strong>1% de desconto</strong> no valor dos produtos (limite de 100 pontos = 100% de desconto).
            </p>

            {perfil.saldo_pontos > 0 ? (
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max={Math.min(100, perfil.saldo_pontos)}
                    value={pontosUsados}
                    onChange={(e) => setPontosUsados(Number(e.target.value))}
                    className="flex-1 accent-cookie-800 cursor-pointer"
                  />
                  <div className="w-20 px-3 py-1.5 rounded-xl border border-cookie-300 bg-cookie-50 text-center font-bold text-sm text-cookie-900">
                    {pontosUsados} pts
                  </div>
                </div>

                <div className="flex justify-between text-xs text-cookie-500">
                  <span>0% off</span>
                  <span className="font-semibold text-emerald-700">
                    Desconto de {pontosUsados}% (-{formatarPreco(totais.desconto_pontos)})
                  </span>
                  <span>{Math.min(100, perfil.saldo_pontos)} pts máx</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-cookie-500 italic bg-cookie-50 p-2.5 rounded-xl border border-cookie-100">
                Você ainda não possui pontos acumulados. Ao concluir este pedido, você ganhará <strong>+{totais.pontos_a_ganhar} pontos</strong>!
              </div>
            )}
          </div>

          {/* CUPOM DE DESCONTO */}
          <div className="p-5 rounded-3xl bg-white border border-cookie-200 space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-cookie-800" />
              <h3 className="font-serif font-bold text-cookie-950 text-base">
                Cupom de Desconto
              </h3>
            </div>

            {cupom ? (
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span className="font-bold text-emerald-900">
                    Cupom "{cupom.codigo}" aplicado (-{formatarPreco(totais.desconto_cupom)})
                  </span>
                </div>
                <button
                  onClick={removerCupom}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800"
                >
                  Remover
                </button>
              </div>
            ) : (
              <form onSubmit={handleAplicarCupom} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: BEMVINDO10, GABI5..."
                  value={cupomInput}
                  onChange={(e) => setCupomInput(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-cookie-200 text-sm uppercase focus:outline-hidden focus:border-cookie-800"
                />
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-cookie-800 hover:bg-cookie-900 text-white font-bold text-xs"
                >
                  Aplicar
                </button>
              </form>
            )}

            {mensagemCupom && (
              <div
                className={`text-xs p-2 rounded-lg ${
                  mensagemCupom.tipo === 'sucesso'
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-rose-50 text-rose-800'
                }`}
              >
                {mensagemCupom.texto}
              </div>
            )}
          </div>

          {/* OBSERVAÇÕES */}
          <div className="p-5 rounded-3xl bg-white border border-cookie-200 space-y-2">
            <label className="block text-xs font-bold text-cookie-800 uppercase tracking-wider">
              Observações para a Gabi (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Embalar para presente, sem fita, entregar após as 14h..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full p-3 rounded-xl border border-cookie-200 text-xs sm:text-sm focus:outline-hidden focus:border-cookie-800 resize-none"
            ></textarea>
          </div>
        </div>

        {/* COLUNA DIREITA: ENTREGA, PAGAMENTO E RESUMO FINAL */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* SELEÇÃO DE ENTREGA */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-cookie-200 space-y-4">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-cookie-800" />
              <h3 className="font-serif font-bold text-cookie-950 text-base">
                Opção de Entrega / Retirada
              </h3>
            </div>

            <div className="space-y-2.5">
              {/* Opção 1: Unisinos Grátis */}
              <label
                className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  tipoEntrega === 'unisinos_portao_b'
                    ? 'border-cookie-800 bg-cookie-50/80 ring-2 ring-cookie-800/10'
                    : 'border-cookie-200 hover:border-cookie-300'
                }`}
              >
                <input
                  type="radio"
                  name="tipo_entrega"
                  value="unisinos_portao_b"
                  checked={tipoEntrega === 'unisinos_portao_b'}
                  onChange={() => setTipoEntrega('unisinos_portao_b')}
                  className="mt-1 accent-cookie-800"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cookie-950 text-sm">
                      Unisinos – Florindas (Portão B)
                    </span>
                    <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      GRÁTIS
                    </span>
                  </div>
                  <p className="text-cookie-600 mt-0.5">
                    Entrega gratuita no ponto de encontro Florindas, entrada do portão B Unisinos São Leopoldo.
                  </p>
                </div>
              </label>

              {/* Opção 2: Retirada */}
              <label
                className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  tipoEntrega === 'retirada'
                    ? 'border-cookie-800 bg-cookie-50/80 ring-2 ring-cookie-800/10'
                    : 'border-cookie-200 hover:border-cookie-300'
                }`}
              >
                <input
                  type="radio"
                  name="tipo_entrega"
                  value="retirada"
                  checked={tipoEntrega === 'retirada'}
                  onChange={() => setTipoEntrega('retirada')}
                  className="mt-1 accent-cookie-800"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cookie-950 text-sm">
                      Retirada com a Gabi
                    </span>
                    <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      GRÁTIS
                    </span>
                  </div>
                  <p className="text-cookie-600 mt-0.5">
                    Retire seu pedido pronto direto no ateliê em São Leopoldo.
                  </p>
                </div>
              </label>

              {/* Opção 3: Entrega por Faixa de KM */}
              <label
                className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  tipoEntrega === 'entrega'
                    ? 'border-cookie-800 bg-cookie-50/80 ring-2 ring-cookie-800/10'
                    : 'border-cookie-200 hover:border-cookie-300'
                }`}
              >
                <input
                  type="radio"
                  name="tipo_entrega"
                  value="entrega"
                  checked={tipoEntrega === 'entrega'}
                  onChange={() => setTipoEntrega('entrega')}
                  className="mt-1 accent-cookie-800"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cookie-950 text-sm">
                      Entrega no seu endereço
                    </span>
                    <span className="font-bold text-cookie-800">
                      Frete por Km ({formatarPreco(totais.frete)})
                    </span>
                  </div>
                  <p className="text-cookie-600 mt-0.5">
                    Calculado por distância do campus Unisinos SL.
                  </p>
                </div>
              </label>
            </div>

            {/* Campos de endereço se entrega selecionada */}
            {tipoEntrega === 'entrega' && (
              <div className="p-3.5 bg-cookie-50 rounded-2xl border border-cookie-200 space-y-2 text-xs">
                <span className="font-bold text-cookie-800 uppercase tracking-wider block">
                  Endereço de Entrega:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="CEP"
                    value={enderecoManual.cep}
                    onChange={(e) => setEnderecoManual({ ...enderecoManual, cep: e.target.value })}
                    className="p-2 rounded-lg border border-cookie-200 bg-white"
                  />
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Distância estimada (km)"
                    value={enderecoManual.distancia_km}
                    onChange={(e) =>
                      setEnderecoManual({ ...enderecoManual, distancia_km: Number(e.target.value) })
                    }
                    className="p-2 rounded-lg border border-cookie-200 bg-white"
                    title="Distância em km da Unisinos"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Rua / Avenida"
                    value={enderecoManual.logradouro}
                    onChange={(e) => setEnderecoManual({ ...enderecoManual, logradouro: e.target.value })}
                    className="col-span-2 p-2 rounded-lg border border-cookie-200 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Número"
                    value={enderecoManual.numero}
                    onChange={(e) => setEnderecoManual({ ...enderecoManual, numero: e.target.value })}
                    className="p-2 rounded-lg border border-cookie-200 bg-white"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Bairro / Cidade"
                  value={`${enderecoManual.bairro} - ${enderecoManual.cidade}`}
                  onChange={(e) => setEnderecoManual({ ...enderecoManual, bairro: e.target.value })}
                  className="w-full p-2 rounded-lg border border-cookie-200 bg-white"
                />
              </div>
            )}
          </div>

          {/* DADOS DO CLIENTE */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-cookie-200 space-y-3">
            <h3 className="font-serif font-bold text-cookie-950 text-base">
              Seus Dados para o Pedido
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <label className="font-semibold text-cookie-700 block mb-1">Seu Nome:</label>
                <input
                  type="text"
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full p-2.5 rounded-xl border border-cookie-200 text-sm focus:outline-hidden focus:border-cookie-800"
                />
              </div>
              <div>
                <label className="font-semibold text-cookie-700 block mb-1">WhatsApp:</label>
                <input
                  type="tel"
                  value={whatsappCliente}
                  onChange={(e) => setWhatsappCliente(e.target.value)}
                  placeholder="Ex: 51 98888-7777"
                  className="w-full p-2.5 rounded-xl border border-cookie-200 text-sm focus:outline-hidden focus:border-cookie-800"
                />
                <span className="text-[11px] text-cookie-500 mt-1 block">
                  A Gabi informará o horário exato quando seu pedido estiver pronto por aqui!
                </span>
              </div>
            </div>
          </div>

          {/* FORMA DE PAGAMENTO */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-cookie-200 space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-cookie-800" />
              <h3 className="font-serif font-bold text-cookie-950 text-base">
                Forma de Pagamento
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              {/* Online Pix */}
              <label
                className={`p-3 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                  formaPagamento === 'online_pix'
                    ? 'border-cookie-800 bg-cookie-50'
                    : 'border-cookie-200 hover:border-cookie-300'
                }`}
              >
                <input
                  type="radio"
                  name="forma_pagamento"
                  value="online_pix"
                  checked={formaPagamento === 'online_pix'}
                  onChange={() => setFormaPagamento('online_pix')}
                  className="accent-cookie-800"
                />
                <QrCode className="w-4 h-4 text-emerald-600" />
                <div className="flex-1">
                  <span className="font-bold text-cookie-950">Pix Online (AbacatePay)</span>
                  <p className="text-cookie-500 text-[11px]">QR Code instantâneo com confirmação automática</p>
                </div>
              </label>

              {/* Online Cartão */}
              <label
                className={`p-3 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                  formaPagamento === 'online_cartao'
                    ? 'border-cookie-800 bg-cookie-50'
                    : 'border-cookie-200 hover:border-cookie-300'
                }`}
              >
                <input
                  type="radio"
                  name="forma_pagamento"
                  value="online_cartao"
                  checked={formaPagamento === 'online_cartao'}
                  onChange={() => setFormaPagamento('online_cartao')}
                  className="accent-cookie-800"
                />
                <CreditCard className="w-4 h-4 text-purple-600" />
                <div className="flex-1">
                  <span className="font-bold text-cookie-950">Cartão de Crédito Online</span>
                  <p className="text-cookie-500 text-[11px]">Checkout seguro via AbacatePay</p>
                </div>
              </label>

              {/* Entrega Pix */}
              <label
                className={`p-3 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                  formaPagamento === 'entrega_pix'
                    ? 'border-cookie-800 bg-cookie-50'
                    : 'border-cookie-200 hover:border-cookie-300'
                }`}
              >
                <input
                  type="radio"
                  name="forma_pagamento"
                  value="entrega_pix"
                  checked={formaPagamento === 'entrega_pix'}
                  onChange={() => setFormaPagamento('entrega_pix')}
                  className="accent-cookie-800"
                />
                <QrCode className="w-4 h-4 text-cookie-700" />
                <div className="flex-1">
                  <span className="font-bold text-cookie-950">Pix na Entrega / Retirada</span>
                  <p className="text-cookie-500 text-[11px]">A Gabi gera a cobrança na hora da entrega</p>
                </div>
              </label>

              {/* Entrega Cartão */}
              <label
                className={`p-3 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                  formaPagamento === 'entrega_cartao'
                    ? 'border-cookie-800 bg-cookie-50'
                    : 'border-cookie-200 hover:border-cookie-300'
                }`}
              >
                <input
                  type="radio"
                  name="forma_pagamento"
                  value="entrega_cartao"
                  checked={formaPagamento === 'entrega_cartao'}
                  onChange={() => setFormaPagamento('entrega_cartao')}
                  className="accent-cookie-800"
                />
                <CreditCard className="w-4 h-4 text-cookie-700" />
                <div className="flex-1">
                  <span className="font-bold text-cookie-950">Cartão na Entrega / Retirada</span>
                  <p className="text-cookie-500 text-[11px]">Maquininha ou link de pagamento no ato</p>
                </div>
              </label>

              {/* Entrega Dinheiro */}
              <label
                className={`p-3 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                  formaPagamento === 'entrega_dinheiro'
                    ? 'border-cookie-800 bg-cookie-50'
                    : 'border-cookie-200 hover:border-cookie-300'
                }`}
              >
                <input
                  type="radio"
                  name="forma_pagamento"
                  value="entrega_dinheiro"
                  checked={formaPagamento === 'entrega_dinheiro'}
                  onChange={() => setFormaPagamento('entrega_dinheiro')}
                  className="accent-cookie-800"
                />
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <div className="flex-1">
                  <span className="font-bold text-cookie-950">Dinheiro na Entrega / Retirada</span>
                </div>
              </label>

              {formaPagamento === 'entrega_dinheiro' && (
                <div className="pl-6 pt-1">
                  <input
                    type="number"
                    step="5"
                    placeholder="Precisa de troco para quanto? (Ex: 50)"
                    value={trocoPara || ''}
                    onChange={(e) => setTrocoPara(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full p-2 rounded-xl border border-cookie-200 text-xs bg-cookie-50"
                  />
                </div>
              )}
            </div>
          </div>

          {/* RESUMO DE VALORES (ESTRITAMENTE SEGUNDO A REGRA DE CÁLCULO) */}
          <div className="p-6 rounded-3xl bg-cookie-950 text-white shadow-warm-lg space-y-4">
            <h3 className="font-serif font-bold text-xl text-white border-b border-cookie-800 pb-2">
              Resumo do Pedido
            </h3>

            <div className="space-y-2 text-xs sm:text-sm text-cookie-200">
              <div className="flex justify-between">
                <span>1. Subtotal dos itens:</span>
                <span className="font-medium text-white">{formatarPreco(totais.subtotal)}</span>
              </div>

              {totais.desconto_kit > 0 && (
                <div className="flex justify-between text-amber-400 font-semibold">
                  <span>2. Desconto dos Kits:</span>
                  <span>-{formatarPreco(totais.desconto_kit)}</span>
                </div>
              )}

              {totais.desconto_pontos > 0 && (
                <div className="flex justify-between text-amber-400 font-semibold">
                  <span>3. Desconto de Pontos ({pontosUsados}%):</span>
                  <span>-{formatarPreco(totais.desconto_pontos)}</span>
                </div>
              )}

              {totais.desconto_cupom > 0 && (
                <div className="flex justify-between text-amber-400 font-semibold">
                  <span>4. Desconto de Cupom:</span>
                  <span>-{formatarPreco(totais.desconto_cupom)}</span>
                </div>
              )}

              <div className="flex justify-between pt-1 border-t border-cookie-800/80">
                <span>5. Frete:</span>
                <span className="font-medium text-white">
                  {totais.frete === 0 ? (
                    <strong className="text-emerald-400">GRÁTIS</strong>
                  ) : (
                    formatarPreco(totais.frete)
                  )}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-cookie-800 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-cookie-300 uppercase tracking-wider block">
                  Total a Pagar
                </span>
                <span className="font-serif text-3xl font-bold text-white">
                  {formatarPreco(totais.total)}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-amber-300 font-bold bg-amber-400/20 px-2.5 py-1 rounded-full border border-amber-300/30 block">
                  +{totais.pontos_a_ganhar} pontos ao concluir
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinalizarPedido}
              disabled={enviandoPedido}
              className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-cookie-950 font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
            >
              <span>{enviandoPedido ? 'Enviando Pedido...' : 'Confirmar e Fazer Pedido'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-[11px] text-center text-cookie-400">
              O pedido é sempre para o dia. A Gabi avisa no WhatsApp quando estiver saindo do forno!
            </p>
          </div>

        </div>
      </div>

      {/* MODAL DE RESGATE DE COOKIE GRÁTIS */}
      {modalResgateAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cookie-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-cookie-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-600" />
                <h3 className="font-serif text-xl font-bold text-cookie-950">
                  Escolha seu Cookie Grátis!
                </h3>
              </div>
              <button
                onClick={() => setModalResgateAberto(false)}
                className="text-cookie-400 hover:text-cookie-800 text-xs font-bold"
              >
                Fechar
              </button>
            </div>

            <p className="text-xs text-cookie-600">
              Parabéns pelos 10 dias de fidelidade! Escolha qualquer sabor disponível hoje para adicionar ao seu pedido com 100% de desconto (R$ 0,00).
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {cookiesDisponiveis.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-2xl border border-cookie-200 flex items-center justify-between hover:border-cookie-400 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img src={c.imagem} alt={c.nome} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-serif font-bold text-xs text-cookie-950">{c.nome}</h4>
                      <span className="text-[10px] text-cookie-500">{c.categoria}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      adicionarCookieGratis(c);
                      setModalResgateAberto(false);
                    }}
                    className="py-1 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-cookie-950 font-bold text-xs"
                  >
                    Resgatar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
