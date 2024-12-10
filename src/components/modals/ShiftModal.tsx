import React, { useState } from 'react';
import { format } from 'date-fns';
import { Clock, Calendar, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useData } from '../../hooks/useData';
import { calculateDuration } from '../../utils/time/duration';
import { formatHoursDuration } from '../../utils/dateUtils';
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
  const [duration, setDuration] = useState<number | null>(null);
  const [nightHours, setNightHours] = useState<number>(0);
  const [nightBonus, setNightBonus] = useState<string>('');

  const calculateShiftStats = (start: string, end: string) => {
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      const stats = calculateDuration({ start: startDate, end: endDate });
      
      setDuration(stats.baseMinutes);
      setNightHours(stats.nightHours);
      setNightBonus(formatHoursDuration(stats.nightBonus));
    } else {
      setDuration(null);
      setNightHours(0);
      setNightBonus('');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const date = new Date(formData.get('date') as string);
    const startTime = new Date(`${date.toISOString().split('T')[0]}T${formData.get('startTime') as string}`);
    const endTime = new Date(`${date.toISOString().split('T')[0]}T${formData.get('endTime') as string}`);
    const description = formData.get('description') as string;

    // Validar se a data final é maior que a inicial
    if (endTime <= startTime) {
      toast.error('A hora final deve ser maior que a hora inicial');
      return;
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
  const defaultStartTime = editingShift 
    ? format(editingShift.startTime, "HH:mm")
    : "09:00";
  const defaultEndTime = editingShift
    ? format(editingShift.endTime, "HH:mm")
    : "18:00";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] sm:w-[500px] p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-4 text-white">
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

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Hora Início
                </label>
                <input
                  type="time"
                  name="startTime"
                  required
                  defaultValue={defaultStartTime}
                  onChange={(e) => {
                    const endTime = (document.getElementById('endTime') as HTMLInputElement).value;
                    calculateShiftStats(`${defaultDateStr}T${e.target.value}`, `${defaultDateStr}T${endTime}`);
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
                  required
                  defaultValue={defaultEndTime}
                  onChange={(e) => {
                    const startTime = (document.getElementById('startTime') as HTMLInputElement).value;
                    calculateShiftStats(`${defaultDateStr}T${startTime}`, `${defaultDateStr}T${e.target.value}`);
                  }}
                  className="w-full rounded-md border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            {duration !== null && (
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-500 block">Duração</span>
                    <span className="text-sm font-medium text-slate-800">
                      {formatHoursDuration(duration)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Noturnas</span>
                    <span className="text-sm font-medium text-slate-800">
                      {nightHours}h ({nightBonus})
                    </span>
                  </div>
                </div>
              </div>
            )}

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