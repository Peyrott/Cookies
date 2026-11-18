# 🍪 Gabi Cookies - Site & Sistema de Pedidos Online

Plataforma completa de e-commerce e fidelidade desenvolvida especificamente para a **Gabi Cookies**, seguindo integralmente o plano de implementação técnica e as regras de negócio consolidadas.

---

## 🌟 Funcionalidades Principais

### 1. Experiência do Cliente (*Mobile-First*)
- **Início Aconchegante:** Banner artesanal, Top 3 cookies mais vendidos, categorias com navegação direta e apresentação do clube de fidelidade.
- **Cardápio Inteligente:** Busca em tempo real, filtros por categoria, badges informativas (*Mais Vendido, Sazonal, Especial*) e modal pop-up com ingredientes e alérgenos.
- **Fornadas Diárias (`disponivel_hoje`):** Cookies fora da fornada do dia aparecem com sinalização de "Esgotado hoje" e botão desabilitado.
- **Monte seu Kit Interativo:**
  - Caixas de **3, 5 ou 8 cookies**
  - **Desconto de R$ 1,50 a cada 2 cookies**: Kit 3 (-R$ 1,50), Kit 5 (-R$ 3,00), Kit 8 (-R$ 6,00)
  - Contador animado "X de N escolhidos" com barra de progresso em tempo real
  - Seletor `+` / `-` por sabor disponível
  - Botão de adicionar habilitado apenas com o kit 100% completo
- **Carrinho Transparente & Persistido:**
  - Salvo no `localStorage` do cliente
  - Resgate de 1 Cookie Grátis para clientes com 10 dias de fidelidade
  - Slider de uso de pontos (até 100 pontos = até 100% de desconto)
  - Campo de Cupom de Desconto com validação instantânea
  - Seletor de entrega: **Retirada (Grátis)**, **Unisinos – Florindas, Portão B (Grátis)** ou **Entrega por Km**
  - Formas de pagamento: **Online (Pix ou Cartão via AbacatePay)** ou **Na Entrega/Retirada (Dinheiro, Pix ou Cartão)**
- **Acompanhamento do Pedido:**
  - Código único de exibição (ex: `GC-8492`)
  - Stepper de status em tempo real (`aguardando_pagamento` -> `recebido` -> `em_preparo` -> `pronto` -> `saiu_para_entrega` -> `concluido`)
  - QR Code Pix gerado automaticamente com código copia e cola
  - Aviso carinhoso de que a Gabi informa quando estiver saindo do forno
  - Botão de WhatsApp direto com mensagem pronta para falar com a Gabi
- **Clube de Fidelidade & Minha Conta:**
  - **Cartão de 10 Dias:** 10 carimbos visuais. Cada compra concluída = +1 carimbo (máx 1 por dia). Com 10 dias = 1 Cookie Grátis à escolha!
  - **Pontos por Cookie:** +1 ponto por cookie comprado (1 ponto = 1% de desconto).
  - Histórico de pedidos anteriores.
- **Sobre & FAQ:** História da confeitaria, FAQ sanfonado, galeria de fotos e contatos.
- **Botão de WhatsApp para Pedido Especial:** Encomendas de presentes, caixas personalizadas e eventos.

---

### 2. Painel Administrativo da Gabi (`/admin`)
- **Gestão de Pedidos em Tempo Real:**
  - Filtros por status e por data
  - Mudança de status com 1 clique
  - **Notificação de "Pedido Pronto" no WhatsApp:** Gera mensagem pronta para o WhatsApp do cliente informando que o pedido está pronto
  - **Botão "Gerar Cobrança":** Cria cobrança Pix/Cartão instantânea no AbacatePay para pedidos com pagamento na entrega
  - Crédito automático de pontos (+1 por cookie) e carimbo de fidelidade ao marcar `concluido`
  - Estorno automático de pontos usados em caso de cancelamento
- **Disponível Hoje:** Tela rápida para marcar em segundos os cookies da fornada do dia, com botões "Disponibilizar Todos" e "Zerar Todos".
- **Gestão de Cardápio:** Criar cookies, editar preços (R$ 11, R$ 12, R$ 12,50...), fotos, categorias e destaque de mais vendidos.
- **Gestão de Cupons:** Criar cupons em porcentagem ou valor fixo, definir limites e ativar/desativar.
- **Configurações:** Edição de faixas de frete por km, WhatsApp da Gabi e ponto de encontro na Unisinos.

---

## 📐 Ordem Estrita de Cálculo dos Pedidos

Seguindo rigorosamente o documento de especificação:
1. **Subtotal** dos itens selecionados.
2. **Menos o desconto dos kits** (R$ 1,50 a cada 2 cookies).
3. **A base resultante recebe o desconto dos pontos** (1 ponto = 1% até 100%).
4. **O cupom abate da mesma base** (produtos nunca ficam negativos).
5. **Soma-se o frete**, que não tem desconto.

> **Exemplo Validado em Testes:**  
> Kit 8 de R$ 11 = R$ 88,00  
> Desconto do kit = -R$ 6,00 &rarr; Base = R$ 82,00  
> 10 pontos usados (10% de R$ 82,00) = -R$ 8,20 &rarr; Total produtos = R$ 73,80  
> Mais frete (Unisinos Portão B = R$ 0,00) &rarr; **Total a pagar = R$ 73,80**.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+ (Node.js LTS incluído no ambiente)
- npm

### 1. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
O site estará disponível em `http://localhost:5173`.

### 2. Rodar os Testes de Regras de Negócio
```bash
npx tsx tests/business-rules.test.ts
```

### 3. Compilar para Produção (Build)
```bash
npm run build
```

---

## 🗄️ Banco de Dados (Supabase)

O arquivo `supabase/schema.sql` contém a estrutura completa pronta para ser executada no SQL Editor do Supabase:
- Tabelas: `categorias`, `cookies`, `perfis`, `pedidos`, `pedido_itens`, `cupons`, `movimentos_fidelidade`, `faixas_frete`, `faq`, `config`.
- Triggers e Funções PL/pgSQL: `processar_conclusao_pedido()` credita os pontos e o dia de fidelidade (máximo 1 dia por data no fuso de SP) e estorna em cancelamentos.
- Políticas de Segurança Row Level Security (RLS).
- Dados iniciais (Seed) com o cardápio completo da Gabi.

### Conectando ao seu Supabase
No arquivo `.env`, preencha suas credenciais:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

*(Obs: Mesmo sem preencher o `.env`, a aplicação possui um modo LocalStore integrado inteligente que permite testar toda a experiência de cliente e painel da Gabi imediatamente!)*

---

## 🥑 Integração AbacatePay

As Edge Functions para backend estão preparadas em `supabase/functions/`:
- `calculate-order/index.ts`: Recalcula totais com segurança no servidor.
- `abacate-pay-checkout/index.ts`: Cria cobranças de Pix e Cartão na API do AbacatePay (`https://api.abacatepay.com/v1/billing/create`).
- `abacate-pay-webhook/index.ts`: Recebe as notificações de pagamento e expiração, atualizando o pedido em tempo real.
