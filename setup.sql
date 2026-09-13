-- 제29회 춘천시청소년문화축제 Supabase 초기 설정
-- Supabase Dashboard > SQL Editor > New query 에서 전체를 한 번 실행하세요.

-- 1) 참가자 테이블
create table if not exists public.participants (
  id uuid primary key,
  name text not null check (char_length(trim(name)) between 1 and 50),
  gender text not null check (gender in ('남','여','기타')),
  age_group text not null check (age_group in ('10대 이하','20대','30대','40대','50대','60대 이상')),
  sido text not null check (char_length(trim(sido)) between 1 and 50),
  sigungu text not null check (char_length(trim(sigungu)) between 1 and 50),
  consent_privacy boolean not null default false,
  consent_third_party boolean not null default false,
  consent_portrait boolean not null default false,
  created_at timestamptz not null default now(),
  checked_in boolean not null default false,
  checked_in_at timestamptz null
);

-- 2) 운영자 역할 테이블
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('staff','admin')),
  created_at timestamptz not null default now()
);

-- 3) RLS 활성화
alter table public.participants enable row level security;
alter table public.user_roles enable row level security;

-- 4) 기존 기본 권한 제거 후 필요한 권한만 부여
revoke all on table public.participants from anon, authenticated;
revoke all on table public.user_roles from anon, authenticated;

grant insert on table public.participants to anon;
grant select on table public.participants to authenticated;
grant update (checked_in, checked_in_at) on table public.participants to authenticated;
grant select on table public.user_roles to authenticated;

-- 5) 현재 로그인 사용자의 역할을 안전하게 확인하는 함수
create or replace function public.current_user_role()
returns text
language sql
security definer
stable
set search_path = ''
as $$
  select ur.role
  from public.user_roles ur
  where ur.user_id = (select auth.uid())
  limit 1;
$$;

revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to authenticated;

-- 6) 기존 동일 이름 정책이 있으면 제거
drop policy if exists "public can register" on public.participants;
drop policy if exists "staff admin can read participants" on public.participants;
drop policy if exists "staff admin can check in" on public.participants;
drop policy if exists "user can read own role" on public.user_roles;

-- 일반 참가자: 사전등록만 가능. 명단 조회/수정/삭제 불가.
create policy "public can register"
on public.participants
for insert
to anon
with check (
  consent_privacy = true
  and consent_third_party = true
  and consent_portrait = true
  and checked_in = false
  and checked_in_at is null
);

-- 로그인한 staff/admin만 참가자 조회 가능
create policy "staff admin can read participants"
on public.participants
for select
to authenticated
using (
  public.current_user_role() in ('staff','admin')
);

-- 로그인한 staff/admin만 입장 상태 업데이트 가능
-- 실제 UPDATE 권한은 checked_in, checked_in_at 두 컬럼에만 부여되어 있음.
create policy "staff admin can check in"
on public.participants
for update
to authenticated
using (
  public.current_user_role() in ('staff','admin')
)
with check (
  public.current_user_role() in ('staff','admin')
);

-- 로그인 사용자는 자신의 역할 행만 읽을 수 있음
create policy "user can read own role"
on public.user_roles
for select
to authenticated
using (
  user_id = (select auth.uid())
);

-- 7) 역할 부여 방법
-- Supabase Dashboard > Authentication > Users 에서 먼저 사용자를 만든 뒤,
-- 해당 사용자의 UUID를 아래 예시처럼 넣고 별도로 실행하세요.
--
-- insert into public.user_roles (user_id, role)
-- values ('여기에-스태프-UUID', 'staff');
--
-- insert into public.user_roles (user_id, role)
-- values ('여기에-관리자-UUID', 'admin');
