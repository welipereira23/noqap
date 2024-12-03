import { eachDayOfInterval, isWeekend, isWithinInterval } from 'date-fns';
import { NonAccountingDay } from '../../types';
import { TimeRange } from './types';

export interface WorkdaysResult {
  total: number;
  working: number;
  nonAccounting: number;
  effective: number;
}

export function calculateWorkdays(range: TimeRange, nonAccountingDays: NonAccountingDay[]): WorkdaysResult {
  const days = eachDayOfInterval(range);
  
  const total = days.length;
  const working = days.filter(day => !isWeekend(day)).length;
  
  const nonAccounting = nonAccountingDays.filter(day => 
    isWithinInterval(day.date, range)
  ).length;

  return {
    total,
    working,
    nonAccounting,
    effective: working - nonAccounting
  };
}