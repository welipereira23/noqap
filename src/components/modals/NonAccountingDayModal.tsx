import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, FileText, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useStore } from '../../store/useStore';
import { generateId } from '../../utils/generateId';
import { NonAccountingDayType } from '../../types';

interface NonAccountingDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingDay?: {
    id: string;
    date: Date;
    type: NonAccountingDayType;
    reason?: string;
  };
  defaultDate?: Date;
}

const dayTypes: NonAccountingDayType[] = [
  'Férias',
  'Licença Médica',
  'Licença Maternidade',
  'Licença Paternidade',
  'Dispensa Luto',
  'Núpcias',
  'Outros'
];

export function NonAccountingDayModal({ 
  isOpen, 
  onClose, 
  editingDay, 
  defaultDate = new Date() 
}: NonAccountingDayModalProps) {
  const addNonAccountingDay = useStore((state) => state.addNonAccountingDay);
  const updateNonAccountingDay = useStore((state) => state.updateNonAccountingDay);
  const [selectedType, setSelectedType] = useState<NonAccountingDayType>(editingDay?.type || dayTypes[0]);

  console.log('=== NonAccountingDayModal Debug ===');
  console.log('Is Open:', isOpen);
  console.log('Editing Day:', editingDay);
  console.log('Selected Type:', selectedType);
  console.log('Modal Classes:', "w-[95vw] sm:w-[425px] p-0 overflow-hidden");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const date = new Date(formData.get('date') as string);
    const type = formData.get('type') as NonAccountingDayType;
    const reason = formData.get('reason') as string;

    const dayData = {
      date,
      type,
      reason: reason || undefined
    };

    if (editingDay) {
      updateNonAccountingDay(editingDay.id, dayData);
    } else {
      addNonAccountingDay({
        id: generateId(),
        ...dayData
      });
    }

    onClose();
  };

  const defaultDateStr = editingDay 
    ? format(editingDay.date, 'yyyy-MM-dd')
    : format(defaultDate, 'yyyy-MM-dd');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-[425px] p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-4 text-white">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <DialogTitle className="text-lg font-semibold text-white">
                {editingDay ? 'Editar Dia Não Contábil' : 'Novo Dia Não Contábil'}
              </DialogTitle>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                Data
              </label>
              <input
                type="date"
                name="date"
                required
                defaultValue={defaultDateStr}
                className="w-full rounded-lg border-slate-200 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <FileText className="w-4 h-4 text-amber-500" />
                Tipo
              </label>
              <div className="relative">
                <select
                  name="type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as NonAccountingDayType)}
                  className="w-full appearance-none rounded-lg border-slate-200 shadow-sm focus:border-amber-500 focus:ring-amber-500 pr-10"
                >
                  {dayTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className={selectedType === 'Outros' ? 'block' : 'hidden'}>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <FileText className="w-4 h-4 text-amber-500" />
                Descrição
              </label>
              <textarea
                name="reason"
                rows={3}
                defaultValue={editingDay?.reason}
                className="w-full rounded-lg border-slate-200 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                placeholder="Descreva o motivo..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors"
            >
              {editingDay ? 'Salvar' : 'Registrar'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}