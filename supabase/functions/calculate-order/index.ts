// Supabase Edge Function: calculate-order
// Recalcula totais do pedido no servidor (o navegador nunca decide valores)

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

    const body = await req.json();
    const { itens, pontos_usados = 0, cupom_codigo, tipo_entrega, distancia_km = 0, cliente_id } = body;

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nenhum item fornecido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Busca cookies oficiais do banco para evitar adulteração de preços
    const { data: cookiesBanco, error: cookiesError } = await supabase
      .from('cookies')
      .select('id, preco, disponivel_hoje, ativo');

    if (cookiesError || !cookiesBanco) {
      throw new Error('Falha ao buscar cookies do cardápio');
    }

    const cookieMap = new Map(cookiesBanco.map((c) => [c.id, c]));

    // 2. Calcula subtotal e kits
    let subtotal = 0;
    let desconto_kit = 0;
    let totalCookiesComprados = 0;

    for (const item of itens) {
      if (item.is_gratis) continue;

      if (item.tipo === 'kit' && item.kit_tamanho) {
        let kitPreco = 0;
        if (item.sabores_kit && Array.isArray(item.sabores_kit)) {
          for (const sabor of item.sabores_kit) {
            const dbCookie = cookieMap.get(sabor.cookie_id);
            const preco = dbCookie ? Number(dbCookie.preco) : 11.00;
            kitPreco += preco * sabor.quantidade;
          }
        } else {
          kitPreco = item.kit_tamanho * 11.00;
        }

        subtotal += kitPreco * item.quantidade;
        
        // Regra do kit: R$ 1,50 a cada 2 cookies
        const pares = Math.floor(item.kit_tamanho / 2);
        desconto_kit += pares * 1.50 * item.quantidade;
        totalCookiesComprados += item.kit_tamanho * item.quantidade;
      } else {
        const dbCookie = cookieMap.get(item.cookie_id);
        const preco = dbCookie ? Number(dbCookie.preco) : 11.00;
        subtotal += preco * item.quantidade;
        totalCookiesComprados += item.quantidade;
      }
    }

    const baseComDescontoKit = Math.max(0, subtotal - desconto_kit);

    // 3. Validação e cálculo de pontos
    let pontosPermitidos = 0;
    if (pontos_usados > 0 && cliente_id) {
      const { data: perfil } = await supabase
        .from('perfis')
        .select('saldo_pontos')
        .eq('id', cliente_id)
        .single();

      const saldoDisponivel = perfil?.saldo_pontos || 0;
      pontosPermitidos = Math.min(pontos_usados, saldoDisponivel, 100);
    }
    const desconto_pontos = Number((baseComDescontoKit * (pontosPermitidos / 100)).toFixed(2));

    // 4. Validação e cálculo de cupom
    let desconto_cupom = 0;
    let cupomValido = null;
    if (cupom_codigo) {
      const { data: cupom } = await supabase
        .from('cupons')
        .select('*')
        .eq('codigo', cupom_codigo.trim().toUpperCase())
        .eq('ativo', true)
        .single();

      if (cupom) {
        cupomValido = cupom;
        if (cupom.tipo === 'porcentagem') {
          desconto_cupom = Number((baseComDescontoKit * (cupom.valor / 100)).toFixed(2));
        } else {
          desconto_cupom = Number(cupom.valor);
        }
      }
    }

    // Garante que a soma de pontos e cupom não exceda a base
    if (desconto_pontos + desconto_cupom > baseComDescontoKit) {
      desconto_cupom = Math.max(0, Number((baseComDescontoKit - desconto_pontos).toFixed(2)));
    }

    const total_produtos = Math.max(0, Number((baseComDescontoKit - desconto_pontos - desconto_cupom).toFixed(2)));

    // 5. Cálculo do frete
    let frete = 0;
    if (tipo_entrega === 'entrega' && distancia_km > 0) {
      const { data: faixas } = await supabase
        .from('faixas_frete')
        .select('*')
        .order('km_inicial', { ascending: true });

      if (faixas && faixas.length > 0) {
        for (const faixa of faixas) {
          if (distancia_km >= faixa.km_inicial && distancia_km <= faixa.km_final) {
            frete = Number(faixa.valor);
            break;
          }
        }
        const ultimaFaixa = faixas[faixas.length - 1];
        if (distancia_km > ultimaFaixa.km_final) {
          const excedente = Math.ceil(distancia_km - ultimaFaixa.km_final);
          frete = Number(ultimaFaixa.valor) + excedente * 2.50;
        }
      } else {
        frete = 5.00;
      }
    }

    const total = Number((total_produtos + frete).toFixed(2));

    return new Response(
      JSON.stringify({
        subtotal: Number(subtotal.toFixed(2)),
        desconto_kit: Number(desconto_kit.toFixed(2)),
        base_com_desconto_kit: Number(baseComDescontoKit.toFixed(2)),
        pontos_usados: pontosPermitidos,
        desconto_pontos,
        cupom_codigo: cupomValido ? cupomValido.codigo : null,
        desconto_cupom,
        frete: Number(frete.toFixed(2)),
        total_produtos,
        total,
        pontos_a_ganhar: totalCookiesComprados,
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
