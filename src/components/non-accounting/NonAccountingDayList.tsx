import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Trash2 } from 'lucide-react';
import { useData } from '../../hooks/useData';

export function NonAccountingDayList() {
  const { nonAccountingDays, deleteNonAccountingDay } = useData();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="h-5 w-5 text-indigo-600" />
        <h3 className="text-lg font-medium text-gray-900">Dias Não Contabilizados</h3>
      </div>

      <div className="space-y-4">
        {nonAccountingDays.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Nenhum dia não contabilizado registrado.
          </p>
        ) : (
          nonAccountingDays.map((day) => (
            <div
              key={day.id}
              className="flex items-center justify-between border-b border-gray-200 pb-4"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {format(day.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
                <p className="text-sm text-gray-600 mt-1">{day.reason}</p>
              </div>
              <button
                onClick={() => deleteNonAccountingDay(day.id)}
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