import React from 'react';
import { ChevronDown, Calendar, Clock } from 'lucide-react';
import { addMonths, startOfQuarter, endOfQuarter } from 'date-fns';
import { Card, CardContent } from '../ui/card';
import { formatQuarterBR, formatHoursDuration } from '../../utils/dateUtils';
import { useStore } from '../../store/useStore';
import { calculatePeriodStats } from '../../utils/time/period';
import { errorLogger } from '../../utils/errorLog';

interface QuarterStatsProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function QuarterStats({ currentDate, onDateChange }: QuarterStatsProps) {
  const { shifts, nonAccountingDays } = useStore();
  
  const quarterStart = startOfQuarter(currentDate);
  const quarterEnd = endOfQuarter(currentDate);
  const currentQuarter = Math.floor(currentDate.getMonth() / 3) + 1;

  try {
    const stats = calculatePeriodStats({
      start: quarterStart,
      end: quarterEnd,
      shifts,
      nonAccountingDays
    });

    return (
      <Card 
        className="bg-white shadow-lg rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
      >
        {/* Period Selector */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-500">Período atual</p>
              <div className="flex items-center gap-2 font-semibold">
                <span className="text-xl text-slate-800">{currentDate.getFullYear()}</span>
                <ChevronDown className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((quarter) => {
                const isActive = Math.floor(currentDate.getMonth() / 3) + 1 === quarter;
                return (
                  <button
                    key={quarter}
                    onClick={() => {
                      const newDate = new Date(currentDate.getFullYear(), (quarter - 1) * 3, 1);
                      onDateChange(newDate);
                    }}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isActive
                        ? 'bg-slate-800 text-white font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {quarter}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <CardContent className="p-2">
          <div className="flex justify-between gap-2">
            {/* Expected Hours */}
            <div className="bg-indigo-500 rounded-lg p-2 text-white flex-1">
              <div className="flex items-center gap-1 mb-0.5">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">Prev</span>
              </div>
              <span className="text-lg font-bold block">
                {formatHoursDuration(stats.minutes.expected)}
              </span>
            </div>

            {/* Worked Hours */}
            <div className="bg-emerald-500 rounded-lg p-2 text-white flex-1">
              <div className="flex items-center gap-1 mb-0.5">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Trab</span>
              </div>
              <span className="text-lg font-bold block">
                {formatHoursDuration(stats.minutes.worked)}
              </span>
            </div>

            {/* Balance */}
            <div className="bg-rose-500 rounded-lg p-2 text-white flex-1">
              <div className="flex items-center gap-1 mb-0.5">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Saldo</span>
              </div>
              <span className="text-lg font-bold block">
                {formatHoursDuration(stats.minutes.balance)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  } catch (error) {
    errorLogger.logError(error as Error, 'QuarterStats');
    return <div>Erro ao carregar estatísticas do trimestre</div>;
  }
}