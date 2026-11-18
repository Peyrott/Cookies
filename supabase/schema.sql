-- ==============================================================================
-- SCHEMA COMPLETO - GABI COOKIES
-- Banco de Dados Postgres / Supabase
-- ==============================================================================

-- 1. Extensões
create extension if not exists "uuid-ossp";

-- 2. Tabela de Categorias
create table if not exists public.categorias (
  id text primary key default ('cat-' || substr(uuid_generate_v4()::text, 1, 8)),
  nome text not null,
  ordem int not null default 1,
  created_at timestamptz not null default now()
);

-- 3. Tabela de Cookies
create table if not exists public.cookies (
  id text primary key default ('cookie-' || substr(uuid_generate_v4()::text, 1, 8)),
  nome text not null,
  descricao text not null default '',
  preco numeric(10, 2) not null,
  imagem text not null default '',
  categoria_id text references public.categorias(id) on delete set null,
  ativo boolean not null default true,
  disponivel_hoje boolean not null default true,
  mais_vendido boolean not null default false,
  tipo text check (tipo in ('tradicional', 'sazonal', 'especial')) default 'tradicional',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Tabela de Perfis de Clientes e Admin
create table if not exists public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  whatsapp text not null,
  email text,
  enderecos jsonb not null default '[]'::jsonb,
  role text not null check (role in ('cliente', 'admin')) default 'cliente',
  saldo_pontos int not null default 0 check (saldo_pontos >= 0),
  dias_fidelidade int not null default 0 check (dias_fidelidade >= 0 and dias_fidelidade <= 10),
  cookies_gratis_disponiveis int not null default 0 check (cookies_gratis_disponiveis >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Tabela de Cupons
create table if not exists public.cupons (
  id text primary key default ('cupom-' || substr(uuid_generate_v4()::text, 1, 8)),
  codigo text unique not null,
  tipo text not null check (tipo in ('porcentagem', 'fixo')),
  valor numeric(10, 2) not null check (valor > 0),
  validade timestamptz,
  limite_usos int,
  usos_atuais int not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- 6. Tabela de Faixas de Frete (a partir do Campus Unisinos São Leopoldo)
create table if not exists public.faixas_frete (
  id text primary key default ('frete-' || substr(uuid_generate_v4()::text, 1, 8)),
  km_inicial numeric(5, 2) not null,
  km_final numeric(5, 2) not null,
  valor numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

-- 7. Tabela de Configurações
create table if not exists public.config (
  chave text primary key,
  valor jsonb not null,
  updated_at timestamptz not null default now()
);

-- 8. Tabela de FAQ
create table if not exists public.faq (
  id text primary key default ('faq-' || substr(uuid_generate_v4()::text, 1, 8)),
  pergunta text not null,
  resposta text not null,
  ordem int not null default 1,
  created_at timestamptz not null default now()
);

-- 9. Tabela de Pedidos
create table if not exists public.pedidos (
  id uuid primary key default uuid_generate_v4(),
  codigo_exibicao text not null unique,
  cliente_id uuid references public.perfis(id) on delete set null,
  cliente_nome text not null,
  cliente_whatsapp text not null,
  tipo_entrega text not null check (tipo_entrega in ('retirada', 'unisinos_portao_b', 'entrega')),
  endereco jsonb,
  distancia_km numeric(6, 2),
  frete numeric(10, 2) not null default 0.00,
  forma_pagamento text not null check (
    forma_pagamento in ('online_pix', 'online_cartao', 'entrega_dinheiro', 'entrega_pix', 'entrega_cartao')
  ),
  troco_para numeric(10, 2),
  
  -- Valores detalhados
  subtotal numeric(10, 2) not null,
  desconto_kit numeric(10, 2) not null default 0.00,
  cupom_codigo text,
  desconto_cupom numeric(10, 2) not null default 0.00,
  pontos_usados int not null default 0,
  desconto_pontos numeric(10, 2) not null default 0.00,
  total numeric(10, 2) not null,
  
  status text not null check (
    status in ('aguardando_pagamento', 'recebido', 'em_preparo', 'pronto', 'saiu_para_entrega', 'concluido', 'cancelado', 'expirado')
  ) default 'recebido',
  
  id_cobranca text,
  pix_copia_cola text,
  pix_qr_code_url text,
  cobranca_url text,
  cobranca_expira_em timestamptz,
  
  observacoes text,
  horario_pronto_informado text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 10. Tabela de Itens do Pedido
create table if not exists public.pedido_itens (
  id uuid primary key default uuid_generate_v4(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  tipo text not null check (tipo in ('unitario', 'kit', 'gratis')),
  cookie_id text references public.cookies(id) on delete set null,
  quantidade int not null default 1,
  kit_tamanho int check (kit_tamanho in (3, 5, 8)),
  sabores_kit jsonb, -- lista com [{cookie_id, nome, quantidade, preco}]
  preco_unitario numeric(10, 2) not null,
  subtotal numeric(10, 2) not null,
  is_gratis boolean not null default false,
  created_at timestamptz not null default now()
);

-- 11. Tabela de Movimentos de Fidelidade
create table if not exists public.movimentos_fidelidade (
  id uuid primary key default uuid_generate_v4(),
  perfil_id uuid not null references public.perfis(id) on delete cascade,
  pedido_id uuid references public.pedidos(id) on delete set null,
  tipo text not null check (
    tipo in ('ponto_ganho', 'ponto_usado', 'ponto_estorno', 'dia_ganho', 'resgate_cookie')
  ),
  quantidade int not null,
  data_referencia date not null default (now() at time zone 'America/Sao_Paulo')::date,
  descricao text not null,
  created_at timestamptz not null default now()
);

-- Regra de 1 dia por dia: Índice único para dia_ganho por data e perfil
create unique index if not exists idx_movimentos_dia_unico 
  on public.movimentos_fidelidade (perfil_id, tipo, data_referencia) 
  where tipo = 'dia_ganho';

-- 12. Funções e Triggers de Fidelidade e Status de Pedido

-- Função para creditar fidelidade quando pedido for 'concluido'
create or replace function public.processar_conclusao_pedido()
returns trigger as $$
declare
  v_total_cookies int := 0;
  v_hoje date;
  v_dia_ja_creditado boolean := false;
  v_novos_dias int;
  v_cookies_gratis int;
begin
  -- Dispara apenas quando o status muda para 'concluido'
  if new.status = 'concluido' and (old.status is distinct from 'concluido') then
    if new.cliente_id is not null then
      v_hoje := (now() at time zone 'America/Sao_Paulo')::date;
      
      -- Calcula quantos cookies comprados (excluindo grátis)
      select coalesce(sum(
        case 
          when tipo = 'kit' then (kit_tamanho * quantidade)
          when is_gratis = false then quantidade
          else 0
        end
      ), 0)
      into v_total_cookies
      from public.pedido_itens
      where pedido_id = new.id;
      
      -- 1. Credita pontos (+1 por cookie)
      if v_total_cookies > 0 then
        update public.perfis
        set saldo_pontos = saldo_pontos + v_total_cookies,
            updated_at = now()
        where id = new.cliente_id;
        
        insert into public.movimentos_fidelidade (perfil_id, pedido_id, tipo, quantidade, data_referencia, descricao)
        values (
          new.cliente_id, 
          new.id, 
          'ponto_ganho', 
          v_total_cookies, 
          v_hoje, 
          format('Pontos ganhos no pedido %s (+%s pontos)', new.codigo_exibicao, v_total_cookies)
        );
      end if;
      
      -- 2. Credita dia de fidelidade (máximo 1 dia por data no fuso de SP)
      select exists (
        select 1 from public.movimentos_fidelidade
        where perfil_id = new.cliente_id
          and tipo = 'dia_ganho'
          and data_referencia = v_hoje
      ) into v_dia_ja_creditado;
      
      if not v_dia_ja_creditado then
        -- Carimbo de dia ganho
        insert into public.movimentos_fidelidade (perfil_id, pedido_id, tipo, quantidade, data_referencia, descricao)
        values (
          new.cliente_id,
          new.id,
          'dia_ganho',
          1,
          v_hoje,
          format('Carimbo de dia ganho com o pedido %s', new.codigo_exibicao)
        );
        
        -- Atualiza perfil e verifica se completou 10 dias
        select dias_fidelidade + 1 into v_novos_dias
        from public.perfis where id = new.cliente_id;
        
        if v_novos_dias >= 10 then
          -- Ganhou 1 cookie grátis e reseta contador de dias
          update public.perfis
          set dias_fidelidade = 0,
              cookies_gratis_disponiveis = cookies_gratis_disponiveis + 1,
              updated_at = now()
          where id = new.cliente_id;
        else
          update public.perfis
          set dias_fidelidade = v_novos_dias,
              updated_at = now()
          where id = new.cliente_id;
        end if;
      end if;
    end if;
  end if;

  -- Se for cancelado e tiver pontos usados, estorna os pontos
  if new.status in ('cancelado', 'expirado') and (old.status not in ('cancelado', 'expirado')) then
    if new.cliente_id is not null and new.pontos_usados > 0 then
      update public.perfis
      set saldo_pontos = saldo_pontos + new.pontos_usados,
          updated_at = now()
      where id = new.cliente_id;
      
      insert into public.movimentos_fidelidade (perfil_id, pedido_id, tipo, quantidade, data_referencia, descricao)
      values (
        new.cliente_id,
        new.id,
        'ponto_estorno',
        new.pontos_usados,
        (now() at time zone 'America/Sao_Paulo')::date,
        format('Estorno de pontos pelo cancelamento do pedido %s', new.codigo_exibicao)
      );
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_processar_conclusao_pedido on public.pedidos;
create trigger trg_processar_conclusao_pedido
  after update on public.pedidos
  for each row execute function public.processar_conclusao_pedido();

-- 13. Row Level Security (RLS)
alter table public.categorias enable row level security;
alter table public.cookies enable row level security;
alter table public.perfis enable row level security;
alter table public.pedidos enable row level security;
alter table public.pedido_itens enable row level security;
alter table public.cupons enable row level security;
alter table public.faixas_frete enable row level security;
alter table public.faq enable row level security;
alter table public.config enable row level security;
alter table public.movimentos_fidelidade enable row level security;

-- Categorias, Cookies, Faixas de Frete, FAQ e Config: leitura pública
create policy "Leitura pública de categorias" on public.categorias for select using (true);
create policy "Leitura pública de cookies ativos" on public.cookies for select using (true);
create policy "Leitura pública de faixas de frete" on public.faixas_frete for select using (true);
create policy "Leitura pública de faq" on public.faq for select using (true);
create policy "Leitura pública de config" on public.config for select using (true);
create policy "Leitura de cupons ativos" on public.cupons for select using (ativo = true);

-- Políticas de Perfil: usuário vê e edita seu próprio perfil; admin vê tudo
create policy "Usuário vê próprio perfil" on public.perfis 
  for select using (auth.uid() = id or (select role from public.perfis where id = auth.uid()) = 'admin');

create policy "Usuário atualiza próprio perfil" on public.perfis 
  for update using (auth.uid() = id);

-- Políticas de Pedidos: cliente vê os seus; admin gerencia tudo
create policy "Cliente vê próprios pedidos" on public.pedidos 
  for select using (cliente_id = auth.uid() or (select role from public.perfis where id = auth.uid()) = 'admin');

create policy "Cliente cria pedidos" on public.pedidos 
  for insert with check (true);

create policy "Admin atualiza pedidos" on public.pedidos 
  for update using ((select role from public.perfis where id = auth.uid()) = 'admin');

create policy "Ver itens do pedido" on public.pedido_itens 
  for select using (true);

create policy "Criar itens do pedido" on public.pedido_itens 
  for insert with check (true);

create policy "Ver movimentos de fidelidade" on public.movimentos_fidelidade 
  for select using (perfil_id = auth.uid() or (select role from public.perfis where id = auth.uid()) = 'admin');

-- Permissões gerais de Admin para edição de cardápio, cupons, frete e configurações
create policy "Admin edita cookies" on public.cookies 
  for all using ((select role from public.perfis where id = auth.uid()) = 'admin');

create policy "Admin edita categorias" on public.categorias 
  for all using ((select role from public.perfis where id = auth.uid()) = 'admin');

create policy "Admin edita cupons" on public.cupons 
  for all using ((select role from public.perfis where id = auth.uid()) = 'admin');

create policy "Admin edita faixas_frete" on public.faixas_frete 
  for all using ((select role from public.perfis where id = auth.uid()) = 'admin');

create policy "Admin edita faq" on public.faq 
  for all using ((select role from public.perfis where id = auth.uid()) = 'admin');

create policy "Admin edita config" on public.config 
  for all using ((select role from public.perfis where id = auth.uid()) = 'admin');

-- 14. SEED INICIAL DE DADOS
insert into public.categorias (id, nome, ordem) values
  ('cat-tradicionais', 'Cookies Tradicionais', 1),
  ('cat-sazonais', 'Cookies Sazonais', 2),
  ('cat-especiais', 'Cookies Especiais', 3)
on conflict (id) do nothing;

insert into public.cookies (id, nome, descricao, preco, imagem, categoria_id, ativo, disponivel_hoje, mais_vendido, tipo) values
  ('cookie-gotas-belga', 'Gotas de Chocolate Belga', 'Massa amanteigada clássica crocante por fora e macia por dentro, repleta de gotas de puro chocolate ao leite belga 33%.', 11.00, 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80', 'cat-tradicionais', true, true, true, 'tradicional'),
  ('cookie-double-chocolate', 'Double Chocolate Intenso', 'Massa 100% cacau Black, densa e chocolatuda com gotas de chocolate meio amargo 54% e pedaços de chocolate branco.', 11.00, 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80', 'cat-tradicionais', true, true, true, 'tradicional'),
  ('cookie-baunilha-castanha', 'Baunilha com Castanha do Pará', 'Massa dourada de baunilha com pedaços crocantes tostados de castanha-do-pará e canela.', 11.00, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80', 'cat-tradicionais', true, true, false, 'tradicional'),
  ('cookie-aveia-gotas', 'Aveia Dourada & Gotas Amargas', 'Flocos de aveia selecionados, açúcar mascavo caramelizado e generosas gotas de chocolate amargo 70%.', 11.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80', 'cat-tradicionais', true, true, false, 'tradicional'),
  ('cookie-red-velvet', 'Red Velvet com Ninho Cremoso', 'Massa aveludada cor rubi intenso com recheio cremoso de brigadeiro de Ninho e gotas de chocolate branco.', 12.00, 'https://images.unsplash.com/photo-1618923834413-27710e54b15d?auto=format&fit=crop&w=800&q=80', 'cat-sazonais', true, true, true, 'sazonal'),
  ('cookie-limao-siciliano', 'Limão Siciliano & Choc Branco', 'Raspas frescas de limão siciliano, toque cítrico refrescante com a doçura do chocolate branco nobre.', 12.00, 'https://images.unsplash.com/photo-1587248720327-8eb72564be1e?auto=format&fit=crop&w=800&q=80', 'cat-sazonais', true, false, false, 'sazonal'),
  ('cookie-especiarias-maca', 'Especiarias com Maçã & Canela', 'Mix de canela, noz-moscada, gengibre e pedacinhos de maçã caramelizada.', 12.00, 'https://images.unsplash.com/photo-1548365328-8c6db3220e4c?auto=format&fit=crop&w=800&q=80', 'cat-sazonais', true, true, false, 'sazonal'),
  ('cookie-pistache-framboesa', 'Pistache Real com Framboesa', 'Pasta 100% pura de pistache da Sicília, pedaços de pistache crocante e recheio de geleia artesanal de framboesas.', 12.50, 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80', 'cat-especiais', true, true, true, 'especial'),
  ('cookie-nutella-avela', 'Nutella Pura com Avelãs Crocantes', 'Coração recheado com uma bola generosa de Nutella derretida e avelãs inteiras torradas.', 12.50, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80', 'cat-especiais', true, true, true, 'especial'),
  ('cookie-caramelo-salgado', 'Caramelo Salgado & Flor de Sal', 'Caramelo toffee artesanal puxa-puxa feito no tacho, gotas 70% e cristais de flor de sal de Guérande.', 12.50, 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&w=800&q=80', 'cat-especiais', true, true, false, 'especial')
on conflict (id) do nothing;

insert into public.faixas_frete (id, km_inicial, km_final, valor) values
  ('frete-1', 0, 2, 5.00),
  ('frete-2', 2, 4, 8.00),
  ('frete-3', 4, 6, 11.00),
  ('frete-4', 6, 8, 14.00),
  ('frete-5', 8, 10, 17.00)
on conflict (id) do nothing;

insert into public.cupons (id, codigo, tipo, valor, limite_usos, usos_atuais, ativo) values
  ('cupom-bemvindo', 'BEMVINDO10', 'porcentagem', 10.00, 100, 3, true),
  ('cupom-gabi5', 'GABI5', 'fixo', 5.00, 50, 12, true),
  ('cupom-amocookies', 'AMOCOOKIES', 'porcentagem', 15.00, 200, 28, true)
on conflict (id) do nothing;

insert into public.config (chave, valor) values
  ('geral', '{
    "whatsapp_gabi": "5551999999999",
    "instagram_gabi": "gabicookies_artesanal",
    "ponto_entrega_nome": "Unisinos – Florindas (Portão B)",
    "ponto_entrega_detalhe": "Entrega gratuita na entrada do Portão B / Florindas do Campus São Leopoldo Unisinos",
    "origem_lat_lng": { "lat": -29.7946, "lng": -51.1546 },
    "valor_desconto_por_par": 1.50,
    "tamanho_par_kit": 2,
    "taxa_km_adicional": 2.50
  }'::jsonb)
on conflict (chave) do nothing;
