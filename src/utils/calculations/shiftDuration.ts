import { differenceInMinutes } from 'date-fns';
import { calculateNightMinutes } from './nightShift';
import { TIME_CONSTANTS } from './constants';

export function calculateShiftDuration(startTime: Date, endTime: Date): number {
  // Calcula duração base em minutos
  let baseMinutes = differenceInMinutes(endTime, startTime);
  
  // Ajuste para virada de dia
  if (baseMinutes < 0) {
    baseMinutes += 24 * TIME_CONSTANTS.WORKDAY.MINUTES_PER_HOUR;
  }

  // Calcula e adiciona o adicional noturno
  const nightBonus = calculateNightMinutes(startTime, endTime);
  
  return baseMinutes + nightBonus;
}