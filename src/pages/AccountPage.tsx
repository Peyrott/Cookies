import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Gift, 
  Clock, 
  MapPin, 
  User, 
  Check, 
  Sparkles, 
  ArrowRight,
  Package,
  History,
  Phone,
  Mail,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { StoreService } from '../services/store';
import { Pedido, MovimentoFidelidade, Cookie } from '../types';
import { formatarPreco } from '../utils/pricing';
import { useNavigate } from 'react-router-dom';

export const AccountPage: React.FC = () => {
  const { perfil, atualizarDadosPerfil, recarregarPerfil } = useAuth();
  const { adicionarCookieGratis } = useCart();
  const { cookies } = useStore();
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [movimentos, setMovimentos] = useState<MovimentoFidelidade[]>([]);
  const [editandoDados, setEditandoDados] = useState(false);
  const [nome, setNome] = useState(perfil.nome);
  const [whatsapp, setWhatsapp] = useState(perfil.whatsapp);
  const [email, setEmail] = useState(perfil.email || '');
  const [modalResgateAberto, setModalResgateAberto] = useState(false);

  useEffect(() => {
    StoreService.getPedidos().then((lista) => {
      setPedidos(lista.filter((p) => p.cliente_id === perfil.id));
    });
    StoreService.getMovimentosFidelidade(perfil.id).then(setMovimentos);
  }, [perfil.id]);

  const handleSalvarDados = async (e: React.FormEvent) => {
    e.preventDefault();
    await atualizarDadosPerfil(nome, whatsapp, email);
    setEditandoDados(false);
  };

  const handleResgatarCookie = (cookie: Cookie) => {
    adicionarCookieGratis(cookie);
    setModalResgateAberto(false);
    navigate('/carrinho');
  };

  const cookiesDisponiveis = cookies.filter((c) => c.ativo && c.disponivel_hoje);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* CABEÇALHO DO PERFIL */}
      <div className="bg-gradient-to-r from-cookie-900 to-cookie-800 rounded-3xl p-6 sm:p-8 text-white shadow-warm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 text-cookie-950 flex items-center justify-center font-serif text-2xl font-bold shadow-inner">
            {perfil.nome ? perfil.nome.charAt(0).toUpperCase() : 'C'}
          </div>
          <div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
              Conta do Cliente
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              {perfil.nome}
            </h1>
            <p className="text-xs text-cookie-200 mt-0.5">
              WhatsApp: {perfil.whatsapp} {perfil.email && `• ${perfil.email}`}
            </p>
          </div>
        </div>

        <button
          onClick={() => setEditandoDados(!editandoDados)}
          className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all shrink-0"
        >
          {editandoDados ? 'Cancelar Edição' : 'Editar Meus Dados'}
        </button>
      </div>

      {/* FORMULÁRIO DE EDIÇÃO */}
      {editandoDados && (
        <form onSubmit={handleSalvarDados} className="p-6 rounded-3xl bg-white border border-cookie-200 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-cookie-950 text-base">
            Atualizar Informações de Contato
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-cookie-700 block mb-1">Nome:</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-cookie-200 text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-cookie-700 block mb-1">WhatsApp:</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-cookie-200 text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-cookie-700 block mb-1">E-mail (Opcional):</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-cookie-200 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            className="py-2 px-5 rounded-xl bg-cookie-800 text-white font-bold text-xs hover:bg-cookie-900"
          >
            Salvar Alterações
          </button>
        </form>
      )}

      {/* PAINEL DE BENEFÍCIOS: CARTÃO FIDELIDADE 10 DIAS + PONTOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CARTÃO DE 10 DIAS */}
        <div className="p-6 rounded-3xl bg-white border border-cookie-200 shadow-warm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Cartão Fidelidade
              </span>
              <span className="text-xs text-cookie-500 font-medium">1 carimbo por compra/dia</span>
            </div>

            <h3 className="font-serif text-xl font-bold text-cookie-950">
              {perfil.dias_fidelidade} de 10 Dias Concluídos
            </h3>
            <p className="text-xs text-cookie-600">
              Ao completar 10 dias de compras concluídas, você ganha 1 cookie de qualquer sabor disponível inteiramente grátis!
            </p>
          </div>

          {/* Grid dos 10 Carimbos */}
          <div className="grid grid-cols-5 gap-2.5 pt-2">
            {[...Array(10)].map((_, i) => {
              const carimbado = i < perfil.dias_fidelidade;
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center transition-all ${
                    carimbado
                      ? 'bg-amber-400 border-2 border-amber-500 text-cookie-950 shadow-sm'
                      : 'bg-cookie-50 border-2 border-dashed border-cookie-200 text-cookie-400'
                  }`}
                >
                  <span className="text-lg">{carimbado ? '🍪' : i + 1}</span>
                  <span className="text-[9px] font-bold mt-0.5">
                    {carimbado ? 'OK' : `Dia ${i + 1}`}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Botão de Resgate de Cookie Grátis se tiver disponível */}
          {perfil.cookies_gratis_disponiveis > 0 ? (
            <div className="pt-2">
              <button
                onClick={() => setModalResgateAberto(true)}
                className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-cookie-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Gift className="w-4 h-4" />
                <span>
                  Resgatar 1 Cookie Grátis ({perfil.cookies_gratis_disponiveis} disponível!)
                </span>
              </button>
            </div>
          ) : (
            <div className="text-[11px] text-cookie-500 text-center pt-2">
              Faltam apenas {10 - perfil.dias_fidelidade} compras diárias para o seu próximo cookie grátis!
            </div>
          )}
        </div>

        {/* SALDO DE PONTOS ACUMULADOS */}
        <div className="p-6 rounded-3xl bg-white border border-cookie-200 shadow-warm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Pontos de Desconto
              </span>
              <Award className="w-5 h-5 text-amber-500" />
            </div>

            <h3 className="font-serif text-xl font-bold text-cookie-950">
              Seu Saldo Atual de Pontos
            </h3>
            <p className="text-xs text-cookie-600">
              Cada cookie comprado gera 1 ponto. Cada ponto vale 1% de desconto nos produtos da sua próxima compra.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-1">
            <span className="font-serif text-4xl sm:text-5xl font-bold text-cookie-950 block">
              {perfil.saldo_pontos}
            </span>
            <span className="text-xs font-semibold text-cookie-700 block">
              Pontos disponíveis = até {Math.min(100, perfil.saldo_pontos)}% de desconto
            </span>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => navigate('/cardapio')}
              className="w-full py-3 px-4 rounded-2xl bg-cookie-800 hover:bg-cookie-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Usar Pontos no Cardápio</span>
            </button>
          </div>
        </div>

      </div>

      {/* HISTÓRICO DE PEDIDOS */}
      <div className="p-6 rounded-3xl bg-white border border-cookie-200 shadow-warm space-y-4">
        <div className="flex items-center justify-between border-b border-cookie-100 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cookie-800" />
            <h3 className="font-serif font-bold text-cookie-950 text-lg">
              Meus Pedidos Recentes
            </h3>
          </div>
          <span className="text-xs text-cookie-500 font-medium">
            {pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'}
          </span>
        </div>

        {pedidos.length === 0 ? (
          <div className="py-8 text-center text-xs text-cookie-500">
            Você ainda não fez nenhum pedido. Experimente nossa fornada de hoje!
          </div>
        ) : (
          <div className="space-y-3">
            {pedidos.map((ped) => (
              <div
                key={ped.id}
                onClick={() => navigate(`/pedido/${ped.id}`)}
                className="p-4 rounded-2xl border border-cookie-200 hover:border-cookie-400 hover:bg-cookie-50/50 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-cookie-950 text-base">
                      #{ped.codigo_exibicao}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-cookie-100 text-cookie-800">
                      {ped.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-cookie-600 mt-1">
                    {ped.itens.map((i) => `${i.quantidade}x ${i.cookie?.nome || 'Kit'}`).join(', ')}
                  </p>
                  <span className="text-[11px] text-cookie-400 mt-0.5 block">
                    {new Date(ped.created_at).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(ped.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-cookie-100">
                  <span className="font-serif font-bold text-base text-cookie-950">
                    {formatarPreco(ped.total)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-cookie-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE RESGATE DE COOKIE GRÁTIS */}
      {modalResgateAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cookie-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-cookie-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-600" />
                <h3 className="font-serif text-xl font-bold text-cookie-950">
                  Resgatar seu Cookie Grátis
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
              Escolha qual sabor você quer receber de presente no seu carrinho:
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
                    onClick={() => handleResgatarCookie(c)}
                    className="py-1 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-cookie-950 font-bold text-xs"
                  >
                    Escolher
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
