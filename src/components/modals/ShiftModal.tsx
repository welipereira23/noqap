import React from 'react';
import { format } from 'date-fns';
import { Clock, Calendar, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useData } from '../../hooks/useData';
import { toast } from 'sonner';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingShift?: {
    id: string;
    startTime: Date;
    endTime: Date;
    description?: string;
  };
  defaultDate?: Date;
}

export function ShiftModal({ isOpen, onClose, editingShift, defaultDate = new Date() }: ShiftModalProps) {
  console.log('=== ShiftModal Debug ===');
  console.log('Is Open:', isOpen);
  console.log('Editing Shift:', editingShift);
  console.log('Modal Classes:', "w-[95vw] sm:w-[425px] p-0 overflow-hidden");

  const { addShift } = useData();

  const predefinedShifts = [
    { label: '05:30 às 18:00', start: '05:30', end: '18:00' },
    { label: '17:30 às 06:00', start: '17:30', end: '06:00' },
    { label: '13:30 às 00:00', start: '13:30', end: '00:00' },
    { label: '13:30 às 02:00', start: '13:30', end: '02:00' },
    { label: '08:00 às 12:00', start: '08:00', end: '12:00' },
    { label: '13:30 às 17:00', start: '13:30', end: '17:00' }
  ];

  const handlePredefinedShift = (start: string, end: string) => {
    const startInput = document.querySelector('input[name="startTime"]') as HTMLInputElement;
    const endInput = document.querySelector('input[name="endTime"]') as HTMLInputElement;
    
    if (startInput && endInput) {
      startInput.value = start;
      endInput.value = end;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const date = new Date(formData.get('date') as string);
    const startTime = new Date(`${date.toISOString().split('T')[0]}T${formData.get('startTime') as string}`);
    const endTime = new Date(`${date.toISOString().split('T')[0]}T${formData.get('endTime') as string}`);
    const description = formData.get('description') as string;

    // Ajusta a data final se o horário final for menor que o inicial (virada de dia)
    if (endTime <= startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    const shiftData = {
      startTime,
      endTime,
      description: description || undefined
    };

    try {
      await addShift(shiftData);
      toast.success('Turno adicionado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar turno:', error);
      toast.error('Erro ao adicionar turno. Tente novamente.');
    }
  };

  const defaultDateStr = format(defaultDate, 'yyyy-MM-dd');
  const defaultStartTime = editingShift ? format(editingShift.startTime, "HH:mm") : '05:30';
  const defaultEndTime = editingShift ? format(editingShift.endTime, "HH:mm") : '18:00';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-[600px] md:w-[700px] p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 text-white">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <DialogTitle className="text-lg font-semibold text-white">
                  {editingShift ? 'Editar Turno' : 'Novo Turno'}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Data
              </label>
              <input
                type="date"
                name="date"
                required
                defaultValue={format(defaultDate, 'yyyy-MM-dd')}
                className="w-full rounded-md border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm font-medium text-slate-700 mb-3">Turnos pré-definidos:</p>
              <div className="grid grid-cols-2 gap-3">
                {predefinedShifts.map((shift, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handlePredefinedShift(shift.start, shift.end)}
                    className="flex items-center justify-center px-3 py-2 text-sm text-indigo-600 bg-white rounded-md border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                  >
                    {shift.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Hora Início
                </label>
                <input
                  type="time"
                  name="startTime"
                  id="startTime"
                  required
                  defaultValue={defaultStartTime}
                  onChange={(e) => {
                    const endTime = (document.getElementById('endTime') as HTMLInputElement).value;
                    // calculateShiftStats(`${defaultDateStr}T${e.target.value}`, `${defaultDateStr}T${endTime}`);
                  }}
                  className="w-full rounded-md border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Hora Fim
                </label>
                <input
                  type="time"
                  name="endTime"
                  id="endTime"
                  required
                  defaultValue={defaultEndTime}
                  onChange={(e) => {
                    const startTime = (document.getElementById('startTime') as HTMLInputElement).value;
                    // calculateShiftStats(`${defaultDateStr}T${startTime}`, `${defaultDateStr}T${e.target.value}`);
                  }}
                  className="w-full rounded-md border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Descrição (opcional)
              </label>
              <textarea
                name="description"
                rows={2}
                defaultValue={editingShift?.description}
                className="w-full rounded-md border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Descreva as atividades realizadas..."
              />
            </div>

          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center gap-2 py-2 px-4 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors"
          >
            <Clock className="w-4 h-4" />
            {editingShift ? 'Atualizar' : 'Registrar'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}