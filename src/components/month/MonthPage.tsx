import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Download, Calendar, Clock, Loader2 } from 'lucide-react';
import { format, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Card } from '../ui/card';
import { ShiftList } from './ShiftList';
import { NonAccountingDayList } from './NonAccountingDayList';
import { ShiftModal } from '../modals/ShiftModal';
import { NonAccountingDayModal } from '../modals/NonAccountingDayModal';
import { useData } from '../../hooks/useData';
import { formatHoursDuration } from '../../utils/dateUtils';
import { calculateMonthlyStats } from '../../utils/time/monthly';
import { calculateDuration } from '../../utils/time/duration';
import { generateMonthReport } from '../../utils/pdf/monthReport';

export function MonthPage() {
  const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = useParams();
  const navigate = useNavigate();
  const { shifts, nonAccountingDays } = useData();
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isNonAccountingModalOpen, setIsNonAccountingModalOpen] = useState(false);
  const [showRecordOptions, setShowRecordOptions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowRecordOptions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentDate = new Date(Number(year), Number(month) - 1, 1);
  const stats = calculateMonthlyStats(currentDate, shifts, nonAccountingDays);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Filtra os dados apenas do mês atual
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      
      const monthShifts = shifts.filter(shift => 
        isWithinInterval(shift.startTime, { start: monthStart, end: monthEnd })
      );
      
      const monthNonAccountingDays = nonAccountingDays.filter(day => 
        isWithinInterval(day.date, { start: monthStart, end: monthEnd })
      );
      
      const doc = generateMonthReport(currentDate, stats, monthShifts, monthNonAccountingDays);
      
      // Salvar o PDF
      doc.save(`relatorio-${format(currentDate, 'yyyy-MM')}.pdf`);
      
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast.error('Erro ao exportar relatório');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h1 className="text-xl font-bold text-slate-800">
              {format(currentDate, 'MMMM', { locale: ptBR })}
              <span className="ml-1 text-slate-600">
                {format(currentDate, 'yyyy')}
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowRecordOptions(!showRecordOptions)}
              className="flex items-center justify-center w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
            {showRecordOptions && (
              <div className="absolute bottom-16 right-0 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1">
                <button
                  onClick={() => {
                    setIsShiftModalOpen(true);
                    setShowRecordOptions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Novo Turno</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setIsNonAccountingModalOpen(true);
                    setShowRecordOptions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Dia Não Contábil</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6" style={{ backgroundColor: 'rgb(218, 236, 237)' }}>
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-slate-800">Dias do Mês</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Total de Dias</span>
                <span className="font-medium text-slate-800">{stats.days.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Dias Não Contábeis</span>
                <span className="font-medium text-slate-800">{stats.days.nonAccounting}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-slate-600">Dias a Trabalhar</span>
                <span className="font-medium text-slate-800">{stats.days.effective}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6" style={{ backgroundColor: 'rgb(218, 236, 237)' }}>
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-slate-800">Horas do Mês</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Horas Previstas</span>
                <span className="font-medium text-slate-800">
                  {formatHoursDuration(stats.minutes.expected)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Horas Trabalhadas</span>
                <span className="font-medium text-emerald-600">
                  {formatHoursDuration(stats.minutes.worked)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-slate-600">Saldo</span>
                <span className={`font-medium ${
                  stats.minutes.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {formatHoursDuration(stats.minutes.balance)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ShiftList monthStart={startOfMonth(currentDate)} monthEnd={endOfMonth(currentDate)} />
          <NonAccountingDayList monthStart={startOfMonth(currentDate)} monthEnd={endOfMonth(currentDate)} />
        </div>

        {/* Modals */}
        <ShiftModal
          isOpen={isShiftModalOpen}
          onClose={() => setIsShiftModalOpen(false)}
          defaultDate={currentDate}
        />
        <NonAccountingDayModal
          isOpen={isNonAccountingModalOpen}
          onClose={() => setIsNonAccountingModalOpen(false)}
          defaultDate={currentDate}
        />
      </div>
    </div>
  );
}