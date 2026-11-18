import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Cookie, 
  Cupom, 
  EnderecoEntrega, 
  FaixaFrete, 
  FormaPagamento, 
  ItemCarrinho, 
  KitSaborItem, 
  TipoEntrega 
} from '../types';
import { calcularTotaisPedido, CalculationResult } from '../utils/pricing';
import { StoreService } from '../services/store';
import { useAuth } from './AuthContext';

interface CartContextType {
  itens: ItemCarrinho[];
  adicionarItem: (cookie: Cookie, quantidade?: number) => void;
  adicionarKit: (tamanho: 3 | 5 | 8, sabores: KitSaborItem[]) => void;
  removerItem: (itemId: string) => void;
  atualizarQuantidade: (itemId: string, novaQtd: number) => void;
  limparCarrinho: () => void;
  
  // Resgate de cookie grátis
  adicionarCookieGratis: (cookie: Cookie) => boolean;
  removerCookieGratis: () => void;
  temCookieGratisNoCarrinho: boolean;

  // Pontos
  pontosUsados: number;
  setPontosUsados: (pontos: number) => void;

  // Cupom
  cupom: Cupom | null;
  aplicarCupom: (codigo: string) => Promise<{ sucesso: boolean; mensagem: string }>;
  removerCupom: () => void;

  // Entrega
  tipoEntrega: TipoEntrega;
  setTipoEntrega: (tipo: TipoEntrega) => void;
  enderecoEntrega?: EnderecoEntrega;
  setEnderecoEntrega: (endereco?: EnderecoEntrega) => void;
  distanciaKm?: number;
  setDistanciaKm: (km: number | undefined) => void;

  // Forma de pagamento
  formaPagamento: FormaPagamento;
  setFormaPagamento: (forma: FormaPagamento) => void;
  trocoPara?: number;
  setTrocoPara: (valor?: number) => void;

  // Observações
  observacoes: string;
  setObservacoes: (obs: string) => void;

  // Totais calculados
  totais: CalculationResult;
  quantidadeTotalItens: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'gabi_cart_state_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { perfil } = useAuth();
  const [faixasFrete, setFaixasFrete] = useState<FaixaFrete[]>([]);

  const [itens, setItens] = useState<ItemCarrinho[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved).itens || [] : [];
    } catch {
      return [];
    }
  });

  const [pontosUsados, setPontosUsadosState] = useState<number>(0);
  const [cupom, setCupom] = useState<Cupom | null>(null);
  const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega>('unisinos_portao_b');
  const [enderecoEntrega, setEnderecoEntrega] = useState<EnderecoEntrega | undefined>(
    perfil.enderecos && perfil.enderecos.length > 0 ? perfil.enderecos[0] : undefined
  );
  const [distanciaKm, setDistanciaKm] = useState<number | undefined>(undefined);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('online_pix');
  const [trocoPara, setTrocoPara] = useState<number | undefined>(undefined);
  const [observacoes, setObservacoes] = useState<string>('');

  // Carrega faixas de frete
  useEffect(() => {
    StoreService.getFaixasFrete().then(setFaixasFrete);
  }, []);

  // Persiste carrinho no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ itens }));
    } catch (e) {
      console.error('Erro ao persistir carrinho:', e);
    }
  }, [itens]);

  // Se o saldo do perfil mudar, ajusta os pontos usados para não estourar
  useEffect(() => {
    if (pontosUsados > perfil.saldo_pontos) {
      setPontosUsadosState(perfil.saldo_pontos);
    }
  }, [perfil.saldo_pontos, pontosUsados]);

  const setPontosUsados = (pts: number) => {
    const maxPermitido = Math.min(100, perfil.saldo_pontos);
    const validado = Math.max(0, Math.min(pts, maxPermitido));
    setPontosUsadosState(validado);
  };

  const adicionarItem = (cookie: Cookie, quantidade: number = 1) => {
    setItens((prev) => {
      const itemExistenteIndex = prev.findIndex(
        (i) => i.tipo === 'unitario' && i.cookie_id === cookie.id && !i.is_gratis
      );

      if (itemExistenteIndex >= 0) {
        const novos = [...prev];
        const atual = novos[itemExistenteIndex];
        const novaQtd = atual.quantidade + quantidade;
        novos[itemExistenteIndex] = {
          ...atual,
          quantidade: novaQtd,
          subtotal: Number((cookie.preco * novaQtd).toFixed(2)),
        };
        return novos;
      }

      const novoItem: ItemCarrinho = {
        id: 'item_' + Math.random().toString(36).substring(2, 9),
        tipo: 'unitario',
        cookie_id: cookie.id,
        cookie,
        quantidade,
        preco_unitario: cookie.preco,
        subtotal: Number((cookie.preco * quantidade).toFixed(2)),
        is_gratis: false,
      };
      return [...prev, novoItem];
    });
  };

  const adicionarKit = (tamanho: 3 | 5 | 8, sabores: KitSaborItem[]) => {
    // Calcula preço unitário base do kit somando os sabores
    const precoUnitarioKit = sabores.reduce((acc, s) => acc + (s.preco || 11.00) * s.quantidade, 0);

    const novoKit: ItemCarrinho = {
      id: 'kit_' + Math.random().toString(36).substring(2, 9),
      tipo: 'kit',
      kit_tamanho: tamanho,
      sabores_kit: sabores,
      quantidade: 1,
      preco_unitario: precoUnitarioKit,
      subtotal: precoUnitarioKit,
      is_gratis: false,
    };

    setItens((prev) => [...prev, novoKit]);
  };

  const adicionarCookieGratis = (cookie: Cookie): boolean => {
    if (perfil.cookies_gratis_disponiveis <= 0) {
      return false;
    }
    // Remove qualquer outro cookie grátis que já estivesse no carrinho
    const semGratis = itens.filter((i) => !i.is_gratis);

    const itemGratis: ItemCarrinho = {
      id: 'gratis_' + Math.random().toString(36).substring(2, 9),
      tipo: 'gratis',
      cookie_id: cookie.id,
      cookie,
      quantidade: 1,
      preco_unitario: 0,
      subtotal: 0,
      is_gratis: true,
    };

    setItens([...semGratis, itemGratis]);
    return true;
  };

  const removerCookieGratis = () => {
    setItens((prev) => prev.filter((i) => !i.is_gratis));
  };

  const removerItem = (itemId: string) => {
    setItens((prev) => prev.filter((i) => i.id !== itemId));
  };

  const atualizarQuantidade = (itemId: string, novaQtd: number) => {
    if (novaQtd <= 0) {
      removerItem(itemId);
      return;
    }
    setItens((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantidade: novaQtd,
            subtotal: Number((item.preco_unitario * novaQtd).toFixed(2)),
          };
        }
        return item;
      })
    );
  };

  const limparCarrinho = () => {
    setItens([]);
    setPontosUsadosState(0);
    setCupom(null);
    setObservacoes('');
    setTrocoPara(undefined);
  };

  const aplicarCupom = async (codigo: string): Promise<{ sucesso: boolean; mensagem: string }> => {
    if (!codigo || !codigo.trim()) {
      return { sucesso: false, mensagem: 'Digite um código de cupom' };
    }
    const cupomValido = await StoreService.validarCupom(codigo);
    if (!cupomValido) {
      return { sucesso: false, mensagem: 'Cupom inválido ou expirado' };
    }
    setCupom(cupomValido);
    return { sucesso: true, mensagem: `Cupom ${cupomValido.codigo} aplicado com sucesso!` };
  };

  const removerCupom = () => {
    setCupom(null);
  };

  // Cálculo rigoroso dos totais
  const totais = calcularTotaisPedido(
    itens,
    pontosUsados,
    cupom,
    tipoEntrega,
    tipoEntrega === 'entrega' ? (distanciaKm ?? enderecoEntrega?.distancia_km ?? 3.5) : 0,
    faixasFrete
  );

  const quantidadeTotalItens = itens.reduce((acc, item) => {
    if (item.tipo === 'kit' && item.kit_tamanho) {
      return acc + item.kit_tamanho * item.quantidade;
    }
    return acc + item.quantidade;
  }, 0);

  const temCookieGratisNoCarrinho = itens.some((i) => i.is_gratis);

  return (
    <CartContext.Provider
      value={{
        itens,
        adicionarItem,
        adicionarKit,
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
        distanciaKm,
        setDistanciaKm,
        formaPagamento,
        setFormaPagamento,
        trocoPara,
        setTrocoPara,
        observacoes,
        setObservacoes,
        totais,
        quantidadeTotalItens,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
};
