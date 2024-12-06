import { isWithinInterval, eachDayOfInterval, isWeekend } from 'date-fns';
import { Shift, NonAccountingDay } from '../../types';
import { TIME_CONSTANTS } from './constants';
import { calculateShiftDuration } from './shiftDuration';

export function calculatePeriodStats(
  shifts: Shift[],
  nonAccountingDays: NonAccountingDay[],
  start: Date,
  end: Date
) {
  // Calcula dias do período
  const allDays = eachDayOfInterval({ start, end });
  const totalDays = allDays.length;
  const workingDays = allDays.filter(day => !isWeekend(day)).length;
  
  // Dias não contábeis no período
  const nonAccountingDaysInPeriod = nonAccountingDays.filter(day => {
    const dayStart = day.startDate;
    const dayEnd = day.endDate;
    
    // Verifica se há sobreposição entre os períodos
    return (
      isWithinInterval(dayStart, { start, end }) ||
      isWithinInterval(dayEnd, { start, end }) ||
      (dayStart <= start && dayEnd >= end)
    );
  });

  // Calcula dias totais não contábeis considerando períodos
  const nonAccountingDaysCount = nonAccountingDaysInPeriod.reduce((total, day) => {
    const dayStart = day.startDate > start ? day.startDate : start;
    const dayEnd = day.endDate < end ? day.endDate : end;
    
    // Pega os dias do período
    const daysInRange = eachDayOfInterval({ start: dayStart, end: dayEnd });
    
    // Conta apenas dias úteis
    return total + daysInRange.filter(d => !isWeekend(d)).length;
  }, 0);

  // Dias efetivos
  const effectiveWorkDays = workingDays - nonAccountingDaysCount;

  // Minutos esperados
  const expectedMinutes = effectiveWorkDays * 
    TIME_CONSTANTS.WORKDAY.HOURS_PER_DAY * 
    TIME_CONSTANTS.WORKDAY.MINUTES_PER_HOUR;

  // Minutos trabalhados
  const periodShifts = shifts.filter(shift => 
    isWithinInterval(shift.startTime, { start, end })
  );

  const workedMinutes = periodShifts.reduce((total, shift) => {
    return total + calculateShiftDuration(shift.startTime, shift.endTime);
  }, 0);

  return {
    totalDays,
    workingDays,
    nonAccountingDaysCount,
    effectiveWorkDays,
    expectedMinutes,
    workedMinutes,
    balance: workedMinutes - expectedMinutes
  };
}