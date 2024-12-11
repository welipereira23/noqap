import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Trash2 } from 'lucide-react';
import { Card } from '../ui/card';
import { ConfirmationDialog } from '../ui/confirmation-dialog';
import { useData } from '../../hooks/useData';
import { isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';

interface NonAccountingDayListProps {
  monthStart: Date;
  monthEnd: Date;
}

export function NonAccountingDayList({ monthStart }: NonAccountingDayListProps) {
  const { nonAccountingDays, deleteNonAccountingDay } = useData();
  const [deleteDayId, setDeleteDayId] = useState<string | null>(null);
  const start = startOfMonth(monthStart);
  const end = endOfMonth(monthStart);

  // Filtra e ordena os dias não contábeis do mês
  const monthNonAccountingDays = nonAccountingDays
    .filter(day => {
      console.log('[NonAccountingDayList] Verificando dia:', {
        date: day.date,
        start,
        end,
        isWithin: isWithinInterval(day.date, { start, end })
      });
      return isWithinInterval(day.date, { start, end });
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  console.log('[NonAccountingDayList] Dias filtrados:', monthNonAccountingDays);

  const handleDelete = (id: string) => {
    setDeleteDayId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteDayId) {
      deleteNonAccountingDay(deleteDayId);
      setDeleteDayId(null);
    }
  };

  return (
    <>
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <h3 className="text-base font-semibold text-slate-800">Dias não contábeis</h3>
        </div>

        <div className="space-y-2">
          {monthNonAccountingDays.length === 0 ? (
            <div className="text-center py-6">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                Nenhum dia não contábil registrado neste mês.
              </p>
            </div>
          ) : (
            monthNonAccountingDays.map(day => (
              <div
                key={day.id}
                className="group bg-slate-50 rounded-lg p-2.5 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-slate-800">
                      {format(day.date, "dd 'de' MMMM", { locale: ptBR })}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {day.type}
                      </span>
                      {day.reason && (
                        <span className="text-xs text-slate-500 bg-white px-1.5 py-0.5 rounded">
                          {day.reason}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDelete(day.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <ConfirmationDialog
        isOpen={!!deleteDayId}
        onClose={() => setDeleteDayId(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir Dia Não Contábil"
        description="Tem certeza que deseja excluir este dia não contábil? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        type="danger"
      />
    </>
  );
}