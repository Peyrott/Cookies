const url = 'https://hdiighnbkvtsylnicvbw.supabase.co/rest/v1/cookies?select=*';
const key = 'sb_publishable_qLfWu_emyFib6KopCaPj6w_O-GMQY_X';

async function testDirectFetch() {
  console.log('Testando REST endpoint do Supabase...');
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });

    const status = res.status;
    const body = await res.json();
    console.log('Status HTTP:', status);
    if (!res.ok) {
      console.log('Resposta do Supabase:', body);
      if (body.code === '42P01' || body.message?.includes('relation "public.cookies" does not exist')) {
        console.log('--> O script schema.sql ainda NÃO foi executado no SQL Editor do Supabase.');
      }
    } else {
      console.log('✅ Conexão bem sucedida! Total de cookies:', body.length);
      console.log(body.map((c: any) => c.nome));
    }
  } catch (err: any) {
    console.error('Erro na requisição:', err.message);
  }
}

testDirectFetch();
