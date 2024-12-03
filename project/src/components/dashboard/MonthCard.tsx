import React from 'react';
import { CalendarDays } from 'lucide-react';
import { formatMonthBR, formatHoursDuration } from '../../utils/dateUtils';
import { calculateMonthlyStats } from '../../utils/time/monthly';
import { useStore } from '../../store/useStore';

interface MonthCardProps {
  date: Date;
  onClick?: () => void;
}

export function MonthCard({ date, onClick }: MonthCardProps) {
  const { shifts, nonAccountingDays } = useStore();
  const stats = calculateMonthlyStats(date, shifts, nonAccountingDays);

  return (
    <div
      onClick={(e) => {
        console.log('=== MonthCard Click Debug ===');
        console.log('Card clicked');
        console.log('Date:', date);
        console.log('Has onClick handler:', !!onClick);
        if (onClick) {
          console.log('Calling onClick handler');
          onClick(e);
        }
      }}
      className={`
        bg-white rounded-xl shadow-sm hover:shadow-md
        transition-all duration-200 border border-neutral-100
        hover:border-neutral-200 p-6
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <CalendarDays className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {formatMonthBR(date)}
          </h3>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-baseline">
          <p className="text-sm text-neutral-500">Horas Trabalhadas</p>
          <p className="text-sm font-medium text-gray-900">
            {formatHoursDuration(stats.minutes.worked)}
          </p>
        </div>

        <div className="flex justify-between items-baseline">
          <p className="text-sm text-neutral-500">Horas Esperadas</p>
          <p className="text-sm font-medium text-gray-900">
            {formatHoursDuration(stats.minutes.expected)}
          </p>
        </div>

        <div className="flex justify-between items-baseline">
          <p className="text-sm text-neutral-500">Saldo</p>
          <p className={`text-sm font-medium ${
            stats.minutes.balance >= 0 ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {stats.minutes.balance >= 0 ? '+' : ''}{formatHoursDuration(stats.minutes.balance)}
          </p>
        </div>

        <div className="pt-3 border-t border-neutral-100">
          <div className="flex justify-between text-xs text-neutral-500">
            <span>{stats.days.total} dias no mês</span>
            {stats.days.nonAccounting > 0 && (
              <span>
                {stats.days.nonAccounting} {stats.days.nonAccounting === 1 
                  ? 'dia não contábil' 
                  : 'dias não contábeis'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}