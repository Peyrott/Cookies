import { calcularDescontoKit, calcularFrete, calcularTotaisPedido } from '../src/utils/pricing.ts';
import { FAIXAS_FRETE_INICIAIS } from '../src/data/initialData.ts';
import { ItemCarrinho, Cupom } from '../src/types/index.ts';

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`❌ FALHA: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✅ SUCESSO: ${msg}`);
  }
}

console.log('--- TESTANDO REGRAS DE NEGÓCIO GABI COOKIES ---\n');

// 1. TESTE DOS KITS
console.log('1. Regra de Desconto dos Kits (R$ 1,50 a cada 2 cookies):');
assert(calcularDescontoKit(3) === 1.50, 'Kit 3 deve ter R$ 1,50 de desconto');
assert(calcularDescontoKit(5) === 3.00, 'Kit 5 deve ter R$ 3,00 de desconto');
assert(calcularDescontoKit(8) === 6.00, 'Kit 8 deve ter R$ 6,00 de desconto');

// 2. TESTE DO EXEMPLO DO PLANO
// "kit de 8 de R$ 11 = R$ 88, menos R$ 6 do kit = R$ 82. Com 10 pontos (R$ 8,20) fica R$ 73,80, e depois soma-se o frete."
console.log('\n2. Teste do Exemplo Oficial do Plano:');
const itemKit8: ItemCarrinho = {
  id: 'kit-1',
  tipo: 'kit',
  kit_tamanho: 8,
  preco_unitario: 88.00, // 8 * 11
  subtotal: 88.00,
  quantidade: 1,
  sabores_kit: [
    { cookie_id: 'c1', nome: 'Gotas Belga', preco: 11.00, quantidade: 8 }
  ]
};

const resultadoPlano = calcularTotaisPedido(
  [itemKit8],
  10, // 10 pontos
  null, // sem cupom
  'unisinos_portao_b', // frete gratis
  0,
  FAIXAS_FRETE_INICIAIS
);

console.log('Resultado obtido:', resultadoPlano);
assert(resultadoPlano.subtotal === 88.00, 'Subtotal deve ser R$ 88,00');
assert(resultadoPlano.desconto_kit === 6.00, 'Desconto do kit deve ser R$ 6,00');
assert(resultadoPlano.base_com_desconto_kit === 82.00, 'Base pós-kit deve ser R$ 82,00');
assert(resultadoPlano.desconto_pontos === 8.20, 'Desconto de 10 pontos (10%) deve ser R$ 8,20');
assert(resultadoPlano.total_produtos === 73.80, 'Total dos produtos deve ser R$ 73,80');
assert(resultadoPlano.frete === 0, 'Frete Unisinos Portão B deve ser R$ 0,00');
assert(resultadoPlano.total === 73.80, 'Total final deve ser R$ 73,80');
assert(resultadoPlano.pontos_a_ganhar === 8, 'Deve ganhar +8 pontos (1 por cookie)');

// 3. TESTE DE CUMULATIVIDADE CUPOM + PONTOS
console.log('\n3. Teste de Cumulatividade: Pontos + Cupom:');
const cupom10Perc: Cupom = {
  id: 'cup-1',
  codigo: 'PROMO10',
  tipo: 'porcentagem',
  valor: 10,
  ativo: true,
  usos_atuais: 0
};

const resCupomPontos = calcularTotaisPedido(
  [itemKit8],
  10, // 10% de pontos (R$ 8,20)
  cupom10Perc, // 10% de cupom (R$ 8,20)
  'retirada', // frete 0
  0,
  FAIXAS_FRETE_INICIAIS
);

assert(resCupomPontos.desconto_pontos === 8.20, 'Desconto pontos deve ser R$ 8,20');
assert(resCupomPontos.desconto_cupom === 8.20, 'Desconto cupom deve ser R$ 8,20');
assert(resCupomPontos.total === 82.00 - 8.20 - 8.20, 'Total deve ser R$ 65,60');

// 4. TESTE DE FRETE POR FAIXAS
console.log('\n4. Teste de Frete por Faixas de Km:');
assert(calcularFrete('retirada', 5, FAIXAS_FRETE_INICIAIS) === 0, 'Retirada é frete grátis');
assert(calcularFrete('unisinos_portao_b', 5, FAIXAS_FRETE_INICIAIS) === 0, 'Unisinos Portão B é frete grátis');
assert(calcularFrete('entrega', 1.5, FAIXAS_FRETE_INICIAIS) === 5.00, 'Até 2 km = R$ 5,00');
assert(calcularFrete('entrega', 3.0, FAIXAS_FRETE_INICIAIS) === 8.00, '2-4 km = R$ 8,00');
assert(calcularFrete('entrega', 5.5, FAIXAS_FRETE_INICIAIS) === 11.00, '4-6 km = R$ 11,00');
assert(calcularFrete('entrega', 7.2, FAIXAS_FRETE_INICIAIS) === 14.00, '6-8 km = R$ 14,00');
assert(calcularFrete('entrega', 9.5, FAIXAS_FRETE_INICIAIS) === 17.00, '8-10 km = R$ 17,00');
assert(calcularFrete('entrega', 12.0, FAIXAS_FRETE_INICIAIS) === 17.00 + (2 * 2.50), '12 km = R$ 17 + 2*2.50 = R$ 22,00');

// 5. TESTE DE COOKIE GRÁTIS RESGATADO NÃO PONTUAR
console.log('\n5. Teste de Cookie Grátis Resgatado:');
const itemGratis: ItemCarrinho = {
  id: 'gratis-1',
  tipo: 'gratis',
  cookie_id: 'c-red-velvet',
  preco_unitario: 0,
  subtotal: 0,
  quantidade: 1,
  is_gratis: true,
};

const resComGratis = calcularTotaisPedido(
  [itemKit8, itemGratis],
  0,
  null,
  'retirada',
  0,
  FAIXAS_FRETE_INICIAIS
);

assert(resComGratis.subtotal === 88.00, 'Cookie grátis não soma no subtotal');
assert(resComGratis.pontos_a_ganhar === 8, 'Cookie grátis não gera pontos (+8 apenas do kit)');

console.log('\n🎉 TODOS OS TESTES DE REGRAS DE NEGÓCIO PASSARAM COM SUCESSO!\n');
