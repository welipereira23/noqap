export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          role: string;
          is_blocked: boolean;
          last_unblocked_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          role?: string;
          is_blocked?: boolean;
          last_unblocked_at?: string | null;
        };
        Update: {
          email?: string;
          name?: string | null;
          role?: string;
          is_blocked?: boolean;
          last_unblocked_at?: string | null;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          status: 'trialing' | 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid' | 'paused';
          stripe_subscription_id: string | null;
          stripe_customer_id: string;
          price_id: string | null;
          trial_start: string | null;
          trial_end: string | null;
          current_period_start: string;
          current_period_end: string;
          cancel_at: string | null;
          canceled_at: string | null;
          ended_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status: 'trialing' | 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid' | 'paused';
          stripe_subscription_id?: string | null;
          stripe_customer_id: string;
          price_id?: string | null;
          trial_start?: string | null;
          trial_end?: string | null;
          current_period_start: string;
          current_period_end: string;
          cancel_at?: string | null;
          canceled_at?: string | null;
          ended_at?: string | null;
        };
        Update: {
          status?: 'trialing' | 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid' | 'paused';
          stripe_subscription_id?: string | null;
          price_id?: string | null;
          trial_end?: string | null;
          current_period_end?: string;
          cancel_at?: string | null;
          canceled_at?: string | null;
          ended_at?: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          stripe_product_id: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          stripe_product_id: string;
          active?: boolean;
        };
        Update: {
          name?: string;
          description?: string | null;
          active?: boolean;
        };
      };
      prices: {
        Row: {
          id: string;
          product_id: string;
          stripe_price_id: string;
          active: boolean;
          type: 'one_time' | 'recurring';
          interval: 'month' | 'year' | null;
          interval_count: number | null;
          unit_amount: number;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          stripe_price_id: string;
          active?: boolean;
          type: 'one_time' | 'recurring';
          interval?: 'month' | 'year' | null;
          interval_count?: number | null;
          unit_amount: number;
          currency?: string;
        };
        Update: {
          active?: boolean;
          unit_amount?: number;
        };
      };
    };
  };
}