import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { toast } from 'sonner'; // Import toastify
import { Card } from '../ui/card';
import { useData } from '../../hooks/useData';
import { formatMonthBR, formatHoursDuration } from '../../utils/dateUtils';
import { calculateMonthlyStats } from '../../utils/time/monthly';
import { errorLogger } from '../../utils/errorLog';
import { isSameMonth } from 'date-fns';

interface MonthListProps {
  currentDate: Date;
}

export function MonthList({ currentDate }: MonthListProps) {
  const navigate = useNavigate();
  const { shifts, nonAccountingDays } = useData();
  const currentYear = currentDate.getFullYear();
  const today = new Date();
  
  const months = Array.from({ length: 12 }, (_, i) => new Date(currentYear, i, 1));

  const handleMonthClick = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    console.log('=== MonthList Navigation Debug ===');
    console.log('Attempting to navigate from MonthList');
    console.log('Date:', date);
    console.log('Year:', year);
    console.log('Month:', month);
    console.log('Target URL:', `/month/${year}/${month}`);
    
    try {
      // Usar o navigate sem replace para permitir voltar
      navigate(`/month/${year}/${month}`);
      console.log('Navigation called successfully');
    } catch (error) {
      console.error('Navigation error:', error);
      // Adicionar toast para feedback visual
      toast.error('Erro ao navegar para o mês selecionado');
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
                <div className="p-2 sm:p-4">
                  <div className="flex justify-between items-center mb-2 sm:mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm sm:text-base text-slate-800">
                        {formatMonthBR(month)}
                      </span>
                      {isCurrentMonth && (
                        <span className="text-[10px] sm:text-xs bg-indigo-100 text-indigo-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                          Atual
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] sm:text-xs text-slate-500 block mb-0.5 sm:mb-1">Previstas</span>
                      <span className="text-xs sm:text-sm font-medium text-slate-800">
                        {formatHoursDuration(stats.minutes.expected)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] sm:text-xs text-slate-500 block mb-0.5 sm:mb-1">Trabalhadas</span>
                      <span className="text-xs sm:text-sm font-medium text-emerald-600">
                        {formatHoursDuration(stats.minutes.worked)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] sm:text-xs text-slate-500 block mb-0.5 sm:mb-1">Saldo</span>
                      <span className={`text-xs sm:text-sm font-medium ${
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