export type Role = 'cliente' | 'admin';

export interface Categoria {
  id: string;
  nome: string;
  ordem: number;
}

export interface Cookie {
  id: string;
  nome: string;
  descricao: string;
  preco: number; // 11.00, 12.00, 12.50
  imagem: string;
  categoria_id: string;
  categoria?: string;
  ativo: boolean;
  disponivel_hoje: boolean;
  mais_vendido: boolean;
  tipo?: 'tradicional' | 'sazonal' | 'especial';
  ingredientes?: string[];
  alergenos?: string[];
}

export interface KitSaborItem {
  cookie_id: string;
  nome: string;
  quantidade: number;
  preco: number;
}

export interface ItemCarrinho {
  id: string;
  tipo: 'unitario' | 'kit' | 'gratis';
  cookie_id?: string;
  cookie?: Cookie;
  quantidade: number;
  // Para kit
  kit_tamanho?: 3 | 5 | 8;
  sabores_kit?: KitSaborItem[];
  preco_unitario: number;
  subtotal: number;
  is_gratis?: boolean;
}

export type TipoEntrega = 'retirada' | 'unisinos_portao_b' | 'entrega';

export type FormaPagamento = 
  | 'online_pix' 
  | 'online_cartao' 
  | 'entrega_dinheiro' 
  | 'entrega_pix' 
  | 'entrega_cartao';

export type StatusPedido = 
  | 'aguardando_pagamento' 
  | 'recebido' 
  | 'em_preparo' 
  | 'pronto' 
  | 'saiu_para_entrega' 
  | 'concluido' 
  | 'cancelado' 
  | 'expirado';

export interface EnderecoEntrega {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  distancia_km?: number;
  referencia?: string;
}

export interface Perfil {
  id: string;
  nome: string;
  whatsapp: string;
  email?: string;
  enderecos: EnderecoEntrega[];
  role: Role;
  saldo_pontos: number;
  dias_fidelidade: number; // 0 a 10
  cookies_gratis_disponiveis: number;
  created_at?: string;
}

export interface Cupom {
  id: string;
  codigo: string;
  tipo: 'porcentagem' | 'fixo';
  valor: number;
  validade?: string;
  limite_usos?: number;
  usos_atuais: number;
  ativo: boolean;
}

export interface FaixaFrete {
  id: string;
  km_inicial: number;
  km_final: number;
  valor: number;
}

export interface MovimentoFidelidade {
  id: string;
  perfil_id: string;
  pedido_id?: string;
  tipo: 'ponto_ganho' | 'ponto_usado' | 'ponto_estorno' | 'dia_ganho' | 'resgate_cookie';
  quantidade: number;
  data_referencia: string; // YYYY-MM-DD
  descricao: string;
  created_at: string;
}

export interface Pedido {
  id: string;
  codigo_exibicao: string; // Ex: GC-8492
  cliente_id: string;
  cliente_nome: string;
  cliente_whatsapp: string;
  tipo_entrega: TipoEntrega;
  endereco?: EnderecoEntrega;
  distancia_km?: number;
  frete: number;
  forma_pagamento: FormaPagamento;
  troco_para?: number;
  itens: ItemCarrinho[];
  
  // Detalhamento de valores
  subtotal: number;
  desconto_kit: number;
  cupom_codigo?: string;
  desconto_cupom: number;
  pontos_usados: number;
  desconto_pontos: number;
  total: number;
  
  status: StatusPedido;
  id_cobranca?: string;
  pix_copia_cola?: string;
  pix_qr_code_url?: string;
  cobranca_url?: string;
  cobranca_expira_em?: string;
  
  observacoes?: string;
  horario_pronto_informado?: string;
  created_at: string;
  updated_at?: string;
}

export interface FaqItem {
  id: string;
  pergunta: string;
  resposta: string;
  ordem: number;
}

export interface ConfigSite {
  whatsapp_gabi: string;
  instagram_gabi: string;
  ponto_entrega_nome: string;
  ponto_entrega_detalhe: string;
  origem_lat_lng: { lat: number; lng: number };
  valor_desconto_por_par: number; // R$ 1.50
  tamanho_par_kit: number; // 2
  taxa_km_adicional: number; // R$ 2.50
}
