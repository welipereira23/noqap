import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, Trash2 } from 'lucide-react';
import { useStore } from '../../store/useStore';

export function ShiftList() {
  const { shifts, removeShift } = useStore();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="h-5 w-5 text-indigo-600" />
        <h3 className="text-lg font-medium text-gray-900">Turnos Registrados</h3>
      </div>

      <div className="space-y-4">
        {shifts.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Nenhum turno registrado ainda.
          </p>
        ) : (
          shifts.map((shift) => (
            <div
              key={shift.id}
              className="flex items-center justify-between border-b border-gray-200 pb-4"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {format(shift.startTime, "dd 'de' MMMM", { locale: ptBR })}
                </p>
                <p className="text-sm text-gray-500">
                  {format(shift.startTime, 'HH:mm')} - {format(shift.endTime, 'HH:mm')}
                </p>
                {shift.description && (
                  <p className="text-sm text-gray-600 mt-1">{shift.description}</p>
                )}
              </div>
              <button
                onClick={() => removeShift(shift.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}