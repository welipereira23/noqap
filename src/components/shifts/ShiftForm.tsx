import React from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { generateId } from '../../utils/generateId';

export function ShiftForm() {
  const addShift = useStore((state) => state.addShift);
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const startTime = new Date(formData.get('startTime') as string);
    const endTime = new Date(formData.get('endTime') as string);
    const description = formData.get('description') as string;

    addShift({
      id: generateId(),
      startTime,
      endTime,
      description
    });

    e.currentTarget.reset();
  };

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="h-5 w-5 text-indigo-600" />
        <h3 className="text-lg font-medium text-gray-900">Registrar Turno</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
            Início
          </label>
          <input
            type="datetime-local"
            name="startTime"
            id="startTime"
            defaultValue={`${today}T09:00`}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
            Fim
          </label>
          <input
            type="datetime-local"
            name="endTime"
            id="endTime"
            defaultValue={`${today}T18:00`}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Descrição
          </label>
          <textarea
            name="description"
            id="description"
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Descreva as atividades realizadas..."
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Registrar Turno
        </button>
      </div>
    </form>
  );
}