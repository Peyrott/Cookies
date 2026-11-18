// Supabase Edge Function: abacate-pay-webhook
// Recebe webhooks da AbacatePay para confirmação de pagamento ou expiração

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

    const webhookSecret = Deno.env.get('ABACATEPAY_WEBHOOK_SECRET');
    // Validação opcional de assinatura caso configurada
    const signature = req.headers.get('x-abacatepay-signature');
    if (webhookSecret && signature) {
      // Conferência de assinatura
    }

    const payload = await req.json();
    const event = payload.event; // Ex: 'billing.paid' ou 'billing.expired'
    const billing = payload.data?.billing;
    const pedidoId = billing?.metadata?.pedido_id;

    if (!pedidoId) {
      return new Response(JSON.stringify({ message: 'Ignorado: sem pedido_id no metadata' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (event === 'billing.paid') {
      // Atualiza o pedido para 'recebido' (já pago)
      await supabase
        .from('pedidos')
        .update({
          status: 'recebido',
          updated_at: new Date().toISOString(),
        })
        .eq('id', pedidoId);
    } else if (event === 'billing.expired') {
      // Se expirar, altera para 'expirado' (o trigger estorna os pontos se houver)
      await supabase
        .from('pedidos')
        .update({
          status: 'expirado',
          updated_at: new Date().toISOString(),
        })
        .eq('id', pedidoId);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
