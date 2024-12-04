# NoQap - Documentação Técnica

## Visão Geral
NoQap é um sistema de rastreamento de tempo que utiliza Supabase para gerenciamento de banco de dados e autenticação, e Stripe para processamento de pagamentos e gerenciamento de assinaturas.

## Estrutura do Banco de Dados (Supabase)

### Tabelas

#### users
```sql
create table users (
  id uuid references auth.users not null primary key,
  email text not null,
  name text,
  stripe_customer_id text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### subscriptions
```sql
create table subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) not null,
  stripe_subscription_id text unique not null,
  stripe_customer_id text not null,
  status text not null,
  price_id text not null,
  trial_start timestamp with time zone,
  trial_end timestamp with time zone,
  current_period_start timestamp with time zone not null,
  current_period_end timestamp with time zone not null,
  canceled_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Políticas de Segurança (RLS)

#### users
```sql
-- Leitura: usuário só pode ler seus próprios dados
create policy "Users can view own profile"
  on users for select
  using ( auth.uid() = id );

-- Atualização: usuário só pode atualizar seus próprios dados
create policy "Users can update own profile"
  on users for update
  using ( auth.uid() = id );
```

#### subscriptions
```sql
-- Leitura: usuário só pode ver suas próprias assinaturas
create policy "Users can view own subscriptions"
  on subscriptions for select
  using ( auth.uid() = user_id );

-- Inserção: apenas via função do backend
create policy "Backend can insert subscriptions"
  on subscriptions for insert
  with check ( true );

-- Atualização: apenas via função do backend
create policy "Backend can update subscriptions"
  on subscriptions for update
  using ( true );
```

## Configuração do Stripe

### Produtos e Preços

#### Plano Básico
- **ID do Produto**: `prod_basic`
- **Nome**: Básico
- **Preço**: R$ 29,90/mês
- **ID do Preço**: Definido em `REACT_APP_STRIPE_BASIC_PRICE_ID`
- **Recursos**:
  - Rastreamento ilimitado de tempo
  - Relatórios básicos
  - Exportação de dados

#### Plano Pro
- **ID do Produto**: `prod_pro`
- **Nome**: Pro
- **Preço**: R$ 49,90/mês
- **ID do Preço**: Definido em `REACT_APP_STRIPE_PRO_PRICE_ID`
- **Recursos**:
  - Todos os recursos do plano Básico
  - Relatórios avançados
  - Integração com calendário
  - Suporte prioritário

### Webhooks

#### Endpoints
- `/api/webhooks/stripe`: Endpoint para receber eventos do Stripe

#### Eventos Monitorados
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

## Fluxo de Assinatura

### 1. Criação de Usuário
1. Usuário se registra através do Supabase Auth
2. Trigger cria entrada na tabela `users`

### 2. Início do Trial
1. Ao selecionar um plano, cria-se uma sessão de checkout no Stripe
2. Período de trial de 14 dias é configurado
3. Após confirmação, webhook atualiza tabela `subscriptions`

### 3. Durante o Trial
1. Sistema verifica dias restantes do trial
2. Mostra avisos quando:
   - Faltam 3 dias ou menos
   - Trial expirou

### 4. Pós-Trial
1. Se o usuário não assinar:
   - Acesso é limitado
   - Avisos são exibidos
   - Botões de ação são desabilitados

2. Se o usuário assinar:
   - Stripe processa o pagamento
   - Webhook atualiza status da assinatura
   - Acesso completo é liberado

## Variáveis de Ambiente

```env
# Supabase
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=sua_chave_publica_do_stripe
VITE_STRIPE_SECRET_KEY=sua_chave_secreta_do_stripe
VITE_STRIPE_WEBHOOK_SECRET=seu_segredo_do_webhook_do_stripe
VITE_STRIPE_BASIC_PRICE_ID=id_do_preco_do_plano_basico
VITE_STRIPE_PRO_PRICE_ID=id_do_preco_do_plano_pro
```

## Componentes Principais

### Assinatura
- `SubscriptionStatus`: Exibe status da assinatura e dias restantes do trial
- `PlansGrid`: Mostra planos disponíveis com preços e recursos
- `PlanCard`: Card individual de cada plano
- `TrialBanner`: Banner informativo sobre o trial

### Páginas
- `SuccessPage`: Página de sucesso após assinatura
- `CancelPage`: Página de cancelamento/erro de assinatura

## Funções de API

### Stripe
```typescript
// Criar sessão de checkout
createCheckoutSession(priceId: string, userId: string, trial_period_days: number = 14)

// Criar sessão do portal
createPortalSession(customerId: string)

// Cancelar assinatura
cancelSubscription(subscriptionId: string)

// Atualizar assinatura
updateSubscription(subscriptionId: string, priceId: string)
```

### Supabase
```typescript
// Buscar assinatura do usuário
getSubscription(userId: string)

// Atualizar status da assinatura
updateSubscriptionStatus(subscriptionId: string, status: string)
```

## Tratamento de Erros

1. **Falha no Pagamento**
   - Webhook recebe `invoice.payment_failed`
   - Status da assinatura é atualizado
   - Usuário é notificado via toast

2. **Erro no Checkout**
   - Usuário é redirecionado para `CancelPage`
   - Toast de erro é exibido
   - Opção de tentar novamente é fornecida

3. **Erro na API**
   - Erros são logados no console
   - Toast de erro é mostrado ao usuário
   - Estado de loading é resetado

## Segurança

1. **Autenticação**
   - Gerenciada pelo Supabase Auth
   - JWT tokens para autenticação
   - Refresh tokens para manter sessão

2. **Autorização**
   - Políticas RLS no Supabase
   - Verificação de usuário em todas as operações
   - Middleware de autenticação nas rotas protegidas

3. **Dados Sensíveis**
   - Chaves do Stripe armazenadas em variáveis de ambiente
   - Dados de cartão não são armazenados
   - Webhook com assinatura verificada

## Manutenção

### Monitoramento
1. Verificar logs do Supabase para erros de autenticação
2. Monitorar dashboard do Stripe para:
   - Pagamentos falhos
   - Cancelamentos
   - Disputas

### Atualizações
1. Manter dependências atualizadas
2. Verificar compatibilidade com:
   - API do Stripe
   - SDK do Supabase
   - React e outras bibliotecas
