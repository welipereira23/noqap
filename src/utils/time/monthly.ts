import { startOfMonth, endOfMonth, getDaysInMonth, isWithinInterval } from 'date-fns';
import { Shift, NonAccountingDay } from '../../types';
import { MonthlyStats } from '../../types/stats';
import { TIME_CONSTANTS } from './constants';
import { calculateDuration } from './duration';

export function calculateMonthlyStats(
  currentDate: Date,
  shifts: Shift[],
  nonAccountingDays: NonAccountingDay[]
): MonthlyStats {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Total de dias no mês
  const totalDays = getDaysInMonth(currentDate);
  
  // Dias não contábeis no mês
  const nonAccountingCount = nonAccountingDays.filter(day => 
    isWithinInterval(day.date, { start: monthStart, end: monthEnd })
  ).length;

  // Dias efetivos = total - não contábeis
  const effectiveDays = totalDays - nonAccountingCount;

  // Minutos esperados = (160h × 60min) ÷ dias no mês × dias efetivos
  const expectedMinutes = Math.round(
    (TIME_CONSTANTS.WORKDAY.BASE_MONTHLY_HOURS * TIME_CONSTANTS.WORKDAY.MINUTES_PER_HOUR / totalDays) 
    * effectiveDays
  );

  // Calcula minutos trabalhados incluindo adicional noturno
  const monthShifts = shifts.filter(shift => 
    isWithinInterval(shift.startTime, { start: monthStart, end: monthEnd })
  );

  const workedMinutes = monthShifts.reduce((total, shift) => {
    const duration = calculateDuration({
      start: shift.startTime,
      end: shift.endTime
    });
    return total + duration.totalMinutes;
  }, 0);

  return {
    days: {
      total: totalDays,
      nonAccounting: nonAccountingCount,
      effective: effectiveDays
    },
    minutes: {
      expected: expectedMinutes,
      worked: workedMinutes,
      balance: workedMinutes - expectedMinutes
    }
  };
}