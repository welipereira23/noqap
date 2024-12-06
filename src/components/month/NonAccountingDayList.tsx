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
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-slate-800">Dias Não Contábeis</h3>
        </div>

        <div className="space-y-4">
          {monthNonAccountingDays.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">
                Nenhum dia não contábil registrado neste mês.
              </p>
            </div>
          ) : (
            monthNonAccountingDays.map(day => (
              <div
                key={day.id}
                className="group bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="font-medium text-slate-800">
                      {format(day.date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        {day.type}
                      </span>
                      {day.reason && (
                        <span className="text-sm text-slate-500 bg-white p-2 rounded">
                          {day.reason}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDelete(day.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
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