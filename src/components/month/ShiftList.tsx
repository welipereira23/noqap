import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, Trash2 } from 'lucide-react';
import { Card } from '../ui/card';
import { ConfirmationDialog } from '../ui/confirmation-dialog';
import { useData } from '../../hooks/useData';
import { formatHoursDuration } from '../../utils/dateUtils';
import { calculateDuration } from '../../utils/time/duration';
import { isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';

interface ShiftListProps {
  monthStart: Date;
  monthEnd: Date;
}

export function ShiftList({ monthStart }: ShiftListProps) {
  const { shifts, deleteShift } = useData();
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
      deleteShift(deleteShiftId);
      setDeleteShiftId(null);
    }
  };

  return (
    <>
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-indigo-600" />
          <h3 className="text-base font-semibold text-slate-800">Turnos</h3>
        </div>

        <div className="space-y-2">
          {monthShifts.length === 0 ? (
            <div className="text-center py-6">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                Nenhum turno registrado neste mês.
              </p>
            </div>
          ) : (
            monthShifts.map(shift => (
              <div
                key={shift.id}
                className="group bg-slate-50 rounded-lg p-2.5 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-800">
                      {format(shift.startTime, "dd 'de' MMMM", { locale: ptBR })}
                    </p>
                    <div className="space-y-0.5">
                      <p className="text-sm text-indigo-600">
                        {format(shift.startTime, 'HH:mm')} - {format(shift.endTime, 'HH:mm')}
                      </p>
                      <p className="text-sm text-indigo-600">
                        Minutos Noturnos = {calculateDuration({
                          start: shift.startTime,
                          end: shift.endTime
                        }).nightBonus}min
                      </p>
                      <p className="text-sm text-emerald-600">
                        Total = {formatHoursDuration(calculateDuration({
                          start: shift.startTime,
                          end: shift.endTime
                        }).totalMinutes)}
                      </p>
                      {shift.description && (
                        <p className="text-sm text-slate-500">
                          {shift.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDelete(shift.id)}
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