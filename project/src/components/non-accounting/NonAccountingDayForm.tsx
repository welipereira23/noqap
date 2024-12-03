import React from 'react';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { generateId } from '../../utils/generateId';

export function NonAccountingDayForm() {
  const addNonAccountingDay = useStore((state) => state.addNonAccountingDay);
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const date = new Date(formData.get('date') as string);
    const reason = formData.get('reason') as string;

    addNonAccountingDay({
      id: generateId(),
      date,
      reason
    });

    e.currentTarget.reset();
  };

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="h-5 w-5 text-indigo-600" />
        <h3 className="text-lg font-medium text-gray-900">Registrar Dia Não Contabilizado</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Data
          </label>
          <input
            type="date"
            name="date"
            id="date"
            defaultValue={today}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
            Motivo
          </label>
          <textarea
            name="reason"
            id="reason"
            rows={2}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Ex: Feriado, Férias, Licença..."
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Registrar
        </button>
      </div>
    </form>
  );
}