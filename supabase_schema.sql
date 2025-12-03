-- Tabela de Perfis (Profiles)
-- Supabase gerencia usuários e senhas internamente na tabela auth.users.
-- Esta tabela 'profiles' é para dados adicionais do usuário (nome, foto, etc.)
-- e é vinculada à tabela de autenticação pelo ID.

create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone,
  
  primary key (id)
);

-- Habilitar Row Level Security (Segurança a Nível de Linha)
alter table public.profiles enable row level security;

-- Políticas de Segurança (Quem pode ver/editar o quê)

-- Qualquer um pode ver perfis (ou mude para 'auth.uid() = id' para privado)
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

-- Usuários podem inserir seu próprio perfil
create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

-- Usuários podem atualizar apenas seu próprio perfil
create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Função para criar perfil automaticamente ao cadastrar usuário
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger que dispara a função acima
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Content storage table for CMS
create table if not exists public.app_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default now()
);

alter table public.app_content enable row level security;

create policy "Anyone can read app content"
  on app_content for select
  using ( true );

create policy "Anon can upsert app content"
  on app_content for insert
  with check ( true );

create policy "Anon can update app content"
  on app_content for update
  using ( true );
