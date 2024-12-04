import { getDaysInMonth, isWeekend, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { NonAccountingDay } from '../../types';

export function calculateWorkingDays(start: Date, end: Date, nonAccountingDays: NonAccountingDay[]) {
  // Total de dias no período
  const allDays = eachDayOfInterval({ start, end });
  
  // Dias úteis (excluindo finais de semana)
  const workingDays = allDays.filter(day => !isWeekend(day)).length;

  // Dias não contábeis no período
  const nonAccountingDaysCount = nonAccountingDays.filter(day => 
    isWithinInterval(day.date, { start, end })
  ).length;

  // Dias efetivos de trabalho
  const effectiveWorkDays = workingDays - nonAccountingDaysCount;

  return {
    totalDays: allDays.length,
    workingDays,
    nonAccountingDaysCount,
    effectiveWorkDays
  };
}