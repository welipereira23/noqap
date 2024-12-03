import { isWithinInterval } from 'date-fns';
import { Shift, NonAccountingDay } from '../../types';
import { calculateShiftDuration } from './shiftDuration';
import { calculateWorkingDays } from './workingDays';
import { TIME_CONSTANTS } from './constants';

export function calculatePeriodStats(
  shifts: Shift[],
  nonAccountingDays: NonAccountingDay[],
  start: Date,
  end: Date
) {
  // Calcula dias do período
  const days = calculateWorkingDays(start, end, nonAccountingDays);

  // Calcula minutos esperados
  const expectedMinutes = days.effectiveWorkDays * 
    TIME_CONSTANTS.WORKDAY.HOURS_PER_DAY * 
    TIME_CONSTANTS.WORKDAY.MINUTES_PER_HOUR;

  // Filtra e calcula minutos trabalhados no período
  const periodShifts = shifts.filter(shift => 
    isWithinInterval(shift.startTime, { start, end })
  );

  const workedMinutes = periodShifts.reduce((total, shift) => {
    return total + calculateShiftDuration(shift.startTime, shift.endTime);
  }, 0);

  return {
    ...days,
    expectedMinutes,
    workedMinutes,
    balance: workedMinutes - expectedMinutes
  };
}