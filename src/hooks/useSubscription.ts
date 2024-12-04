import { useQuery } from '@tanstack/react-query';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/api';
import { errorLogger } from '../utils/errorLog';

export function useSubscription() {
  const user = useStore((state) => state.user);

  return useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      try {
        if (!user) return null;

        const { data, error } = await supabase
          .from('subscriptions')
          .select(`
            *,
            prices (
              *,
              products (*)
            )
          `)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        errorLogger.logError(error as Error, 'Subscription:fetch');
        return null;
      }
    },
    enabled: !!user,
  });
}