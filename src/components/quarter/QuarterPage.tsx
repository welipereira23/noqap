import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { startOfQuarter, endOfQuarter } from 'date-fns';
import { useData } from '../../hooks/useData';
import { calculatePeriodStats } from '../../utils/time/period';
import { formatQuarterBR, formatHoursDuration } from '../../utils/dateUtils';
import { Card } from '../ui/card';

export function QuarterPage() {
  const { year = '', quarter = '' } = useParams();
  const navigate = useNavigate();
  const { shifts, nonAccountingDays } = useData();

  const quarterDate = new Date(parseInt(year), (parseInt(quarter) - 1) * 3, 1);
  const quarterStart = startOfQuarter(quarterDate);
  const quarterEnd = endOfQuarter(quarterDate);

  const stats = calculatePeriodStats({
    start: quarterStart,
    end: quarterEnd,
    shifts,
    nonAccountingDays
  });

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-800 mt-4">
            {formatQuarterBR(quarterDate)} de {year}
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-slate-500">Horas Trabalhadas</h3>
            <p className="text-2xl font-bold text-slate-800 mt-2">
              {formatHoursDuration(stats.workedHours)}
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-slate-500">Dias Úteis</h3>
            <p className="text-2xl font-bold text-slate-800 mt-2">
              {stats.workDays}
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-slate-500">Média Diária</h3>
            <p className="text-2xl font-bold text-slate-800 mt-2">
              {formatHoursDuration(stats.averageHoursPerDay)}
            </p>
          </Card>
        </div>

        {/* Shifts List */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Registros do Trimestre</h2>
          <div className="space-y-4">
            {stats.shifts.map((shift) => (
              <Card key={shift.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-slate-800">
                      {new Date(shift.start_time).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-slate-500">{shift.description}</p>
                  </div>
                  <p className="text-slate-600">
                    {formatHoursDuration(
                      (new Date(shift.end_time).getTime() - new Date(shift.start_time).getTime()) / 1000 / 3600
                    )}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
