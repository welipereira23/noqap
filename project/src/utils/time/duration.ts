import { differenceInMinutes } from 'date-fns';
import { TIME_CONSTANTS } from './constants';
import { TimeRange, WorkingTime } from './types';

function calculateNightHours(start: Date, end: Date): number {
  let currentTime = new Date(start);
  let endTime = new Date(end);
  let nightMinutes = 0;

  // Ajuste para virada de dia
  if (endTime < currentTime) {
    endTime.setDate(endTime.getDate() + 1);
  }

  while (currentTime < endTime) {
    const hour = currentTime.getHours();
    if (hour >= TIME_CONSTANTS.NIGHT_SHIFT.START_HOUR || hour < TIME_CONSTANTS.NIGHT_SHIFT.END_HOUR) {
      nightMinutes++;
    }
    currentTime.setMinutes(currentTime.getMinutes() + 1);
  }

  // Retorna apenas horas completas
  return Math.floor(nightMinutes / 60);
}

export function calculateDuration(range: TimeRange): WorkingTime {
  // Calcula minutos base
  let baseMinutes = differenceInMinutes(range.end, range.start);
  
  // Ajuste para virada de dia
  if (baseMinutes < 0) {
    baseMinutes += 24 * 60;
  }

  // Calcula horas noturnas completas
  const nightHours = calculateNightHours(range.start, range.end);
  
  // Calcula adicional noturno (10min por hora noturna)
  const nightBonus = nightHours * TIME_CONSTANTS.NIGHT_SHIFT.BONUS_MINUTES_PER_HOUR;

  return {
    baseMinutes,
    nightHours,
    nightBonus,
    totalMinutes: baseMinutes + nightBonus
  };
}