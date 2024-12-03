import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '../store/useStore';
import { errorLogger } from '../utils/errorLog';
import * as api from '../lib/api';

export function useData() {
  const queryClient = useQueryClient();
  const user = useStore(state => state.user);

  // Shifts Query
  const { data: shifts, isLoading: isLoadingShifts } = useQuery({
    queryKey: ['shifts', user?.id],
    queryFn: () => user ? api.getShifts(user.id) : Promise.resolve([]),
    enabled: !!user
  });

  // Non-accounting Days Query
  const { data: nonAccountingDays, isLoading: isLoadingDays } = useQuery({
    queryKey: ['non_accounting_days', user?.id],
    queryFn: () => user ? api.getNonAccountingDays(user.id) : Promise.resolve([]),
    enabled: !!user
  });

  // Add Shift Mutation
  const addShift = useMutation({
    mutationFn: (shift: { startTime: Date; endTime: Date; description?: string; }) => {
      if (!user) throw new Error('No user');
      return api.createShift(user.id, shift);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
    onError: (error) => {
      errorLogger.logError(error as Error, 'Data:addShift');
    }
  });

  // Add Non-accounting Day Mutation
  const addNonAccountingDay = useMutation({
    mutationFn: (day: { date: Date; type: string; reason?: string; }) => {
      if (!user) throw new Error('No user');
      return api.createNonAccountingDay(user.id, day);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['non_accounting_days'] });
    },
    onError: (error) => {
      errorLogger.logError(error as Error, 'Data:addNonAccountingDay');
    }
  });

  return {
    shifts: shifts || [],
    nonAccountingDays: nonAccountingDays || [],
    addShift: addShift.mutate,
    addNonAccountingDay: addNonAccountingDay.mutate,
    isLoading: isLoadingShifts || isLoadingDays
  };
}