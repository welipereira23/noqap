import { differenceInMinutes, getDaysInMonth, isWeekend, eachDayOfInterval, isSameMonth, startOfMonth, endOfMonth } from 'date-fns';
import { Shift, NonAccountingDay } from '../../types';
import { calculateShiftDuration } from './shiftDuration';

const MONTHLY_CONFIG = {
  BASE_HOURS: 160, // Base fixa de 160 horas mensais
  MINUTES_PER_HOUR: 60
};

interface MonthlyStats {
  totalDays: number;
  workingDays: number;
  nonAccountingDays: number;
  expectedMinutes: number;
  workedMinutes: number;
  balance: number;
}

export function calculateMonthlyStats(
  date: Date,
  shifts: Shift[],
  nonAccountingDays: NonAccountingDay[]
): MonthlyStats {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  
  // Total de dias no mês
  const totalDays = getDaysInMonth(date);
  
  // Calcula dias úteis (excluindo finais de semana)
  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const workingDays = allDays.filter(day => !isWeekend(day)).length;

  // Filtra dias não contábeis do mês atual
  const monthNonAccountingDays = nonAccountingDays.filter(day => 
    isSameMonth(day.date, date)
  ).length;

  // Calcula dias efetivos de trabalho
  const effectiveWorkDays = workingDays - monthNonAccountingDays;

  // Calcula horas esperadas usando a fórmula: (160 / dias no mês) × dias a trabalhar
  const expectedHours = (MONTHLY_CONFIG.BASE_HOURS / totalDays) * effectiveWorkDays;
  
  // Converte horas esperadas para minutos
  const expectedMinutes = Math.round(expectedHours * MONTHLY_CONFIG.MINUTES_PER_HOUR);

  // Calcula minutos trabalhados incluindo adicional noturno
  const monthShifts = shifts.filter(shift => isSameMonth(shift.startTime, date));
  const workedMinutes = monthShifts.reduce((total, shift) => {
    return total + calculateShiftDuration(shift.startTime, shift.endTime);
  }, 0);

  return {
    totalDays,
    workingDays,
    nonAccountingDays: monthNonAccountingDays,
    expectedMinutes,
    workedMinutes,
    balance: workedMinutes - expectedMinutes
  };
}