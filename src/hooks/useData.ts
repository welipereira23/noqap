import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '../store/useStore';
import { errorLogger } from '../utils/errorLog';
import * as api from '../lib/api';
import { Shift, NonAccountingDay } from '../types';
import { supabase } from '../lib/supabase';
import { toast } from '../utils/toast';
import { useNavigate } from 'react-router-dom';

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
  // Ajusta o fuso horário para meia-noite no horário local
  const date = new Date(day.date + 'T12:00:00');
  
  return {
    ...day,
    date,
    userId: day.user_id,
    createdAt: new Date(day.created_at),
    updatedAt: new Date(day.updated_at)
  };
}

// Função para verificar se o usuário está bloqueado
const checkBlockStatus = async (user: any) => {
  if (!user) return;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('is_blocked')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    if (data?.is_blocked) {
      // Se estiver bloqueado, fazer logout
      await supabase.auth.signOut();
      return true;
    }

    return false;
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    return false;
  }
};

export function useData() {
  const queryClient = useQueryClient();
  const user = useStore(state => state.user);
  const currentYear = useStore(state => state.currentDate.getFullYear());
  const setShifts = useStore(state => state.setShifts);
  const setNonAccountingDays = useStore(state => state.setNonAccountingDays);
  const navigate = useNavigate();

  // Shifts Query
  const { data: shifts = [], isLoading: isLoadingShifts, error: shiftsError } = useQuery({
    queryKey: ['shifts', user?.id, currentYear],
    queryFn: async () => {
      if (!user?.id) {
        console.log('[useData] Não há usuário logado para buscar shifts');
        return [];
      }
      
      try {
        console.log('[useData] Buscando shifts para usuário:', user.id, 'ano:', currentYear);
        const data = await api.getShifts(user.id, currentYear);
        console.log('[useData] Shifts encontrados:', data?.length || 0);
        
        if (!data) {
          console.warn('[useData] Nenhum dado retornado da API');
          return [];
        }
        
        const convertedShifts = data.map(convertShiftDates);
        setShifts(convertedShifts); // Atualiza o store
        return convertedShifts;
      } catch (error) {
        console.error('[useData] Erro ao buscar shifts:', error);
        errorLogger.logError(error as Error, 'useData:getShifts');
        return [];
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Non-accounting Days Query
  const { data: nonAccountingDays = [], isLoading: isLoadingDays, error: daysError } = useQuery({
    queryKey: ['non-accounting-days', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      try {
        console.log('[useData] Buscando dias não contábeis para usuário:', user.id);
        const { data, error } = await supabase
          .from('non_accounting_days')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        if (!data) {
          console.warn('[useData] Nenhum dia não contábil encontrado');
          return [];
        }

        const convertedDays = data.map(convertNonAccountingDayDates);
        setNonAccountingDays(convertedDays); // Atualiza o store
        return convertedDays;
      } catch (error) {
        console.error('[useData] Erro ao buscar dias não contábeis:', error);
        errorLogger.logError(error as Error, 'useData:getNonAccountingDays');
        return [];
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Add Shift Mutation
  const addShiftMutation = useMutation({
    mutationFn: async (data: Omit<Shift, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      if (!user?.id) throw new Error('Usuário não encontrado');
      
      try {
        const result = await api.createShift(user.id, {
          startTime: data.startTime,
          endTime: data.endTime,
          description: data.description
        });
        return result;
      } catch (error) {
        console.error('Erro ao adicionar shift:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Invalidar a query para o ano do shift adicionado
      const shiftYear = variables.startTime.getFullYear();
      queryClient.invalidateQueries({ queryKey: ['shifts', user?.id, shiftYear] });
      // Removido o toast.success daqui pois já está no componente
    },
    onError: (error) => {
      console.error('[useData] Erro ao adicionar shift:', error);
      errorLogger.logError(error as Error, 'Data:addShift');
      // Removido o toast.error daqui pois já está no componente
    }
  });

  // Add Non-accounting Day Mutation
  const addNonAccountingDayMutation = useMutation({
    mutationFn: async (data: Omit<NonAccountingDay, 'id' | 'userId'>) => {
      if (!user?.id) {
        throw new Error('Usuário não encontrado');
      }

      try {
        // [DEBUG] Log dos dados recebidos
        console.log('[useData] Dados recebidos:', {
          startDate: data.startDate,
          endDate: data.endDate,
          type: data.type,
          reason: data.reason,
          userId: user.id
        });

        // Mapear o tipo para o formato do banco
        const mapType = (type: NonAccountingDay['type']) => {
          const typeMap: Record<NonAccountingDay['type'], string> = {
            'Férias': 'FERIAS',
            'Licença Médica': 'LICENCA_MEDICA',
            'Licença Maternidade': 'LICENCA_MATERNIDADE',
            'Licença Paternidade': 'LICENCA_PATERNIDADE',
            'Dispensa Luto': 'LUTO',
            'Núpcias': 'NUPCIAL',
            'Outros': 'OUTROS'
          };
          return typeMap[type];
        };

        // Criar array de datas para o período
        const dates: string[] = [];
        const start = data.startDate.toISOString().split('T')[0];
        const end = data.endDate.toISOString().split('T')[0];

        // [DEBUG] Log das datas
        console.log('[useData] Datas:', { start, end });

        // Gerar datas
        const currentDate = new Date(start);
        const endDate = new Date(end);
        
        while (currentDate <= endDate) {
          dates.push(currentDate.toISOString().split('T')[0]);
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // [DEBUG] Log das datas geradas
        console.log('[useData] Total de datas geradas:', dates.length);
        console.log('[useData] Lista de datas:', dates);

        // Preparar dados para inserção
        const insertData = dates.map(date => ({
          date,
          type: mapType(data.type),
          reason: data.reason || null,
          user_id: user.id
        }));

        // Tentar inserção um por um para identificar qual falha
        for (const record of insertData) {
          console.log('[useData] Tentando inserir registro:', record);
          
          const { data: insertedData, error } = await supabase
            .from('non_accounting_days')
            .insert(record)
            .select();

          console.log('[useData] Resposta do Supabase:', { insertedData, error });

          if (error) {
            console.error('[useData] Erro ao inserir registro:', error);
            throw error;
          }

          if (!insertedData || insertedData.length === 0) {
            console.error('[useData] Nenhum dado retornado após inserção');
            throw new Error('Nenhum dado retornado após inserção');
          }
        }

        // Buscar todos os registros inseridos
        const { data: insertedData, error: selectError } = await supabase
          .from('non_accounting_days')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', dates[0])
          .lte('date', dates[dates.length - 1]);

        console.log('[useData] Dados inseridos recuperados:', insertedData);

        if (selectError) {
          console.error('[useData] Erro ao buscar registros inseridos:', selectError);
          throw selectError;
        }

        return insertedData;
      } catch (error: any) {
        // [DEBUG] Log detalhado do erro
        console.error('[useData] Erro detalhado:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('[useData] Mutation concluída com sucesso. Registros:', data);
      queryClient.invalidateQueries({ queryKey: ['non-accounting-days', user?.id] });
    },
    onError: (error: Error) => {
      console.error('[useData] Erro na mutation:', error);
    }
  });

  // Delete Shift Mutation
  const deleteShiftMutation = useMutation({
    mutationFn: async (shiftId: string) => {
      try {
        await api.deleteShift(shiftId);
      } catch (error) {
        console.error('Erro ao deletar shift:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success('Turno removido com sucesso');
    },
    onError: (error) => {
      console.error('[useData] Erro ao deletar shift:', error);
      errorLogger.logError(error as Error, 'Data:deleteShift');
      toast.error('Erro ao remover turno');
    }
  });

  // Delete Non-Accounting Day Mutation
  const deleteNonAccountingDayMutation = useMutation({
    mutationFn: async (dayId: string) => {
      if (!user?.id) throw new Error('Usuário não encontrado');
      console.log('[useData] Deletando dia não contábil:', dayId);
      
      try {
        await api.deleteNonAccountingDay(dayId);
        console.log('[useData] Dia não contábil deletado com sucesso');
      } catch (error) {
        console.error('[useData] Erro ao deletar dia não contábil:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['non-accounting-days', user?.id] });
      toast.success('Dia não contábil removido com sucesso');
    },
    onError: (error) => {
      console.error('[useData] Erro ao deletar dia não contábil:', error);
      errorLogger.logError(error as Error, 'Data:deleteNonAccountingDay');
      toast.error('Erro ao remover dia não contábil');
    }
  });

  return {
    shifts,
    isLoadingShifts,
    shiftsError,
    nonAccountingDays,
    isLoadingDays,
    daysError,
    addShift: addShiftMutation.mutateAsync,
    deleteShift: deleteShiftMutation.mutateAsync,
    addNonAccountingDay: addNonAccountingDayMutation.mutateAsync,
    deleteNonAccountingDay: deleteNonAccountingDayMutation.mutateAsync
  };
}