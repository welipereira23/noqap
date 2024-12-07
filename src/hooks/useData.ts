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
  // Ajusta o fuso horário para meia-noite no horário local
  const date = new Date(day.date + 'T12:00:00');
  
  console.log('[useData] Convertendo data:', {
    original: day.date,
    converted: date,
    iso: date.toISOString()
  });
  
  return {
    ...day,
    date,
    userId: day.user_id,
    createdAt: new Date(day.created_at),
    updatedAt: new Date(day.updated_at)
  };
}

export function useData() {
  const queryClient = useQueryClient();
  const user = useStore(state => state.user);
  const currentYear = useStore(state => state.currentDate?.getFullYear());

  // Shifts Query
  const { data: shifts = [], isLoading: isLoadingShifts } = useQuery({
    queryKey: ['shifts', user?.id, currentYear],
    queryFn: async () => {
      if (!user?.id) {
        console.log('Não há usuário logado para buscar shifts');
        return [];
      }
      console.log('Buscando shifts para usuário:', user.id, 'ano:', currentYear);
      const data = await api.getShifts(user.id, currentYear);
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

      console.log('[useData] Buscando dias não contábeis para usuário:', user.id);

      const { data, error } = await supabase
        .from('non_accounting_days')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('[useData] Erro ao buscar dias não contábeis:', error);
        throw error;
      }

      console.log('[useData] Dias não contábeis encontrados:', data);

      if (!data) {
        return [];
      }

      const convertedData = data.map(convertNonAccountingDayDates);

      console.log('[useData] Dados convertidos:', convertedData);

      return convertedData;
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
      queryClient.invalidateQueries({ queryKey: ['shifts', user?.id, currentYear] });
    },
    onError: (error) => {
      console.error('Erro ao adicionar shift:', error);
      errorLogger.logError(error as Error, 'Data:addShift');
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
        const mapType = (type: NonAccountingDayType) => {
          const typeMap: Record<NonAccountingDayType, string> = {
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

  return {
    shifts,
    nonAccountingDays,
    addShift: addShift.mutate,
    deleteShift: (id: string) => {
      console.log('Deletando shift:', id);
      return api.deleteShift(id).then(() => {
        queryClient.invalidateQueries({ queryKey: ['shifts', user?.id, currentYear] });
      });
    },
    addNonAccountingDay: addNonAccountingDayMutation.mutate,
    deleteNonAccountingDay: (id: string) => {
      console.log('Deletando dia não contabilizado:', id);
      return api.deleteNonAccountingDay(id).then(() => {
        queryClient.invalidateQueries({ queryKey: ['non-accounting-days', user?.id] });
      });
    },
    isLoading: isLoadingShifts || isLoadingDays
  };
}