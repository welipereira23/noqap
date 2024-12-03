import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Shift, NonAccountingDay } from '../types';
import { calculatePeriodStats } from './calculations';

export function formatDateBR(date: Date): string {
  return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatMonthBR(date: Date): string {
  return format(date, "MMMM 'de' yyyy", { locale: ptBR });
}

export function formatQuarterBR(date: Date): string {
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `${quarter}º Trimestre de ${date.getFullYear()}`;
}

export function formatHoursDuration(minutes: number): string {
  if (isNaN(minutes)) return '0h';
  
  const absMinutes = Math.abs(minutes);
  const hours = Math.floor(absMinutes / 60);
  const remainingMinutes = Math.round(absMinutes % 60);
  
  let result = `${hours}h`;
  if (remainingMinutes > 0) {
    result += `${remainingMinutes}min`;
  }
  
  return minutes < 0 ? `-${result}` : result;
}

export function calculatePeriodHours(
  shifts: Shift[],
  nonAccountingDays: NonAccountingDay[],
  start: Date,
  end: Date
) {
  return calculatePeriodStats(shifts, nonAccountingDays, start, end);
}