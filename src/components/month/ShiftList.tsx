import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, Trash2, Edit } from 'lucide-react';
import { Card } from '../ui/card';
import { ConfirmationDialog } from '../ui/confirmation-dialog';
import { useStore } from '../../store/useStore';
import { formatHoursDuration } from '../../utils/dateUtils';
import { calculateDuration } from '../../utils/time/duration';
import { isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';

interface ShiftListProps {
  monthStart: Date;
  monthEnd: Date;
}

export function ShiftList({ monthStart }: ShiftListProps) {
  const { shifts, removeShift } = useStore();
  const [deleteShiftId, setDeleteShiftId] = useState<string | null>(null);
  const start = startOfMonth(monthStart);
  const end = endOfMonth(monthStart);

  // Filtra e ordena os turnos do mês
  const monthShifts = shifts
    .filter(shift => 
      isWithinInterval(shift.startTime, { start, end })
    )
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

  const handleDelete = (id: string) => {
    setDeleteShiftId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteShiftId) {
      removeShift(deleteShiftId);
      setDeleteShiftId(null);
    }
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-slate-800">Turnos</h3>
        </div>

        <div className="space-y-4">
          {monthShifts.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">
                Nenhum turno registrado neste mês.
              </p>
            </div>
          ) : (
            monthShifts.map(shift => {
              const duration = calculateDuration({
                start: shift.startTime,
                end: shift.endTime
              });

              return (
                <div
                  key={shift.id}
                  className="group bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-slate-800">
                        {format(shift.startTime, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span>{format(shift.startTime, 'HH:mm')}</span>
                        <span>→</span>
                        <span>{format(shift.endTime, 'HH:mm')}</span>
                        <span className="px-2 py-0.5 bg-slate-200 rounded text-xs font-medium">
                          {formatHoursDuration(duration.totalMinutes)}
                        </span>
                      </div>
                      {duration.nightHours > 0 && (
                        <div className="text-xs text-slate-500">
                          <span className="text-indigo-600 font-medium">
                            {duration.nightHours}h noturnas
                          </span>
                          <span className="mx-1">•</span>
                          <span>Adicional: {formatHoursDuration(duration.nightBonus)}</span>
                        </div>
                      )}
                      {shift.description && (
                        <p className="text-sm text-slate-500 mt-2 bg-white p-2 rounded">
                          {shift.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(shift.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <ConfirmationDialog
        isOpen={!!deleteShiftId}
        onClose={() => setDeleteShiftId(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir Turno"
        description="Tem certeza que deseja excluir este turno? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        type="danger"
      />
    </>
  );
}