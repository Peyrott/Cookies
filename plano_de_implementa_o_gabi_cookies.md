# Plano de Implementação Final: Site Gabi Cookies

Todas as divergências foram resolvidas. Esta é a versão consolidada, que pode seguir direto para o desenvolvimento.

---

## 1. Regras de Negócio

| Tema | Regra |
| :--- | :--- |
| **Kits** | 3, 5 ou 8 cookies. R$ 1,50 de desconto a cada 2 cookies, só em kits: kit 3 = R$ 1,50, kit 5 = R$ 3, kit 8 = R$ 6 |
| **Preços** | R$ 11 (tradicionais/todos), R$ 12 (sazonais), R$ 12,50 (especiais) |
| **Pontos** | +1 por cookie comprado (cookie grátis não conta). 1 ponto = 1% de desconto, até 100%. Pontos usados são gastos |
| **Dias de fidelidade** | +1 dia por compra concluída, no máximo 1 por dia. Com 10 dias, o cliente escolhe resgatar 1 cookie grátis de qualquer sabor disponível |
| **Cupom** | Criado pela Gabi no admin e acumula com os pontos |
| **Disponibilidade** | A Gabi marca no painel os cookies disponíveis hoje. Sem horário limite para pedir |
| **Prazo e horário** | O pedido é sempre para o dia, sem campo de data. A Gabi informa o horário quando estiver pronto |
| **Pedido diferente** | Botão que abre o WhatsApp da Gabi com mensagem pronta |
| **Entrega** | Retirada ou entrega. Frete por faixa de km a partir do campus São Leopoldo da Unisinos, sem raio máximo. Entrega no ponto Florindas, entrada do portão B é grátis |
| **Pagamento** | Online (Pix ou cartão pelo AbacatePay) ou na entrega/retirada (dinheiro, Pix ou cartão) |
| **Crédito de fidelidade** | Pontos e dia só entram quando a Gabi marca o pedido como `concluido` |

### Ordem de Cálculo

1. Subtotal dos itens.
2. Menos o desconto dos kits.
3. A base resultante recebe o desconto dos pontos.
4. O cupom abate da mesma base.
5. Soma-se o frete, que não tem desconto.
6. O total dos produtos nunca fica negativo.

> **Nota:** Adotei o cupom sobre a mesma base dos pontos; se quiser outra ordem, é só avisar.  
> **Exemplo:** kit de 8 de R$ 11 = R$ 88, menos R$ 6 do kit = R$ 82. Com 10 pontos (R$ 8,20) fica R$ 73,80, e depois soma-se o frete.

---

## 2. Arquitetura

- **Front-end:** React + TypeScript (Vite), Tailwind CSS e React Router, *mobile-first*. Carrinho em estado global, salvo no `localStorage`.
- **Banco e login:** Supabase (Postgres, Auth, RLS e Realtime). A Gabi é um perfil com `role = admin`.
- **Servidor:** Edge Functions para recalcular totais (o navegador nunca decide valores), calcular frete, criar cobranças no AbacatePay e receber o webhook.
- **Deploy:** GitHub -> Vercel/Netlify, com chaves em variáveis de ambiente.
- **Conta do AbacatePay:** a sua, para teste. Trocar para a da Gabi depois significa trocar a chave e o segredo do webhook, sem mexer em código.

---

## 3. Modelo de Dados

| Tabela | Conteúdo |
| :--- | :--- |
| `categorias` | `nome`, `ordem` |
| `cookies` | `nome`, `descrição`, `preço`, `imagem`, `categoria`, `ativo`, `disponivel_hoje`, `mais_vendido` |
| `perfis` | `nome`, `WhatsApp`, `e-mail`, `endereços`, `role`, `saldo de pontos`, `dias de fidelidade`, `cookies grátis disponíveis` |
| `pedidos` | `cliente`, `tipo` (retirada/entrega), `endereço`, `distância`, `frete`, `forma de pagamento`, `subtotal`, `desconto do kit`, `cupom`, `pontos usados`, `total`, `status`, `id da cobrança` |
| `pedido_itens` | `cookie` ou `kit`, `quantidade`, `sabores do kit`, `preço`, `marcação de item grátis` |
| `cupons` | `código`, `tipo` (% ou R$), `valor`, `validade`, `limite de usos`, `ativo` |
| `movimentos_fidelidade` | histórico de pontos e dias (ganho, uso, resgate, estorno), ligado ao pedido |
| `faixas_frete` | `km inicial`, `km final`, `valor` |
| `faq` | `pergunta`, `resposta`, `ordem` |
| `config` | `WhatsApp`, `Instagram`, `ponto de entrega` (Florindas, portão B), `valor` e `tamanho do grupo` do desconto de kit |

### Detalhes do Modelo

- **Forma de pagamento:** `online_pix`, `online_cartao`, `entrega_dinheiro`, `entrega_pix`, `entrega_cartao`.
- **Status:** `aguardando_pagamento` (só online) -> `recebido` -> `em_preparo` -> `pronto` -> `saiu_para_entrega` (se entrega) -> `concluido`, ou `cancelado`/`expirado`.
- **Regra de 1 dia por dia:** índice único em `movimentos_fidelidade` para `(perfil, tipo "dia", data no fuso America/Sao_Paulo)`. Uma segunda compra concluída no mesmo dia ainda dá pontos, mas não dá outro dia.

---

## 4. Telas do Cliente

- **Início:** banner, categorias (levam ao cardápio já na seção, com rolagem animada), Top 3 e chamada de fidelidade.
- **Cardápio:** seções por categoria, busca e pop-up de detalhe. Cookies fora de `disponivel_hoje` aparecem indisponíveis.
- **Monte seu kit:** tamanhos 3/5/8, contador "X de N escolhidos", `+/-` por sabor, desconto em tempo real e adicionar só com o kit completo.
- **Carrinho:** itens editáveis, cupom, uso de pontos (limitado ao saldo e a 100), retirada ou entrega, resgate do cookie grátis e forma de pagamento. Na entrega, o cliente escolhe entre "Unisinos – Florindas, portão B" (frete zero) e outro endereço, com frete calculado.
- **Pedido enviado:** número do pedido, resumo, aviso de que a Gabi informa quando estiver pronto e botão de WhatsApp.
- **Conta e pontos:** login/cadastro, dados e endereços, saldo, cartão de 10 dias, resgate do cookie grátis, histórico e status dos pedidos.
- **Sobre mim e FAQ:** história, FAQ em pop-up, WhatsApp e Instagram (em branco por enquanto) e galeria.

---

## 5. Fluxo do Pedido e Pagamento

### Online (AbacatePay)

1. A Edge Function recalcula tudo, grava o pedido como `aguardando_pagamento` e reserva os pontos usados.
2. A função cria a cobrança, e o site mostra o QR Code/copia e cola (ou o checkout do cartão), com prazo de expiração.
3. O webhook confirma o pagamento, o pedido vira `recebido` e aparece em tempo real no painel.
4. Se a cobrança expirar, o pedido vira `expirado` e os pontos reservados voltam.

### Na Entrega ou Retirada

1. O pedido entra direto como `recebido`, com a forma escolhida.
2. Em dinheiro, a Gabi recebe e confirma. Em Pix ou cartão, o painel tem um botão **"Gerar cobrança"** que cria a cobrança no AbacatePay na hora, para o cliente pagar na entrega. *(Essa é a minha leitura do "cartão na abacatepay"; me corrija se a ideia for outra.)*

### Em Ambos os Fluxos

- Ao marcar `concluido`, o sistema credita pontos e, se for o primeiro do dia, o dia de fidelidade.
- Ao cancelar, os pontos usados voltam ao saldo.
- Antes de ir ao ar, testar o fluxo completo no ambiente de testes da conta e conferir a documentação atual de webhooks e as taxas por venda.

---

## 6. Frete

1. O cliente informa CEP e número, e a Edge Function geocodifica e calcula a distância até o campus São Leopoldo, com cache dos resultados.
2. Faixas iniciais, editáveis no painel:
   - Até 2 km: **R$ 5**
   - 2–4 km: **R$ 8**
   - 4–6 km: **R$ 11**
   - 6–8 km: **R$ 14**
   - 8–10 km: **R$ 17**
   - Acima disso: **R$ 2,50 por km extra**
3. Entrega em Florindas, portão B tem frete zero e dispensa geocodificação.
4. Conferir os limites de uso gratuito do serviço de geocodificação/rotas antes de escolher.

---

## 7. Painel Admin

- **Pedidos:** lista em tempo real com filtro por status e data, detalhe completo, mudança de status e botão de WhatsApp do cliente com "seu pedido está pronto" ao marcar `pronto`. Também o botão **"Gerar cobrança"** para Pix e cartão na entrega.
- **Disponível hoje:** tela rápida para marcar os cookies do dia, com opção de zerar tudo.
- **Cardápio:** criar e editar cookies, preços e categorias.
- **Cupons:** criar e desativar.
- **Configurações:** faixas de frete, ponto de entrega, WhatsApp, Instagram e regra do desconto de kit.
- **Segurança:** RLS garante que o cliente só veja os próprios dados e que só o admin altere cardápio, cupons, frete e status.

---

## 8. Ordem de Implementação

1. Setup, rotas, layout (cabeçalho e menu lateral) e deploy inicial.
2. Supabase: tabelas, RLS, Auth e cadastro dos cookies.
3. Início e cardápio (busca, detalhe, indisponibilidade).
4. Carrinho persistido.
5. Monte seu kit com o desconto por pares.
6. Cálculo de totais no servidor (kit, pontos, cupom, frete).
7. Conta e fidelidade (pontos, dias, resgate do cookie grátis).
8. Frete (ponto da Unisinos e faixas por km).
9. Pedido na entrega/retirada e painel admin básico (pedidos e disponibilidade).
10. Integração com o AbacatePay (cobrança online, webhook, expiração, cobrança gerada no painel).
11. Painel admin completo (cardápio, cupons, configurações).
12. Sobre mim, FAQ, WhatsApp e Instagram.
13. Acabamento: responsividade (inclusive desktop do Início), acessibilidade, imagens otimizadas e estados de erro e vazio.
14. Testes ponta a ponta (compra online e na entrega, cancelamento, expiração, estorno de pontos, regra de 1 dia por dia, resgate), novo teste com usuários e publicação.