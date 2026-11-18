import { Cupom, FaixaFrete, ItemCarrinho, TipoEntrega } from '../types';

export interface CalculationResult {
  subtotal: number;
  desconto_kit: number;
  base_com_desconto_kit: number;
  desconto_pontos: number;
  desconto_cupom: number;
  frete: number;
  total_produtos: number;
  total: number;
  pontos_a_ganhar: number;
}

/**
 * Calcula o desconto do kit conforme regra de negócio:
 * R$ 1,50 a cada 2 cookies em kits de 3, 5 ou 8:
 * - Kit 3 = R$ 1,50 (1 par)
 * - Kit 5 = R$ 3,00 (2 pares)
 * - Kit 8 = R$ 6,00 (4 pares)
 */
export function calcularDescontoKit(tamanho: 3 | 5 | 8, valorPorPar: number = 1.50): number {
  const pares = Math.floor(tamanho / 2);
  return pares * valorPorPar;
}

/**
 * Calcula o frete com base no tipo de entrega e na distância
 */
export function calcularFrete(
  tipo: TipoEntrega,
  distanciaKm: number | undefined,
  faixas: FaixaFrete[],
  taxaKmAdicional: number = 2.50
): number {
  if (tipo === 'retirada' || tipo === 'unisinos_portao_b') {
    return 0;
  }

  if (distanciaKm === undefined || distanciaKm <= 0) {
    return 0;
  }

  // Ordena faixas por km_inicial
  const faixasOrdenadas = [...faixas].sort((a, b) => a.km_inicial - b.km_inicial);
  
  // Procura faixa correspondente
  for (const faixa of faixasOrdenadas) {
    if (distanciaKm >= faixa.km_inicial && distanciaKm <= faixa.km_final) {
      return faixa.valor;
    }
  }

  // Se acima da última faixa
  const ultimaFaixa = faixasOrdenadas[faixasOrdenadas.length - 1];
  if (ultimaFaixa && distanciaKm > ultimaFaixa.km_final) {
    const kmExcedente = distanciaKm - ultimaFaixa.km_final;
    const valorExtra = Math.ceil(kmExcedente) * taxaKmAdicional;
    return ultimaFaixa.valor + valorExtra;
  }

  return 5.00; // Valor padrão inicial de segurança
}

/**
 * Realiza o cálculo completo e rigoroso de valores do pedido seguindo estritamente a ordem do plano:
 * 1. Subtotal dos itens
 * 2. Menos o desconto dos kits
 * 3. A base resultante recebe o desconto dos pontos (1 ponto = 1% até 100%)
 * 4. O cupom abate da mesma base
 * 5. Soma-se o frete, que não tem desconto
 * 6. O total dos produtos nunca fica negativo
 */
export function calcularTotaisPedido(
  itens: ItemCarrinho[],
  pontosUsados: number,
  cupom: Cupom | null,
  tipoEntrega: TipoEntrega,
  distanciaKm: number | undefined,
  faixasFrete: FaixaFrete[],
  taxaKmAdicional: number = 2.50
): CalculationResult {
  let subtotal = 0;
  let desconto_kit = 0;
  let totalCookiesComprados = 0;

  for (const item of itens) {
    if (item.is_gratis) {
      continue; // Cookie grátis não soma no subtotal e não gera pontos
    }

    if (item.tipo === 'kit' && item.kit_tamanho) {
      // Subtotal dos sabores do kit multiplicado pela quantidade de kits
      let precoSomaSabores = 0;
      if (item.sabores_kit && item.sabores_kit.length > 0) {
        for (const sabor of item.sabores_kit) {
          precoSomaSabores += (sabor.preco || 11.00) * sabor.quantidade;
        }
      } else {
        precoSomaSabores = item.preco_unitario || (item.kit_tamanho * 11.00);
      }

      const itemSubtotal = precoSomaSabores * item.quantidade;
      subtotal += itemSubtotal;

      // Desconto do kit por unidade de kit
      const descontoPorKit = calcularDescontoKit(item.kit_tamanho);
      desconto_kit += descontoPorKit * item.quantidade;

      totalCookiesComprados += item.kit_tamanho * item.quantidade;
    } else {
      // Cookie unitário
      const itemSubtotal = item.preco_unitario * item.quantidade;
      subtotal += itemSubtotal;
      totalCookiesComprados += item.quantidade;
    }
  }

  // 2. Base com desconto de kit
  const baseComDescontoKit = Math.max(0, subtotal - desconto_kit);

  // 3. Desconto de pontos (1 ponto = 1%, até 100%)
  const pontosValidados = Math.min(Math.max(0, Math.floor(pontosUsados)), 100);
  const percentualPontos = pontosValidados / 100;
  const desconto_pontos = Number((baseComDescontoKit * percentualPontos).toFixed(2));

  // 4. Desconto do cupom (sobre a mesma base, sem ultrapassar o saldo restante de produtos)
  let desconto_cupom = 0;
  if (cupom && cupom.ativo) {
    if (cupom.tipo === 'porcentagem') {
      const perc = Math.min(100, Math.max(0, cupom.valor)) / 100;
      desconto_cupom = Number((baseComDescontoKit * perc).toFixed(2));
    } else {
      desconto_cupom = Number(cupom.valor.toFixed(2));
    }
  }

  // Garante que a soma dos descontos de pontos + cupom não deixe os produtos negativos
  const maxDescontosPermitidos = baseComDescontoKit;
  let somaDescontos = desconto_pontos + desconto_cupom;
  if (somaDescontos > maxDescontosPermitidos) {
    // Se o cupom fizer estourar, ajustamos o desconto do cupom para atingir no máximo 100% de desconto
    desconto_cupom = Math.max(0, Number((maxDescontosPermitidos - desconto_pontos).toFixed(2)));
  }

  const total_produtos = Math.max(0, Number((baseComDescontoKit - desconto_pontos - desconto_cupom).toFixed(2)));

  // 5. Frete
  const frete = calcularFrete(tipoEntrega, distanciaKm, faixasFrete, taxaKmAdicional);

  // Total final
  const total = Number((total_produtos + frete).toFixed(2));

  // Pontos ganhos: +1 ponto por cookie comprado (cookies grátis não contam)
  const pontos_a_ganhar = totalCookiesComprados;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    desconto_kit: Number(desconto_kit.toFixed(2)),
    base_com_desconto_kit: Number(baseComDescontoKit.toFixed(2)),
    desconto_pontos: Number(desconto_pontos.toFixed(2)),
    desconto_cupom: Number(desconto_cupom.toFixed(2)),
    frete: Number(frete.toFixed(2)),
    total_produtos: Number(total_produtos.toFixed(2)),
    total,
    pontos_a_ganhar,
  };
}

export function formatarPreco(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}
