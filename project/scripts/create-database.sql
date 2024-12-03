-- Habilita as extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de turnos
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de dias não contábeis
CREATE TABLE non_accounting_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (
    type IN (
      'Férias',
      'Licença Médica',
      'Licença Maternidade',
      'Licença Paternidade',
      'Dispensa Luto',
      'Núpcias',
      'Outros'
    )
  ),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de produtos (planos no Stripe)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  stripe_product_id TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de preços
CREATE TABLE prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  stripe_price_id TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true,
  type TEXT NOT NULL CHECK (type IN ('one_time', 'recurring')),
  interval TEXT CHECK (
    type = 'recurring' AND interval IN ('month', 'year')
    OR type = 'one_time' AND interval IS NULL
  ),
  interval_count INTEGER CHECK (
    type = 'recurring' AND interval_count > 0
    OR type = 'one_time' AND interval_count IS NULL
  ),
  unit_amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'brl',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de assinaturas
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused')
  ),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  price_id UUID REFERENCES prices(id),
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX shifts_user_id_idx ON shifts(user_id);
CREATE INDEX shifts_start_time_idx ON shifts(start_time);
CREATE INDEX non_accounting_days_user_id_idx ON non_accounting_days(user_id);
CREATE INDEX non_accounting_days_date_idx ON non_accounting_days(date);
CREATE INDEX subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX subscriptions_status_idx ON subscriptions(status);

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at
  BEFORE UPDATE ON shifts
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_non_accounting_days_updated_at
  BEFORE UPDATE ON non_accounting_days
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_prices_updated_at
  BEFORE UPDATE ON prices
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- RLS (Row Level Security) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE non_accounting_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies para usuários autenticados
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own shifts" ON shifts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shifts" ON shifts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shifts" ON shifts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shifts" ON shifts
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own non-accounting days" ON non_accounting_days
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own non-accounting days" ON non_accounting_days
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own non-accounting days" ON non_accounting_days
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own non-accounting days" ON non_accounting_days
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Função para criar usuário com período de teste
CREATE OR REPLACE FUNCTION create_user_with_trial(
  user_id UUID,
  user_email TEXT,
  user_name TEXT
)
RETURNS void AS $$
DECLARE
  trial_end_date TIMESTAMPTZ;
BEGIN
  -- Define data de término do trial (14 dias)
  trial_end_date := now() + interval '14 days';

  -- Insere usuário
  INSERT INTO users (id, email, name)
  VALUES (user_id, user_email, user_name);

  -- Cria assinatura em trial
  INSERT INTO subscriptions (
    user_id,
    status,
    stripe_customer_id,
    trial_start,
    trial_end,
    current_period_start,
    current_period_end
  )
  VALUES (
    user_id,
    'trialing',
    '', -- Será atualizado quando criar customer no Stripe
    now(),
    trial_end_date,
    now(),
    trial_end_date
  );
END;
$$ LANGUAGE plpgsql;