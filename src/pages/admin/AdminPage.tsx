import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Flame, 
  UtensilsCrossed, 
  Tag, 
  Settings, 
  CheckCircle, 
  Clock, 
  MessageCircle, 
  Plus, 
  Edit2, 
  Trash2, 
  QrCode, 
  Save, 
  Sparkles,
  Search,
  Filter,
  Check,
  X,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { StoreService } from '../../services/store';
import { Cookie, Cupom, FaixaFrete, Pedido, StatusPedido } from '../../types';
import { formatarPreco } from '../../utils/pricing';

export const AdminPage: React.FC = () => {
  const { 
    cookies, 
    categorias, 
    config, 
    faixasFrete, 
    atualizarDisponibilidadeCookie, 
    atualizarTodosCookiesDisponibilidade, 
    salvarCookie,
    recarregarDados 
  } = useStore();
  const { perfil, isAdmin } = useAuth();

  const [abaAtiva, setAbaAtiva] = useState<'pedidos' | 'disponivel_hoje' | 'cardapio' | 'cupons' | 'configuracoes'>('pedidos');
  
  // Pedidos
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroData, setFiltroData] = useState<string>('');
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null);

  // Cupons
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [novoCupom, setNovoCupom] = useState<Partial<Cupom>>({
    codigo: '',
    tipo: 'porcentagem',
    valor: 10,
    limite_usos: 50,
    ativo: true,
  });

  // Edição de Cookie
  const [modalCookieAberto, setModalCookieAberto] = useState(false);
  const [cookieEmEdicao, setCookieEmEdicao] = useState<Partial<Cookie>>({
    nome: '',
    descricao: '',
    preco: 11.00,
    imagem: '',
    categoria_id: 'cat-tradicionais',
    ativo: true,
    disponivel_hoje: true,
    mais_vendido: false,
    tipo: 'tradicional',
  });

  // Configurações
  const [configLocal, setConfigLocal] = useState(config);
  const [faixasLocal, setFaixasLocal] = useState<FaixaFrete[]>([]);

  const carregarPedidos = async () => {
    const lista = await StoreService.getPedidos();
    setPedidos(lista);
  };

  const carregarCupons = async () => {
    const lista = await StoreService.getCupons();
    setCupons(lista);
  };

  useEffect(() => {
    carregarPedidos();
    carregarCupons();
    setConfigLocal(config);
    setFaixasLocal(faixasFrete);

    const interval = setInterval(() => {
      carregarPedidos();
    }, 4000);

    return () => clearInterval(interval);
  }, [config, faixasFrete]);

  // Ações de Pedidos
  const handleAtualizarStatus = async (pedidoId: string, novoStatus: StatusPedido) => {
    let horario: string | undefined = undefined;
    if (novoStatus === 'pronto') {
      const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      horario = `Pronto às ${horaAtual}`;
    }

    const pedidoAtualizado = await StoreService.atualizarStatusPedido(pedidoId, novoStatus, horario);
    if (pedidoAtualizado) {
      await carregarPedidos();
      if (pedidoSelecionado?.id === pedidoId) {
        setPedidoSelecionado(pedidoAtualizado);
      }
    }
  };

  const handleNotificarProntoWhatsApp = (pedido: Pedido) => {
    const numero = pedido.cliente_whatsapp.replace(/\D/g, '');
    const msg = `Olá ${pedido.cliente_nome}! 🥰 Seu pedido *#${pedido.codigo_exibicao}* da *Gabi Cookies* está prontinho e embalado esperando por você! 🍪✨`;
    window.open(`https://wa.me/55${numero}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleGerarCobrancaEntrega = async (pedidoId: string) => {
    await StoreService.gerarCobrancaAbacatePay(pedidoId, 'PIX');
    await carregarPedidos();
    alert('Cobrança Pix AbacatePay gerada para o pedido! O cliente já pode pagar via Pix.');
  };

  // Cupons
  const handleCriarCupom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoCupom.codigo || !novoCupom.valor) return;

    const cupomCriado: Cupom = {
      id: 'cupom_' + Math.random().toString(36).substring(2, 9),
      codigo: novoCupom.codigo.trim().toUpperCase(),
      tipo: novoCupom.tipo || 'porcentagem',
      valor: Number(novoCupom.valor),
      limite_usos: novoCupom.limite_usos ? Number(novoCupom.limite_usos) : undefined,
      usos_atuais: 0,
      ativo: true,
    };

    await StoreService.salvarCupom(cupomCriado);
    await carregarCupons();
    setNovoCupom({ codigo: '', tipo: 'porcentagem', valor: 10, limite_usos: 50, ativo: true });
  };

  const handleToggleCupom = async (cupom: Cupom) => {
    const atualizado = { ...cupom, ativo: !cupom.ativo };
    await StoreService.salvarCupom(atualizado);
    await carregarCupons();
  };

  // Cookie
  const handleSalvarCookie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cookieEmEdicao.nome || !cookieEmEdicao.preco) return;

    const cookieCompleto: Cookie = {
      id: cookieEmEdicao.id || 'cookie_' + Math.random().toString(36).substring(2, 9),
      nome: cookieEmEdicao.nome,
      descricao: cookieEmEdicao.descricao || '',
      preco: Number(cookieEmEdicao.preco),
      imagem: cookieEmEdicao.imagem || 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
      categoria_id: cookieEmEdicao.categoria_id || 'cat-tradicionais',
      ativo: cookieEmEdicao.ativo ?? true,
      disponivel_hoje: cookieEmEdicao.disponivel_hoje ?? true,
      mais_vendido: cookieEmEdicao.mais_vendido ?? false,
      tipo: cookieEmEdicao.tipo || 'tradicional',
    };

    await salvarCookie(cookieCompleto);
    setModalCookieAberto(false);
  };

  // Configurações
  const handleSalvarConfiguracoes = async (e: React.FormEvent) => {
    e.preventDefault();
    await StoreService.salvarConfig(configLocal);
    await StoreService.salvarFaixasFrete(faixasLocal);
    await recarregarDados();
    alert('Configurações salvas com sucesso!');
  };

  // Filtragem de Pedidos
  const pedidosFiltrados = pedidos.filter((p) => {
    const matchStatus = filtroStatus === 'todos' || p.status === filtroStatus;
    const matchData = !filtroData || p.created_at.startsWith(filtroData);
    return matchStatus && matchData;
  });

  return (
    <div className="space-y-8 pb-20">
      
      {/* CABEÇALHO DO ADMIN */}
      <div className="bg-cookie-950 text-white p-6 sm:p-8 rounded-3xl shadow-warm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Painel de Controle da Gabi</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold">
            Gestão da Loja de Cookies
          </h1>
          <p className="text-xs sm:text-sm text-cookie-300 mt-1">
            Controle pedidos em tempo real, marque as fornadas de hoje e configure preços e cupons.
          </p>
        </div>

        {/* Contador rápido de pedidos pendentes */}
        <div className="flex gap-2">
          <div className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-center">
            <span className="font-serif text-2xl font-bold text-amber-300 block">
              {pedidos.filter((p) => p.status === 'recebido' || p.status === 'em_preparo').length}
            </span>
            <span className="text-[10px] text-cookie-200 uppercase font-semibold">Em Andamento</span>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-center">
            <span className="font-serif text-2xl font-bold text-emerald-400 block">
              {pedidos.filter((p) => p.status === 'concluido').length}
            </span>
            <span className="text-[10px] text-cookie-200 uppercase font-semibold">Concluídos</span>
          </div>
        </div>
      </div>

      {/* ABAS DO PAINEL */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-cookie-200">
        {[
          { id: 'pedidos' as const, label: 'Pedidos em Tempo Real', icon: ClipboardList, badge: pedidos.filter(p => p.status === 'recebido').length },
          { id: 'disponivel_hoje' as const, label: 'Disponível Hoje', icon: Flame },
          { id: 'cardapio' as const, label: 'Cardápio & Preços', icon: UtensilsCrossed },
          { id: 'cupons' as const, label: 'Cupons de Desconto', icon: Tag },
          { id: 'configuracoes' as const, label: 'Frete & Configurações', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const ativo = abaAtiva === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAbaAtiva(tab.id)}
              className={`py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
                ativo
                  ? 'bg-cookie-800 text-white shadow-sm'
                  : 'text-cookie-700 hover:bg-cookie-100 hover:text-cookie-950'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {Boolean(tab.badge && tab.badge > 0) && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ABA 1: PEDIDOS EM TEMPO REAL */}
      {abaAtiva === 'pedidos' && (
        <div className="space-y-6">
          
          {/* Filtros de Pedidos */}
          <div className="p-4 bg-white rounded-2xl border border-cookie-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-cookie-700 uppercase tracking-wider">Status:</span>
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'aguardando_pagamento', label: 'Aguardando Pagamento' },
                { id: 'recebido', label: 'Recebido' },
                { id: 'em_preparo', label: 'Em Preparo' },
                { id: 'pronto', label: 'Pronto' },
                { id: 'saiu_para_entrega', label: 'Saiu p/ Entrega' },
                { id: 'concluido', label: 'Concluído' },
                { id: 'cancelado', label: 'Cancelado' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setFiltroStatus(st.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    filtroStatus === st.id
                      ? 'bg-cookie-800 text-white shadow-xs'
                      : 'bg-cookie-50 text-cookie-700 hover:bg-cookie-100'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-cookie-700">Data:</span>
              <input
                type="date"
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
                className="p-1.5 rounded-lg border border-cookie-200 text-xs"
              />
              {filtroData && (
                <button onClick={() => setFiltroData('')} className="text-cookie-500 font-bold hover:text-cookie-800">
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Lista de Pedidos */}
          {pedidosFiltrados.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-3xl border border-cookie-200 text-xs text-cookie-500">
              Nenhum pedido encontrado com os filtros selecionados.
            </div>
          ) : (
            <div className="space-y-4">
              {pedidosFiltrados.map((pedido) => (
                <div
                  key={pedido.id}
                  className="p-5 rounded-3xl bg-white border border-cookie-200 hover:border-cookie-400 shadow-sm space-y-4 transition-all"
                >
                  {/* Cabeçalho do Card do Pedido */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cookie-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-lg text-cookie-950">
                        Pedido #{pedido.codigo_exibicao}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          pedido.status === 'concluido'
                            ? 'bg-emerald-100 text-emerald-800'
                            : pedido.status === 'pronto'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : pedido.status === 'cancelado'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-cookie-100 text-cookie-800'
                        }`}
                      >
                        {pedido.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="text-xs text-cookie-500">
                      Feito em: {new Date(pedido.created_at).toLocaleString('pt-BR')}
                    </div>
                  </div>

                  {/* Informações do Cliente & Entrega */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-cookie-700 bg-cookie-50/60 p-3 rounded-2xl">
                    <div>
                      <strong className="block text-cookie-900">Cliente:</strong>
                      <span>{pedido.cliente_nome}</span>
                      <span className="block text-cookie-500">{pedido.cliente_whatsapp}</span>
                    </div>

                    <div>
                      <strong className="block text-cookie-900">Entrega / Retirada:</strong>
                      <span>
                        {pedido.tipo_entrega === 'unisinos_portao_b'
                          ? 'Unisinos – Florindas (Portão B)'
                          : pedido.tipo_entrega === 'retirada'
                          ? 'Retirada no Ateliê'
                          : `Entrega no Endereço (${pedido.distancia_km || 0} km)`}
                      </span>
                      {pedido.endereco && (
                        <span className="block text-cookie-500">
                          {pedido.endereco.logradouro}, {pedido.endereco.numero} - {pedido.endereco.bairro}
                        </span>
                      )}
                    </div>

                    <div>
                      <strong className="block text-cookie-900">Pagamento:</strong>
                      <span>{pedido.forma_pagamento.replace(/_/g, ' ').toUpperCase()}</span>
                      {pedido.troco_para && (
                        <span className="block text-amber-700 font-bold">
                          Levar troco para: {formatarPreco(pedido.troco_para)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Itens do Pedido */}
                  <div className="space-y-1.5 text-xs text-cookie-800">
                    <strong className="block text-cookie-950 uppercase tracking-wider text-[11px]">
                      Itens Escolhidos:
                    </strong>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {pedido.itens.map((item, i) => (
                        <div key={i} className="p-2 bg-cookie-50 rounded-xl border border-cookie-100">
                          <div className="flex justify-between font-bold text-cookie-950">
                            <span>
                              {item.quantidade}x {item.cookie?.nome || `Kit com ${item.kit_tamanho} cookies`}
                            </span>
                            <span>{item.is_gratis ? 'GRÁTIS' : formatarPreco(item.subtotal)}</span>
                          </div>
                          {item.tipo === 'kit' && item.sabores_kit && (
                            <div className="text-[10px] text-cookie-600 mt-0.5">
                              {item.sabores_kit.map((s) => `${s.quantidade}x ${s.nome}`).join(' • ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resumo Financeiro */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-cookie-100">
                    <div className="flex flex-wrap gap-3 text-cookie-600">
                      <span>Subtotal: {formatarPreco(pedido.subtotal)}</span>
                      {pedido.desconto_kit > 0 && <span>Kit: -{formatarPreco(pedido.desconto_kit)}</span>}
                      {pedido.desconto_pontos > 0 && <span>Pontos: -{formatarPreco(pedido.desconto_pontos)}</span>}
                      {pedido.desconto_cupom > 0 && <span>Cupom: -{formatarPreco(pedido.desconto_cupom)}</span>}
                      <span>Frete: {formatarPreco(pedido.frete)}</span>
                    </div>

                    <div className="font-serif text-lg font-bold text-cookie-950">
                      Total: {formatarPreco(pedido.total)}
                    </div>
                  </div>

                  {/* BOTÕES DE MUDANÇA DE STATUS & AÇÕES RÁPIDAS */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-cookie-100">
                    
                    {/* Botão de WhatsApp "Seu Pedido está pronto" se status for ou virar 'pronto' */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleNotificarProntoWhatsApp(pedido)}
                        className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                        title="Avisar cliente no WhatsApp que está pronto"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Avisar Pronto no WhatsApp</span>
                      </button>

                      {/* Botão "Gerar Cobrança" para pagamento na entrega */}
                      {pedido.forma_pagamento.startsWith('entrega_') && !pedido.id_cobranca && (
                        <button
                          onClick={() => handleGerarCobrancaEntrega(pedido.id)}
                          className="py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-cookie-950 font-bold text-xs flex items-center gap-1.5 shadow-xs"
                          title="Gerar QR Code Pix para cliente pagar no ato"
                        >
                          <QrCode className="w-4 h-4" />
                          <span>Gerar Cobrança Pix AbacatePay</span>
                        </button>
                      )}
                    </div>

                    {/* Stepper Rápido de Mudança de Status */}
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-semibold text-cookie-500 mr-1">Mudar para:</span>
                      
                      {pedido.status !== 'em_preparo' && pedido.status !== 'concluido' && (
                        <button
                          onClick={() => handleAtualizarStatus(pedido.id, 'em_preparo')}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 hover:bg-amber-200"
                        >
                          Em Preparo
                        </button>
                      )}

                      {pedido.status !== 'pronto' && pedido.status !== 'concluido' && (
                        <button
                          onClick={() => handleAtualizarStatus(pedido.id, 'pronto')}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-100 text-blue-900 hover:bg-blue-200"
                        >
                          Pronto
                        </button>
                      )}

                      {pedido.tipo_entrega === 'entrega' && pedido.status !== 'saiu_para_entrega' && pedido.status !== 'concluido' && (
                        <button
                          onClick={() => handleAtualizarStatus(pedido.id, 'saiu_para_entrega')}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-purple-100 text-purple-900 hover:bg-purple-200"
                        >
                          Saiu p/ Entrega
                        </button>
                      )}

                      {pedido.status !== 'concluido' && (
                        <button
                          onClick={() => handleAtualizarStatus(pedido.id, 'concluido')}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                          title="Concluir pedido e creditar fidelidade ao cliente"
                        >
                          Concluir (Creditar Fidelidade)
                        </button>
                      )}

                      {pedido.status !== 'cancelado' && (
                        <button
                          onClick={() => handleAtualizarStatus(pedido.id, 'cancelado')}
                          className="px-2 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ABA 2: DISPONÍVEL HOJE */}
      {abaAtiva === 'disponivel_hoje' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-cookie-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-cookie-950">
                Fornada do Dia: O que saiu do forno hoje?
              </h2>
              <p className="text-xs sm:text-sm text-cookie-600">
                Marque rapidamente os cookies que você assou para o dia. Cookies desmarcados aparecerão como esgotados para compra avulsa e montagem de kits.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => atualizarTodosCookiesDisponibilidade(true)}
                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
              >
                Disponibilizar Todos
              </button>
              <button
                onClick={() => atualizarTodosCookiesDisponibilidade(false)}
                className="py-2 px-4 rounded-xl bg-cookie-200 hover:bg-cookie-300 text-cookie-800 text-xs font-bold"
              >
                Zerar Todos
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cookies.map((cookie) => (
              <div
                key={cookie.id}
                className={`p-4 rounded-3xl border transition-all flex items-center justify-between gap-3 ${
                  cookie.disponivel_hoje
                    ? 'bg-white border-emerald-300 shadow-sm'
                    : 'bg-cookie-50/80 border-cookie-200 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={cookie.imagem}
                    alt={cookie.nome}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-serif font-bold text-cookie-950 text-sm truncate">
                      {cookie.nome}
                    </h4>
                    <span className="text-xs font-bold text-cookie-700">
                      {formatarPreco(cookie.preco)} &bull; {cookie.categoria}
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={cookie.disponivel_hoje}
                    onChange={(e) => atualizarDisponibilidadeCookie(cookie.id, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-cookie-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-cookie-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 3: CARDÁPIO & PREÇOS */}
      {abaAtiva === 'cardapio' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-cookie-950">
                Cardápio Completo
              </h2>
              <p className="text-xs sm:text-sm text-cookie-600">
                Gerencie todos os sabores, altere fotos, descrições e preços base.
              </p>
            </div>

            <button
              onClick={() => {
                setCookieEmEdicao({
                  nome: '',
                  descricao: '',
                  preco: 11.00,
                  imagem: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
                  categoria_id: 'cat-tradicionais',
                  ativo: true,
                  disponivel_hoje: true,
                  mais_vendido: false,
                  tipo: 'tradicional',
                });
                setModalCookieAberto(true);
              }}
              className="py-2.5 px-4 rounded-xl bg-cookie-800 hover:bg-cookie-900 text-white font-bold text-xs flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Cookie</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cookies.map((cookie) => (
              <div
                key={cookie.id}
                className="p-4 bg-white rounded-3xl border border-cookie-200 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={cookie.imagem}
                    alt={cookie.nome}
                    className="w-16 h-16 rounded-2xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-cookie-500 uppercase tracking-wider block">
                      {cookie.categoria}
                    </span>
                    <h3 className="font-serif font-bold text-cookie-950 text-base truncate">
                      {cookie.nome}
                    </h3>
                    <span className="font-bold text-cookie-800 text-sm">
                      {formatarPreco(cookie.preco)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-cookie-600 line-clamp-2">
                  {cookie.descricao}
                </p>

                <div className="pt-2 border-t border-cookie-100 flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    cookie.disponivel_hoje ? 'bg-emerald-100 text-emerald-800' : 'bg-cookie-100 text-cookie-600'
                  }`}>
                    {cookie.disponivel_hoje ? 'Disponível Hoje' : 'Esgotado Hoje'}
                  </span>

                  <button
                    onClick={() => {
                      setCookieEmEdicao(cookie);
                      setModalCookieAberto(true);
                    }}
                    className="py-1.5 px-3 rounded-lg bg-cookie-100 hover:bg-cookie-200 text-cookie-900 text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Editar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 4: CUPONS DE DESCONTO */}
      {abaAtiva === 'cupons' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-cookie-200 shadow-sm space-y-4">
            <h2 className="font-serif text-xl font-bold text-cookie-950">
              Criar Novo Cupom
            </h2>
            <form onSubmit={handleCriarCupom} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="text-xs font-semibold text-cookie-700 block mb-1">Código do Cupom:</label>
                <input
                  type="text"
                  placeholder="Ex: PROMO10"
                  value={novoCupom.codigo}
                  onChange={(e) => setNovoCupom({ ...novoCupom, codigo: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 rounded-xl border border-cookie-200 text-xs uppercase"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-cookie-700 block mb-1">Tipo de Desconto:</label>
                <select
                  value={novoCupom.tipo}
                  onChange={(e) => setNovoCupom({ ...novoCupom, tipo: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-cookie-200 text-xs"
                >
                  <option value="porcentagem">Porcentagem (%)</option>
                  <option value="fixo">Valor Fixo (R$)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-cookie-700 block mb-1">
                  Valor {novoCupom.tipo === 'porcentagem' ? '(%)' : '(R$)'}:
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={novoCupom.valor}
                  onChange={(e) => setNovoCupom({ ...novoCupom, valor: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-cookie-200 text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                className="py-2.5 px-4 rounded-xl bg-cookie-800 hover:bg-cookie-900 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Cupom</span>
              </button>
            </form>
          </div>

          {/* Lista de Cupons Existentes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cupons.map((c) => (
              <div
                key={c.id}
                className={`p-4 rounded-3xl border bg-white shadow-sm flex flex-col justify-between space-y-3 ${
                  c.ativo ? 'border-cookie-200' : 'border-cookie-200/50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-lg text-cookie-950">
                    {c.codigo}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {c.tipo === 'porcentagem' ? `${c.valor}% OFF` : `${formatarPreco(c.valor)} OFF`}
                  </span>
                </div>

                <div className="text-xs text-cookie-600">
                  Usos atuais: <strong>{c.usos_atuais}</strong>
                  {c.limite_usos && ` de ${c.limite_usos} usos permitidos`}
                </div>

                <div className="pt-2 border-t border-cookie-100 flex items-center justify-between">
                  <span className={`text-[10px] font-bold ${c.ativo ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {c.ativo ? 'Ativo' : 'Desativado'}
                  </span>
                  <button
                    onClick={() => handleToggleCupom(c)}
                    className="text-xs text-cookie-700 hover:text-cookie-950 font-semibold"
                  >
                    {c.ativo ? 'Desativar' : 'Reativar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 5: CONFIGURAÇÕES & FRETE */}
      {abaAtiva === 'configuracoes' && (
        <form onSubmit={handleSalvarConfiguracoes} className="space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-cookie-200 shadow-sm space-y-4">
            <h2 className="font-serif text-xl font-bold text-cookie-950">
              Dados de Contato & Ponto de Encontro
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-cookie-700 block mb-1">WhatsApp da Gabi:</label>
                <input
                  type="text"
                  value={configLocal.whatsapp_gabi}
                  onChange={(e) => setConfigLocal({ ...configLocal, whatsapp_gabi: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-cookie-200"
                />
              </div>
              <div>
                <label className="font-semibold text-cookie-700 block mb-1">Instagram da Gabi:</label>
                <input
                  type="text"
                  value={configLocal.instagram_gabi}
                  onChange={(e) => setConfigLocal({ ...configLocal, instagram_gabi: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-cookie-200"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold text-cookie-700 block mb-1">Ponto de Entrega Grátis:</label>
                <input
                  type="text"
                  value={configLocal.ponto_entrega_nome}
                  onChange={(e) => setConfigLocal({ ...configLocal, ponto_entrega_nome: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-cookie-200"
                />
              </div>
            </div>
          </div>

          {/* Faixas de Frete por KM */}
          <div className="p-6 bg-white rounded-3xl border border-cookie-200 shadow-sm space-y-4">
            <h2 className="font-serif text-xl font-bold text-cookie-950">
              Faixas de Frete a Partir da Unisinos São Leopoldo
            </h2>
            <p className="text-xs text-cookie-600">
              Valores cobrados por distância calculada até o campus São Leopoldo.
            </p>

            <div className="space-y-2">
              {faixasLocal.map((faixa, idx) => (
                <div key={faixa.id} className="grid grid-cols-3 gap-3 items-center text-xs">
                  <div>
                    <label className="text-cookie-500 block text-[10px]">De (km):</label>
                    <input
                      type="number"
                      value={faixa.km_inicial}
                      onChange={(e) => {
                        const copy = [...faixasLocal];
                        copy[idx].km_inicial = Number(e.target.value);
                        setFaixasLocal(copy);
                      }}
                      className="w-full p-2 rounded-xl border border-cookie-200"
                    />
                  </div>
                  <div>
                    <label className="text-cookie-500 block text-[10px]">Até (km):</label>
                    <input
                      type="number"
                      value={faixa.km_final}
                      onChange={(e) => {
                        const copy = [...faixasLocal];
                        copy[idx].km_final = Number(e.target.value);
                        setFaixasLocal(copy);
                      }}
                      className="w-full p-2 rounded-xl border border-cookie-200"
                    />
                  </div>
                  <div>
                    <label className="text-cookie-500 block text-[10px]">Valor (R$):</label>
                    <input
                      type="number"
                      step="0.5"
                      value={faixa.valor}
                      onChange={(e) => {
                        const copy = [...faixasLocal];
                        copy[idx].valor = Number(e.target.value);
                        setFaixasLocal(copy);
                      }}
                      className="w-full p-2 rounded-xl border border-cookie-200"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="py-3 px-6 rounded-2xl bg-cookie-800 hover:bg-cookie-900 text-white font-bold text-sm flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Todas as Configurações</span>
          </button>
        </form>
      )}

      {/* MODAL DE EDIÇÃO DE COOKIE */}
      {modalCookieAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cookie-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-cookie-200">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-cookie-950">
                {cookieEmEdicao.id ? 'Editar Cookie' : 'Novo Cookie'}
              </h3>
              <button
                onClick={() => setModalCookieAberto(false)}
                className="text-cookie-400 hover:text-cookie-800 text-xs font-bold"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleSalvarCookie} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-cookie-700 block mb-1">Nome do Cookie:</label>
                <input
                  type="text"
                  value={cookieEmEdicao.nome}
                  onChange={(e) => setCookieEmEdicao({ ...cookieEmEdicao, nome: e.target.value })}
                  className="w-full p-2 rounded-xl border border-cookie-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-cookie-700 block mb-1">Preço Base (R$):</label>
                  <input
                    type="number"
                    step="0.50"
                    value={cookieEmEdicao.preco}
                    onChange={(e) => setCookieEmEdicao({ ...cookieEmEdicao, preco: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-cookie-200"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-cookie-700 block mb-1">Categoria:</label>
                  <select
                    value={cookieEmEdicao.categoria_id}
                    onChange={(e) => setCookieEmEdicao({ ...cookieEmEdicao, categoria_id: e.target.value })}
                    className="w-full p-2 rounded-xl border border-cookie-200"
                  >
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-cookie-700 block mb-1">URL da Imagem:</label>
                <input
                  type="text"
                  value={cookieEmEdicao.imagem}
                  onChange={(e) => setCookieEmEdicao({ ...cookieEmEdicao, imagem: e.target.value })}
                  className="w-full p-2 rounded-xl border border-cookie-200"
                />
              </div>

              <div>
                <label className="font-semibold text-cookie-700 block mb-1">Descrição Artesanal:</label>
                <textarea
                  rows={2}
                  value={cookieEmEdicao.descricao}
                  onChange={(e) => setCookieEmEdicao({ ...cookieEmEdicao, descricao: e.target.value })}
                  className="w-full p-2 rounded-xl border border-cookie-200 resize-none"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-cookie-800">
                  <input
                    type="checkbox"
                    checked={cookieEmEdicao.mais_vendido}
                    onChange={(e) => setCookieEmEdicao({ ...cookieEmEdicao, mais_vendido: e.target.checked })}
                    className="accent-cookie-800"
                  />
                  <span>Destaque Mais Vendido</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-cookie-800">
                  <input
                    type="checkbox"
                    checked={cookieEmEdicao.disponivel_hoje}
                    onChange={(e) => setCookieEmEdicao({ ...cookieEmEdicao, disponivel_hoje: e.target.checked })}
                    className="accent-cookie-800"
                  />
                  <span>Disponível Hoje</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalCookieAberto(false)}
                  className="py-2 px-4 rounded-xl border border-cookie-200 text-cookie-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-cookie-800 text-white font-bold"
                >
                  Salvar Cookie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
