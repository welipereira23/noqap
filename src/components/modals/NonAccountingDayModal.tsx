import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, FileText, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useData } from '../../hooks/useData';
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
  const { addNonAccountingDay } = useData();
  const [selectedType, setSelectedType] = useState<NonAccountingDayType>(editingDay?.type || dayTypes[0]);

  console.log('=== NonAccountingDayModal Debug ===');
  console.log('Is Open:', isOpen);
  console.log('Editing Day:', editingDay);
  console.log('Selected Type:', selectedType);
  console.log('Modal Classes:', "w-[90vw] sm:w-[500px] p-0 overflow-hidden");

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

    addNonAccountingDay(dayData);
    onClose();
  };

  const defaultDateStr = editingDay 
    ? format(editingDay.date, 'yyyy-MM-dd')
    : format(defaultDate, 'yyyy-MM-dd');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] sm:w-[500px] p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-4 text-white">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <DialogTitle className="text-lg font-semibold text-white">
                  {editingDay ? 'Editar Dia' : 'Novo Dia'}
                </DialogTitle>
              </div>
              <button 
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
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
                className="w-full rounded-md border-slate-200 shadow-sm focus:border-amber-500 focus:ring-amber-500"
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
                  className="w-full rounded-md border-slate-200 shadow-sm focus:border-amber-500 focus:ring-amber-500 appearance-none pr-10"
                >
                  {dayTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <FileText className="w-4 h-4 text-amber-500" />
                Motivo (opcional)
              </label>
              <textarea
                name="reason"
                rows={2}
                defaultValue={editingDay?.reason}
                className="w-full rounded-md border-slate-200 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                placeholder="Descreva o motivo..."
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center gap-2 py-2 px-4 bg-amber-500 text-white rounded-md font-medium hover:bg-amber-600 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            {editingDay ? 'Atualizar' : 'Registrar'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}