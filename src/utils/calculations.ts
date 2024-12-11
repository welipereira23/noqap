import { differenceInMinutes, isWithinInterval, startOfMonth, endOfMonth, getDaysInMonth, isWeekend, eachDayOfInterval } from 'date-fns';
import { Shift, NonAccountingDay } from '../types';

const TIME_CONSTANTS = {
  WORKDAY: {
    HOURS: 8,
    MINUTES: 8 * 60,
    BASE_MONTHLY_HOURS: 160
  },
  NIGHT_SHIFT: {
    START_HOUR: 22,
    END_HOUR: 5,
    BONUS_PERCENTAGE: 0.2 // 20%
  }
};

export function calculateShiftDuration(startTime: Date, endTime: Date): number {
  let baseMinutes = differenceInMinutes(endTime, startTime);
  
  // Ajuste para virada de dia
  if (baseMinutes < 0) {
    baseMinutes += 24 * 60;
  }

  // Calcula minutos noturnos
  const nightMinutes = calculateNightMinutes(startTime, endTime);
  
  return baseMinutes + calculateNightShiftBonus(nightMinutes);
}

export function calculateNightMinutes(startTime: Date, endTime: Date): number {
  let currentTime = new Date(startTime);
  let endTimeAdjusted = new Date(endTime);
  let nightMinutes = 0;

  // Ajuste para virada de dia
  if (endTimeAdjusted < currentTime) {
    endTimeAdjusted.setDate(endTimeAdjusted.getDate() + 1);
  }

  while (currentTime < endTimeAdjusted) {
    const hour = currentTime.getHours();
    if (hour >= TIME_CONSTANTS.NIGHT_SHIFT.START_HOUR || hour < TIME_CONSTANTS.NIGHT_SHIFT.END_HOUR) {
      nightMinutes++;
    }
    currentTime.setMinutes(currentTime.getMinutes() + 1);
  }

  // Retorna os minutos noturnos reais, sem aplicar o adicional
  return nightMinutes;
}

// Nova função para calcular o adicional noturno (usado internamente)
export function calculateNightShiftBonus(nightMinutes: number): number {
  return Math.floor(nightMinutes * TIME_CONSTANTS.NIGHT_SHIFT.BONUS_PERCENTAGE);
}

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
  const nonAccountingDaysCount = nonAccountingDays.filter(day => 
    isWithinInterval(day.date, { start, end })
  ).length;

  // Dias efetivos
  const effectiveWorkDays = workingDays - nonAccountingDaysCount;

  // Minutos esperados
  const expectedMinutes = effectiveWorkDays * TIME_CONSTANTS.WORKDAY.MINUTES;

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
    expectedMinutes,
    workedMinutes,
    balance: workedMinutes - expectedMinutes
  };
}