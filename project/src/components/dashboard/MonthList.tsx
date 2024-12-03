import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Card } from '../ui/card';
import { useStore } from '../../store/useStore';
import { formatMonthBR, formatHoursDuration } from '../../utils/dateUtils';
import { calculateMonthlyStats } from '../../utils/time/monthly';
import { errorLogger } from '../../utils/errorLog';
import { isSameMonth } from 'date-fns';

interface MonthListProps {
  currentDate: Date;
}

export function MonthList({ currentDate }: MonthListProps) {
  const navigate = useNavigate();
  const { shifts, nonAccountingDays } = useStore();
  const currentYear = currentDate.getFullYear();
  const today = new Date();
  
  const months = Array.from({ length: 12 }, (_, i) => new Date(currentYear, i, 1));

  const handleMonthClick = (date: Date) => {
    console.log('=== MonthList Navigation Debug ===');
    console.log('Attempting to navigate from MonthList');
    console.log('Current Date:', date);
    console.log('Year:', date.getFullYear());
    console.log('Month:', date.getMonth() + 1);
    console.log('Current Location:', window.location.pathname);
    console.log('Target URL:', `/month/${date.getFullYear()}/${date.getMonth() + 1}`);
    
    try {
      navigate(`/month/${date.getFullYear()}/${date.getMonth() + 1}`, { replace: true });
      console.log('Navigation called successfully');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Meses</h2>
      
      <div className="space-y-3">
        {months.map((month) => {
          try {
            const stats = calculateMonthlyStats(month, shifts, nonAccountingDays);
            const isCurrentMonth = isSameMonth(month, today);

            return (
              <Card 
                key={month.toISOString()}
                onClick={() => handleMonthClick(month)}
                className={`overflow-hidden transition-all hover:shadow-md cursor-pointer
                  ${isCurrentMonth ? 'border-l-4 border-l-indigo-500' : 'opacity-80'}
                `}
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">
                        {formatMonthBR(month)}
                      </span>
                      {isCurrentMonth && (
                        <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
                          Atual
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${
                          stats.minutes.worked === 0 
                            ? 'bg-slate-200' 
                            : 'bg-emerald-500'
                        }`} />
                        <span className="text-sm font-medium text-slate-600">
                          {formatHoursDuration(stats.minutes.expected)}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-xs text-slate-500 block mb-1">Previstas</span>
                      <span className="text-sm font-medium text-slate-800">
                        {formatHoursDuration(stats.minutes.expected)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block mb-1">Trabalhadas</span>
                      <span className="text-sm font-medium text-emerald-600">
                        {formatHoursDuration(stats.minutes.worked)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block mb-1">Saldo</span>
                      <span className={`text-sm font-medium ${
                        stats.minutes.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {formatHoursDuration(stats.minutes.balance)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          } catch (error) {
            errorLogger.logError(error as Error, 'MonthList');
            return null;
          }
        })}
      </div>
    </div>
  );
}