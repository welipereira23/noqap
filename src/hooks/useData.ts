import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '../store/useStore';
import { errorLogger } from '../utils/errorLog';
import * as api from '../lib/api';
import { Shift, NonAccountingDay, NonAccountingDayType } from '../types';
import { supabase } from '../lib/supabase';
import { toast } from '../utils/toast';

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
    queryKey: ['non-accounting-days', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('non_accounting_days')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      return data.map(day => ({
        id: day.id,
        startDate: new Date(day.start_date),
        endDate: new Date(day.end_date),
        type: day.type as NonAccountingDayType,
        reason: day.reason || undefined,
        userId: day.user_id
      }));
    },
    enabled: !!user?.id
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
  const addNonAccountingDay = async (data: Omit<NonAccountingDay, 'id' | 'userId'>) => {
    try {
      const { error } = await supabase
        .from('non_accounting_days')
        .insert([
          {
            start_date: data.startDate,
            end_date: data.endDate,
            type: data.type,
            reason: data.reason,
            user_id: user?.id
          }
        ]);

      if (error) throw error;

      // Revalidar os dados
      queryClient.invalidateQueries({ queryKey: ['non-accounting-days'] });
      toast.success('Período registrado com sucesso!');
    } catch (error) {
      console.error('Error adding non-accounting day:', error);
      toast.error('Erro ao registrar período');
    }
  };

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
    addNonAccountingDay,
    deleteNonAccountingDay: (id: string) => {
      console.log('Deletando dia não contabilizado:', id);
      return api.deleteNonAccountingDay(id).then(() => {
        queryClient.invalidateQueries({ queryKey: ['non-accounting_days', user?.id] });
      });
    },
    isLoading: isLoadingShifts || isLoadingDays
  };
}