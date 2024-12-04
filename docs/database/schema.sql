-- Reset do banco de dados (remove todas as tabelas existentes)
drop schema public cascade;
create schema public;

-- Habilita a extensão UUID
create extension if not exists "uuid-ossp";

-- Tabela de usuários
create table users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabela de turnos
create table shifts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabela de dias não contábeis
create table non_accounting_days (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade not null,
  date date not null,
  type text not null check (
    type in (
      'Férias',
      'Licença Médica',
      'Licença Maternidade',
      'Licença Paternidade',
      'Dispensa Luto',
      'Núpcias',
      'Outros'
    )
  ),
  reason text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabela de planos
create table plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price decimal(10,2) not null,
  interval text not null check (interval in ('month', 'year')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabela de assinaturas
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade not null,
  plan_id uuid references plans(id) on delete restrict not null,
  status text not null check (
    status in ('active', 'trial', 'cancelled', 'expired')
  ),
  trial_ends_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  current_period_end timestamp with time zone not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índices para melhor performance
create index shifts_user_id_idx on shifts(user_id);
create index shifts_start_time_idx on shifts(start_time);
create index non_accounting_day