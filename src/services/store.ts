import { 
  Categoria, 
  Cookie, 
  Cupom, 
  FaixaFrete, 
  FaqItem, 
  ConfigSite, 
  Pedido, 
  Perfil, 
  MovimentoFidelidade, 
  StatusPedido,
  FormaPagamento
} from '../types';
import { 
  CATEGORIAS_INICIAIS, 
  COOKIES_INICIAIS, 
  FAIXAS_FRETE_INICIAIS, 
  CUPONS_INICIAIS, 
  CONFIG_INICIAL, 
  FAQ_INICIAL 
} from '../data/initialData';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  COOKIES: 'gabi_cookies_items',
  CATALOG_VERSION: 'gabi_catalog_version',
  CATEGORIAS: 'gabi_categorias',
  CUPONS: 'gabi_cupons',
  FAIXAS_FRETE: 'gabi_faixas_frete',
  CONFIG: 'gabi_config',
  FAQ: 'gabi_faq',
  PEDIDOS: 'gabi_pedidos',
  PERFIS: 'gabi_perfis',
  MOVIMENTOS: 'gabi_movimentos_fidelidade',
  CURRENT_USER: 'gabi_current_user',
};

const CURRENT_CATALOG_VERSION = 'gabi-cardapio-v2';

// Inicialização segura do localStorage
function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Erro ao ler localStorage key ${key}:`, e);
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispara evento para reatividade entre abas ou componentes
    window.dispatchEvent(new Event('gabi_storage_updated'));
  } catch (e) {
    console.error(`Erro ao salvar no localStorage key ${key}:`, e);
  }
}

// Inicializa dados no localStorage se vazios ou se ainda contiverem fotos antigas
export function inicializarArmazenamento(): void {
  const savedCookiesRaw = localStorage.getItem(STORAGE_KEYS.COOKIES);
  const savedCatalogVersion = localStorage.getItem(STORAGE_KEYS.CATALOG_VERSION);
  if (
    !savedCookiesRaw ||
    savedCatalogVersion !== CURRENT_CATALOG_VERSION ||
    savedCookiesRaw.includes('images.unsplash.com')
  ) {
    setLocal(STORAGE_KEYS.COOKIES, COOKIES_INICIAIS);
    localStorage.setItem(STORAGE_KEYS.CATALOG_VERSION, CURRENT_CATALOG_VERSION);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIAS)) {
    setLocal(STORAGE_KEYS.CATEGORIAS, CATEGORIAS_INICIAIS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CUPONS)) {
    setLocal(STORAGE_KEYS.CUPONS, CUPONS_INICIAIS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.FAIXAS_FRETE)) {
    setLocal(STORAGE_KEYS.FAIXAS_FRETE, FAIXAS_FRETE_INICIAIS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
    setLocal(STORAGE_KEYS.CONFIG, CONFIG_INICIAL);
  }
  if (!localStorage.getItem(STORAGE_KEYS.FAQ)) {
    setLocal(STORAGE_KEYS.FAQ, FAQ_INICIAL);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PEDIDOS)) {
    setLocal(STORAGE_KEYS.PEDIDOS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.MOVIMENTOS)) {
    setLocal(STORAGE_KEYS.MOVIMENTOS, []);
  }
}

export const StoreService = {
  // COOKIES
  async getCookies(): Promise<Cookie[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('cookies').select('*').order('nome');
      if (!error && data && data.length > 0) {
        const hasLegacyUnsplash = data.some((c: Cookie) => c.imagem?.includes('images.unsplash.com'));
        if (!hasLegacyUnsplash) {
          const categoriasMap = new Map(CATEGORIAS_INICIAIS.map((cat) => [cat.id, cat.nome]));
          return data.map((c: Cookie) => ({
            ...c,
            categoria: c.categoria || categoriasMap.get(c.categoria_id) || '',
          }));
        }
      }
    }
    return getLocal<Cookie[]>(STORAGE_KEYS.COOKIES, COOKIES_INICIAIS);
  },

  async salvarCookie(cookie: Cookie): Promise<Cookie> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('cookies').upsert(cookie);
    }
    const cookies = getLocal<Cookie[]>(STORAGE_KEYS.COOKIES, COOKIES_INICIAIS);
    const index = cookies.findIndex((c) => c.id === cookie.id);
    let novosCookies: Cookie[];
    if (index >= 0) {
      novosCookies = [...cookies];
      novosCookies[index] = cookie;
    } else {
      novosCookies = [cookie, ...cookies];
    }
    setLocal(STORAGE_KEYS.COOKIES, novosCookies);
    return cookie;
  },

  async setCookieDisponibilidade(id: string, disponivel: boolean): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('cookies').update({ disponivel_hoje: disponivel }).eq('id', id);
    }
    const cookies = getLocal<Cookie[]>(STORAGE_KEYS.COOKIES, COOKIES_INICIAIS);
    const atualizados = cookies.map((c) => (c.id === id ? { ...c, disponivel_hoje: disponivel } : c));
    setLocal(STORAGE_KEYS.COOKIES, atualizados);
  },

  async setAllCookiesDisponibilidade(disponivel: boolean): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('cookies').update({ disponivel_hoje: disponivel }).neq('id', '');
    }
    const cookies = getLocal<Cookie[]>(STORAGE_KEYS.COOKIES, COOKIES_INICIAIS);
    const atualizados = cookies.map((c) => ({ ...c, disponivel_hoje: disponivel }));
    setLocal(STORAGE_KEYS.COOKIES, atualizados);
  },

  // CATEGORIAS
  async getCategorias(): Promise<Categoria[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('categorias').select('*').order('ordem');
      if (!error && data) return data;
    }
    return getLocal<Categoria[]>(STORAGE_KEYS.CATEGORIAS, CATEGORIAS_INICIAIS);
  },

  // CUPONS
  async getCupons(): Promise<Cupom[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('cupons').select('*');
      if (!error && data) return data;
    }
    return getLocal<Cupom[]>(STORAGE_KEYS.CUPONS, CUPONS_INICIAIS);
  },

  async validarCupom(codigo: string): Promise<Cupom | null> {
    const clean = codigo.trim().toUpperCase();
    const cupons = await this.getCupons();
    const cupom = cupons.find((c) => c.codigo.toUpperCase() === clean && c.ativo);
    if (!cupom) return null;
    if (cupom.limite_usos && cupom.usos_atuais >= cupom.limite_usos) return null;
    return cupom;
  },

  async salvarCupom(cupom: Cupom): Promise<Cupom> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('cupons').upsert(cupom);
    }
    const cupons = getLocal<Cupom[]>(STORAGE_KEYS.CUPONS, CUPONS_INICIAIS);
    const idx = cupons.findIndex((c) => c.id === cupom.id);
    let novos: Cupom[];
    if (idx >= 0) {
      novos = [...cupons];
      novos[idx] = cupom;
    } else {
      novos = [cupom, ...cupons];
    }
    setLocal(STORAGE_KEYS.CUPONS, novos);
    return cupom;
  },

  // FAIXAS DE FRETE
  async getFaixasFrete(): Promise<FaixaFrete[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('faixas_frete').select('*').order('km_inicial');
      if (!error && data) return data;
    }
    return getLocal<FaixaFrete[]>(STORAGE_KEYS.FAIXAS_FRETE, FAIXAS_FRETE_INICIAIS);
  },

  async salvarFaixasFrete(faixas: FaixaFrete[]): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('faixas_frete').delete().neq('id', '');
      await supabase.from('faixas_frete').insert(faixas);
    }
    setLocal(STORAGE_KEYS.FAIXAS_FRETE, faixas);
  },

  // CONFIG
  async getConfig(): Promise<ConfigSite> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('config').select('valor').eq('chave', 'geral').single();
      if (!error && data?.valor) return data.valor;
    }
    return getLocal<ConfigSite>(STORAGE_KEYS.CONFIG, CONFIG_INICIAL);
  },

  async salvarConfig(config: ConfigSite): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('config').upsert({ chave: 'geral', valor: config });
    }
    setLocal(STORAGE_KEYS.CONFIG, config);
  },

  // FAQ
  async getFaq(): Promise<FaqItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('faq').select('*').order('ordem');
      if (!error && data) return data;
    }
    return getLocal<FaqItem[]>(STORAGE_KEYS.FAQ, FAQ_INICIAL);
  },

  // PEDIDOS
  async getPedidos(): Promise<Pedido[]> {
    const localPedidos = getLocal<Pedido[]>(STORAGE_KEYS.PEDIDOS, []);
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*, pedido_itens(*)')
        .order('created_at', { ascending: false });
      if (!error && data) {
        const supabaseIds = new Set(data.map((p: Pedido) => p.id));
        const apenasLocais = localPedidos.filter((p) => !supabaseIds.has(p.id));
        return [...apenasLocais, ...(data as Pedido[])];
      }
    }
    return localPedidos;
  },

  async getPedidoById(id: string): Promise<Pedido | null> {
    const pedidos = await this.getPedidos();
    return pedidos.find((p) => p.id === id || p.codigo_exibicao === id) || null;
  },

  async criarPedido(pedidoData: Omit<Pedido, 'id' | 'codigo_exibicao' | 'created_at' | 'status'> & { status?: StatusPedido }): Promise<Pedido> {
    const id = 'ped_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const codigo_exibicao = 'GC-' + Math.floor(1000 + Math.random() * 9000);
    const now = new Date().toISOString();

    const novoPedido: Pedido = {
      ...pedidoData,
      id,
      codigo_exibicao,
      status: pedidoData.status || (
        pedidoData.forma_pagamento === 'online_pix' || pedidoData.forma_pagamento === 'online_cartao'
          ? 'aguardando_pagamento'
          : 'recebido'
      ),
      created_at: now,
      updated_at: now,
    };

    // Gera dados de cobrança Pix se for pagamento online
    if (novoPedido.forma_pagamento === 'online_pix' || novoPedido.forma_pagamento === 'online_cartao') {
      const mockPixCode = `00020126580014br.gov.bcb.pix0136${novoPedido.id}520400005303986540${novoPedido.total.toFixed(2)}5802BR5916Gabi Cookies6013Sao Leopoldo62070503***6304`;
      novoPedido.pix_copia_cola = mockPixCode;
      novoPedido.pix_qr_code_url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(mockPixCode)}`;
      novoPedido.cobranca_expira_em = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      novoPedido.status = 'aguardando_pagamento';
    } else {
      novoPedido.status = 'recebido';
    }

    // Se o usuário usou pontos, deduz do saldo
    if (novoPedido.pontos_usados > 0 && novoPedido.cliente_id) {
      await this.atualizarPontosCliente(
        novoPedido.cliente_id,
        -novoPedido.pontos_usados,
        'ponto_usado',
        `Pontos utilizados no pedido #${novoPedido.codigo_exibicao}`,
        novoPedido.id
      );
    }

    // Se no pedido havia cookie grátis resgatado, consome 1 cookie grátis do cliente
    const temCookieGratis = novoPedido.itens.some((i) => i.is_gratis);
    if (temCookieGratis && novoPedido.cliente_id) {
      await this.consumirCookieGratis(novoPedido.cliente_id, novoPedido.id);
    }

    // Se usou cupom, incrementa usos
    if (novoPedido.cupom_codigo) {
      const cupons = await this.getCupons();
      const cupom = cupons.find((c) => c.codigo.toUpperCase() === novoPedido.cupom_codigo?.toUpperCase());
      if (cupom) {
        cupom.usos_atuais += 1;
        await this.salvarCupom(cupom);
      }
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('pedidos').insert([novoPedido]);
      } catch (e) {
        console.warn('Erro ao inserir pedido no Supabase, usando local:', e);
      }
    }

    const pedidos = getLocal<Pedido[]>(STORAGE_KEYS.PEDIDOS, []);
    setLocal(STORAGE_KEYS.PEDIDOS, [novoPedido, ...pedidos]);

    return novoPedido;
  },

  async atualizarStatusPedido(
    pedidoId: string, 
    novoStatus: StatusPedido, 
    horarioPronto?: string
  ): Promise<Pedido | null> {
    const pedidos = await this.getPedidos();
    const pedidoIndex = pedidos.findIndex((p) => p.id === pedidoId);
    if (pedidoIndex === -1) return null;

    const pedido = pedidos[pedidoIndex];
    const statusAnterior = pedido.status;
    pedido.status = novoStatus;
    pedido.updated_at = new Date().toISOString();
    if (horarioPronto) {
      pedido.horario_pronto_informado = horarioPronto;
    }

    // REGRA DE NEGÓCIO: Conclusão do Pedido
    if (novoStatus === 'concluido' && statusAnterior !== 'concluido') {
      // 1. Calcula quantidade de cookies comprados (excluindo resgatados grátis)
      let cookiesComprados = 0;
      for (const item of pedido.itens) {
        if (item.is_gratis) continue;
        if (item.tipo === 'kit' && item.kit_tamanho) {
          cookiesComprados += item.kit_tamanho * item.quantidade;
        } else {
          cookiesComprados += item.quantidade;
        }
      }

      // Credita pontos (+1 por cookie)
      if (cookiesComprados > 0 && pedido.cliente_id) {
        await this.atualizarPontosCliente(
          pedido.cliente_id,
          cookiesComprados,
          'ponto_ganho',
          `Pontos ganhos no pedido #${pedido.codigo_exibicao} (+${cookiesComprados} pontos)`,
          pedido.id
        );
      }

      // Credita dia de fidelidade (máximo 1 dia por data no fuso de SP)
      if (pedido.cliente_id) {
        await this.creditarDiaFidelidadeSeValido(pedido.cliente_id, pedido.id, pedido.codigo_exibicao);
      }
    }

    // REGRA DE NEGÓCIO: Cancelamento ou Expiração (estorno dos pontos usados)
    if (
      (novoStatus === 'cancelado' || novoStatus === 'expirado') &&
      statusAnterior !== 'cancelado' &&
      statusAnterior !== 'expirado'
    ) {
      if (pedido.pontos_usados > 0 && pedido.cliente_id) {
        await this.atualizarPontosCliente(
          pedido.cliente_id,
          pedido.pontos_usados,
          'ponto_estorno',
          `Estorno de ${pedido.pontos_usados} pontos pelo cancelamento do pedido #${pedido.codigo_exibicao}`,
          pedido.id
        );
      }
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('pedidos')
          .update({
            status: novoStatus,
            horario_pronto_informado: pedido.horario_pronto_informado,
            updated_at: pedido.updated_at,
          })
          .eq('id', pedidoId);
      } catch (e) {
        console.warn('Erro ao atualizar status no Supabase:', e);
      }
    }

    pedidos[pedidoIndex] = pedido;
    setLocal(STORAGE_KEYS.PEDIDOS, pedidos);
    return pedido;
  },

  async gerarCobrancaAbacatePay(pedidoId: string, metodo: 'PIX' | 'CREDIT_CARD'): Promise<Pedido | null> {
    const pedido = await this.getPedidoById(pedidoId);
    if (!pedido) return null;

    const mockPixCode = `00020126580014br.gov.bcb.pix0136${pedido.id}520400005303986540${pedido.total.toFixed(2)}5802BR5916Gabi Cookies6013Sao Leopoldo62070503***6304`;
    pedido.id_cobranca = `abacate_${Date.now()}`;
    pedido.pix_copia_cola = mockPixCode;
    pedido.pix_qr_code_url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(mockPixCode)}`;
    pedido.cobranca_expira_em = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    pedido.updated_at = new Date().toISOString();

    const pedidos = await this.getPedidos();
    const idx = pedidos.findIndex((p) => p.id === pedidoId);
    if (idx >= 0) {
      pedidos[idx] = pedido;
      setLocal(STORAGE_KEYS.PEDIDOS, pedidos);
    }
    return pedido;
  },

  // PERFIS E FIDELIDADE
  async getPerfil(id: string): Promise<Perfil | null> {
    const perfis = getLocal<Perfil[]>(STORAGE_KEYS.PERFIS, []);
    return perfis.find((p) => p.id === id) || null;
  },

  async salvarPerfil(perfil: Perfil): Promise<Perfil> {
    const perfis = getLocal<Perfil[]>(STORAGE_KEYS.PERFIS, []);
    const idx = perfis.findIndex((p) => p.id === perfil.id);
    let novos: Perfil[];
    if (idx >= 0) {
      novos = [...perfis];
      novos[idx] = perfil;
    } else {
      novos = [perfil, ...perfis];
    }
    setLocal(STORAGE_KEYS.PERFIS, novos);
    return perfil;
  },

  async atualizarPontosCliente(
    perfilId: string, 
    deltaPontos: number, 
    tipo: MovimentoFidelidade['tipo'], 
    descricao: string, 
    pedidoId?: string
  ): Promise<void> {
    const perfil = await this.getPerfil(perfilId);
    if (!perfil) return;

    perfil.saldo_pontos = Math.max(0, perfil.saldo_pontos + deltaPontos);
    await this.salvarPerfil(perfil);

    const hoje = new Date().toISOString().split('T')[0];
    const movimento: MovimentoFidelidade = {
      id: 'mov_' + Math.random().toString(36).substring(2, 9),
      perfil_id: perfilId,
      pedido_id: pedidoId,
      tipo,
      quantidade: Math.abs(deltaPontos),
      data_referencia: hoje,
      descricao,
      created_at: new Date().toISOString(),
    };

    const movimentos = getLocal<MovimentoFidelidade[]>(STORAGE_KEYS.MOVIMENTOS, []);
    setLocal(STORAGE_KEYS.MOVIMENTOS, [movimento, ...movimentos]);
  },

  async creditarDiaFidelidadeSeValido(perfilId: string, pedidoId: string, codigoPedido: string): Promise<boolean> {
    const hoje = new Date().toISOString().split('T')[0];
    const movimentos = getLocal<MovimentoFidelidade[]>(STORAGE_KEYS.MOVIMENTOS, []);

    // REGRA DE 1 DIA POR DIA: verifica se já ganhou carimbo hoje
    const jaGanhouHoje = movimentos.some(
      (m) => m.perfil_id === perfilId && m.tipo === 'dia_ganho' && m.data_referencia === hoje
    );

    if (jaGanhouHoje) {
      return false; // Não credita segundo dia na mesma data
    }

    const perfil = await this.getPerfil(perfilId);
    if (!perfil) return false;

    // Registra movimento de dia ganho
    const novoMov: MovimentoFidelidade = {
      id: 'mov_' + Math.random().toString(36).substring(2, 9),
      perfil_id: perfilId,
      pedido_id: pedidoId,
      tipo: 'dia_ganho',
      quantidade: 1,
      data_referencia: hoje,
      descricao: `Carimbo de fidelidade do pedido #${codigoPedido}`,
      created_at: new Date().toISOString(),
    };
    setLocal(STORAGE_KEYS.MOVIMENTOS, [novoMov, ...movimentos]);

    // Atualiza dias de fidelidade do perfil
    const novosDias = perfil.dias_fidelidade + 1;
    if (novosDias >= 10) {
      // Completou 10 dias! Ganha 1 cookie grátis e zera os carimbos
      perfil.dias_fidelidade = 0;
      perfil.cookies_gratis_disponiveis = (perfil.cookies_gratis_disponiveis || 0) + 1;
    } else {
      perfil.dias_fidelidade = novosDias;
    }

    await this.salvarPerfil(perfil);
    return true;
  },

  async consumirCookieGratis(perfilId: string, pedidoId: string): Promise<void> {
    const perfil = await this.getPerfil(perfilId);
    if (!perfil || perfil.cookies_gratis_disponiveis <= 0) return;

    perfil.cookies_gratis_disponiveis -= 1;
    await this.salvarPerfil(perfil);

    const movimento: MovimentoFidelidade = {
      id: 'mov_' + Math.random().toString(36).substring(2, 9),
      perfil_id: perfilId,
      pedido_id: pedidoId,
      tipo: 'resgate_cookie',
      quantidade: 1,
      data_referencia: new Date().toISOString().split('T')[0],
      descricao: `Resgate de 1 cookie grátis no pedido`,
      created_at: new Date().toISOString(),
    };

    const movimentos = getLocal<MovimentoFidelidade[]>(STORAGE_KEYS.MOVIMENTOS, []);
    setLocal(STORAGE_KEYS.MOVIMENTOS, [movimento, ...movimentos]);
  },

  async getMovimentosFidelidade(perfilId: string): Promise<MovimentoFidelidade[]> {
    const movimentos = getLocal<MovimentoFidelidade[]>(STORAGE_KEYS.MOVIMENTOS, []);
    return movimentos.filter((m) => m.perfil_id === perfilId);
  },
};
