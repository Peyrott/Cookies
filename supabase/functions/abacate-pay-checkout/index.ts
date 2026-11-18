// Supabase Edge Function: abacate-pay-checkout
// Cria cobrança no AbacatePay (Pix ou Cartão)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const abacateApiKey = Deno.env.get('ABACATEPAY_API_KEY');
    const { pedido_id, metodo = 'PIX', redirect_url } = await req.json();

    if (!pedido_id) {
      return new Response(JSON.stringify({ error: 'ID do pedido obrigatório' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Busca detalhes do pedido
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .select('*, pedido_itens(*)')
      .eq('id', pedido_id)
      .single();

    if (pedidoError || !pedido) {
      return new Response(JSON.stringify({ error: 'Pedido não encontrado' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Se a chave da AbacatePay estiver configurada, chama a API oficial da AbacatePay
    if (abacateApiKey) {
      const response = await fetch('https://api.abacatepay.com/v1/billing/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${abacateApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          frequency: 'ONE_TIME',
          methods: metodo === 'PIX' ? ['PIX'] : ['CREDIT_CARD'],
          products: [
            {
              externalId: `pedido-${pedido.codigo_exibicao}`,
              name: `Gabi Cookies - Pedido #${pedido.codigo_exibicao}`,
              description: `Pedido de cookies artesanais da Gabi Cookies`,
              quantity: 1,
              price: Math.round(Number(pedido.total) * 100), // Em centavos na API
            },
          ],
          returnUrl: redirect_url || `${req.headers.get('origin')}/pedido/${pedido.id}`,
          completionUrl: redirect_url || `${req.headers.get('origin')}/pedido/${pedido.id}?sucesso=true`,
          customer: {
            name: pedido.cliente_nome,
            cellphone: pedido.cliente_whatsapp,
            email: pedido.endereco?.email || 'cliente@gabicookies.com.br',
            taxId: '00000000000',
          },
          metadata: {
            pedido_id: pedido.id,
            codigo_exibicao: pedido.codigo_exibicao,
          },
        }),
      });

      const abacateData = await response.json();

      if (!response.ok) {
        throw new Error(abacateData.error || 'Erro ao comunicar com AbacatePay');
      }

      // Atualiza o pedido com os dados de cobrança
      await supabase
        .from('pedidos')
        .update({
          id_cobranca: abacateData.data?.id,
          cobranca_url: abacateData.data?.url,
          pix_copia_cola: abacateData.data?.pix?.code,
          pix_qr_code_url: abacateData.data?.pix?.qrCodeUrl,
          cobranca_expira_em: abacateData.data?.expiresAt,
          status: 'aguardando_pagamento',
        })
        .eq('id', pedido.id);

      return new Response(JSON.stringify(abacateData.data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Modo Sandbox / Demonstração (quando ainda não configurou as chaves de produção da AbacatePay)
    const mockBillingId = `abacate_demo_${Date.now()}`;
    const mockPixCode = `00020126580014br.gov.bcb.pix0136${pedido.id}520400005303986540${pedido.total}5802BR5916Gabi Cookies6013Sao Leopoldo62070503***6304`;
    const mockExpires = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    await supabase
      .from('pedidos')
      .update({
        id_cobranca: mockBillingId,
        pix_copia_cola: mockPixCode,
        pix_qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(mockPixCode)}`,
        cobranca_expira_em: mockExpires,
        status: 'aguardando_pagamento',
      })
      .eq('id', pedido.id);

    return new Response(
      JSON.stringify({
        id: mockBillingId,
        url: `${req.headers.get('origin')}/pedido/${pedido.id}`,
        pix: {
          code: mockPixCode,
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(mockPixCode)}`,
        },
        expiresAt: mockExpires,
        status: 'PENDING',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
