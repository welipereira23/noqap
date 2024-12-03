import { differenceInMinutes } from 'date-fns';
import { TIME_CONSTANTS } from './constants';

export function calculateNightMinutes(startTime: Date, endTime: Date): number {
  let currentTime = new Date(startTime);
  let endTimeAdjusted = new Date(endTime);
  let nightMinutes = 0;

  // Ajuste para virada de dia
  if (endTimeAdjusted < currentTime) {
    endTimeAdjusted.setDate(endTimeAdjusted.getDate() + 1);
  }

  // Contagem minuto a minuto do período noturno
  while (currentTime < endTimeAdjusted) {
    const hour = currentTime.getHours();
    
    // Verifica se está no período noturno (22h-5h)
    if (hour >= TIME_CONSTANTS.NIGHT_SHIFT.START_HOUR || hour < TIME_CONSTANTS.NIGHT_SHIFT.END_HOUR) {
      nightMinutes++;
    }
    
    currentTime.setMinutes(currentTime.getMinutes() + 1);
  }

  // Calcula o adicional noturno
  return Math.floor(nightMinutes * TIME_CONSTANTS.NIGHT_SHIFT.BONUS_PERCENTAGE);
}