import { startOfMonth, endOfMonth, getDaysInMonth, isWithinInterval } from 'date-fns';
import { Shift, NonAccountingDay } from '../../types';
import { TIME_CONSTANTS } from './constants';
import { calculateDuration } from './duration';

interface MonthlyStats {
  days: {
    total: number;          // Total de dias no mês
    nonAccounting: number;  // Dias não contábeis
    effective: number;      // Dias efetivos (total - não contábeis)
  };
  minutes: {
    expected: number;  // Minutos esperados
    worked: number;    // Minutos trabalhados
    balance: number;   // Saldo (trabalhado - esperado)
  };
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