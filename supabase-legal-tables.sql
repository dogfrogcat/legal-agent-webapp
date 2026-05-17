-- 사건 파일함을 Supabase 계정별로 저장하기 위한 기본 스키마입니다.
-- Supabase Dashboard > SQL Editor에서 실행하세요.

create table if not exists public.legal_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '새 법률 사건',
  mode text not null default 'dispute',
  case_type text not null default 'general',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.legal_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id uuid not null references public.legal_cases(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists legal_cases_user_updated_idx
  on public.legal_cases (user_id, updated_at desc);

create index if not exists legal_messages_case_created_idx
  on public.legal_messages (case_id, created_at asc);

alter table public.legal_cases enable row level security;
alter table public.legal_messages enable row level security;

drop policy if exists "Users can read own legal cases" on public.legal_cases;
create policy "Users can read own legal cases"
  on public.legal_cases for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own legal cases" on public.legal_cases;
create policy "Users can insert own legal cases"
  on public.legal_cases for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own legal cases" on public.legal_cases;
create policy "Users can update own legal cases"
  on public.legal_cases for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own legal cases" on public.legal_cases;
create policy "Users can delete own legal cases"
  on public.legal_cases for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can read own legal messages" on public.legal_messages;
create policy "Users can read own legal messages"
  on public.legal_messages for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own legal messages" on public.legal_messages;
create policy "Users can insert own legal messages"
  on public.legal_messages for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.legal_cases
      where legal_cases.id = legal_messages.case_id
        and legal_cases.user_id = auth.uid()
    )
  );

drop policy if exists "Users can delete own legal messages" on public.legal_messages;
create policy "Users can delete own legal messages"
  on public.legal_messages for delete
  using (auth.uid() = user_id);
