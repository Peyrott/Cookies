-- ==============================================================================
-- CORREÇÃO RLS: Função is_admin() Security Definer para evitar recursão infinita
-- ==============================================================================

-- 1. Função auxiliar que ignora RLS para verificar se o usuário é admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.perfis
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 2. Remove políticas antigas que causavam recursão
drop policy if exists "Usuário vê próprio perfil" on public.perfis;
drop policy if exists "Usuário atualiza próprio perfil" on public.perfis;
drop policy if exists "Admin gerencia perfis" on public.perfis;
drop policy if exists "Admin edita cookies" on public.cookies;
drop policy if exists "Admin edita categorias" on public.categorias;
drop policy if exists "Admin edita cupons" on public.cupons;
drop policy if exists "Admin edita faixas_frete" on public.faixas_frete;
drop policy if exists "Admin edita faq" on public.faq;
drop policy if exists "Admin edita config" on public.config;
drop policy if exists "Cliente vê próprios pedidos" on public.pedidos;
drop policy if exists "Admin atualiza pedidos" on public.pedidos;
drop policy if exists "Ver movimentos de fidelidade" on public.movimentos_fidelidade;

-- 3. Recria políticas corretas e seguras

-- PERFIS
create policy "Usuário vê próprio perfil" on public.perfis 
  for select using (auth.uid() = id or public.is_admin());

create policy "Usuário atualiza próprio perfil" on public.perfis 
  for update using (auth.uid() = id or public.is_admin());

create policy "Admin gerencia perfis" on public.perfis
  for all using (public.is_admin());

-- PEDIDOS
create policy "Cliente vê próprios pedidos" on public.pedidos 
  for select using (cliente_id = auth.uid() or public.is_admin());

create policy "Admin atualiza pedidos" on public.pedidos 
  for update using (public.is_admin());

-- MOVIMENTOS DE FIDELIDADE
create policy "Ver movimentos de fidelidade" on public.movimentos_fidelidade 
  for select using (perfil_id = auth.uid() or public.is_admin());

-- ADMIN EDITA TABELAS PÚBLICAS
create policy "Admin edita cookies" on public.cookies 
  for all using (public.is_admin());

create policy "Admin edita categorias" on public.categorias 
  for all using (public.is_admin());

create policy "Admin edita cupons" on public.cupons 
  for all using (public.is_admin());

create policy "Admin edita faixas_frete" on public.faixas_frete 
  for all using (public.is_admin());

create policy "Admin edita faq" on public.faq 
  for all using (public.is_admin());

create policy "Admin edita config" on public.config 
  for all using (public.is_admin());
