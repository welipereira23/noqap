import { startOfQuarter, endOfQuarter, isWithinInterval, eachMonthOfInterval } from 'date-fns';
import { Shift, NonAccountingDay } from '../../types';
import { calculateMonthlyStats } from './monthly';

interface PeriodRange {
  start: Date;
  end: Date;
  shifts: Shift[];
  nonAccountingDays: NonAccountingDay[];
}

interface PeriodStats {
  days: {
    total: number;
    nonAccounting: number;
    effective: number;
  };
  minutes: {
    expected: number;
    worked: number;
    balance: number;
  };
}

export function calculatePeriodStats(period: PeriodRange): PeriodStats {
  // Filtra shifts e dias não contábeis do período primeiro
  const periodShifts = period.shifts.filter(shift => 
    isWithinInterval(shift.startTime, period)
  );
  
  const periodNonAccountingDays = period.nonAccountingDays.filter(day => 
    isWithinInterval(day.date, period)
  );

  // Pega todos os meses do período
  const months = eachMonthOfInterval(period);
  
  // Calcula estatísticas para cada mês com os dados filtrados
  const monthlyStats = months.map(month => 
    calculateMonthlyStats(
      month,
      periodShifts,
      periodNonAccountingDays
    )
  );
  
  // Soma os totais
  return monthlyStats.reduce((acc, stats) => ({
    days: {
      total: acc.days.total + stats.days.total,
      nonAccounting: acc.days.nonAccounting + stats.days.nonAccounting,
      effective: acc.days.effective + stats.days.effective
    },
    minutes: {
      expected: acc.minutes.expected + stats.minutes.expected,
      worked: acc.minutes.worked + stats.minutes.worked,
      balance: acc.minutes.balance + stats.minutes.balance
    }
  }), {
    days: { total: 0, nonAccounting: 0, effective: 0 },
    minutes: { expected: 0, worked: 0, balance: 0 }
  });
}