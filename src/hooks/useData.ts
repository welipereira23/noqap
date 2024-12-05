import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '../store/useStore';
import { errorLogger } from '../utils/errorLog';
import * as api from '../lib/api';
import { Shift, NonAccountingDay } from '../types';

// Função auxiliar para converter datas
function convertShiftDates(shift: any): Shift {
  return {
    ...shift,
    startTime: new Date(shift.start_time),
    endTime: new Date(shift.end_time),
    userId: shift.user_id,
    createdAt: new Date(shift.created_at),
    updatedAt: new Date(shift.updated_at)
  };
}

function convertNonAccountingDayDates(day: any): NonAccountingDay {
  return {
    ...day,
    date: new Date(day.date),
    userId: day.user_id,
    createdAt: new Date(day.created_at),
    updatedAt: new Date(day.updated_at)
  };
}

export function useData() {
  const queryClient = useQueryClient();
  const user = useStore(state => state.user);

  // Shifts Query
  const { data: shifts = [], isLoading: isLoadingShifts } = useQuery({
    queryKey: ['shifts', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('Não há usuário logado para buscar shifts');
        return [];
      }
      console.log('Buscando shifts para usuário:', user.id);
      const data = await api.getShifts(user.id);
      console.log('Shifts encontrados:', data?.length || 0);
      return (data || []).map(convertShiftDates);
    },
    enabled: !!user?.id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 30000
  });

  // Non-accounting Days Query
  const { data: nonAccountingDays = [], isLoading: isLoadingDays } = useQuery({
    queryKey: ['non_accounting_days', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('Não há usuário logado para buscar dias não contabilizados');
        return [];
      }
      console.log('Buscando dias não contabilizados para usuário:', user.id);
      const data = await api.getNonAccountingDays(user.id);
      console.log('Dias não contabilizados encontrados:', data?.length || 0);
      return (data || []).map(convertNonAccountingDayDates);
    },
    enabled: !!user?.id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 30000
  });

  // Add Shift Mutation
  const addShift = useMutation({
    mutationFn: async (shift: { startTime: Date; endTime: Date; description?: string; }) => {
      if (!user?.id) throw new Error('Usuário não encontrado');
      console.log('Adicionando shift:', shift);
      const result = await api.createShift(user.id, shift);
      console.log('Shift adicionado:', result);
      return convertShiftDates(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts', user?.id] });
    },
    onError: (error) => {
      console.error('Erro ao adicionar shift:', error);
      errorLogger.logError(error as Error, 'Data:addShift');
    }
  });

  // Add Non-accounting Day Mutation
  const addNonAccountingDay = useMutation({
    mutationFn: async (day: { date: Date; type: string; reason?: string; }) => {
      if (!user?.id) throw new Error('Usuário não encontrado');
      console.log('Adicionando dia não contabilizado:', day);
      const result = await api.createNonAccountingDay(user.id, day);
      console.log('Dia não contabilizado adicionado:', result);
      return convertNonAccountingDayDates(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['non_accounting_days', user?.id] });
    },
    onError: (error) => {
      console.error('Erro ao adicionar dia não contabilizado:', error);
      errorLogger.logError(error as Error, 'Data:addNonAccountingDay');
    }
  });

  return {
    shifts,
    nonAccountingDays,
    addShift: addShift.mutate,
    deleteShift: (id: string) => {
      console.log('Deletando shift:', id);
      return api.deleteShift(id).then(() => {
        queryClient.invalidateQueries({ queryKey: ['shifts', user?.id] });
      });
    },
    addNonAccountingDay: addNonAccountingDay.mutate,
    deleteNonAccountingDay: (id: string) => {
      console.log('Deletando dia não contabilizado:', id);
      return api.deleteNonAccountingDay(id).then(() => {
        queryClient.invalidateQueries({ queryKey: ['non_accounting_days', user?.id] });
      });
    },
    isLoading: isLoadingShifts || isLoadingDays
  };
}