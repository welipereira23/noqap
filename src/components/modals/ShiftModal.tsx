import React, { useState } from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useData } from '../../hooks/useData';
import { calculateDuration } from '../../utils/time/duration';
import { formatHoursDuration } from '../../utils/dateUtils';

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const startTime = new Date(formData.get('startTime') as string);
    const endTime = new Date(formData.get('endTime') as string);
    const description = formData.get('description') as string;

    const shiftData = {
      startTime,
      endTime,
      description: description || undefined
    };

    addShift(shiftData);
    onClose();
  };

  const defaultDateStr = format(defaultDate, 'yyyy-MM-dd');
  const defaultStartTime = editingShift 
    ? format(editingShift.startTime, "yyyy-MM-dd'T'HH:mm")
    : `${defaultDateStr}T09:00`;
  const defaultEndTime = editingShift
    ? format(editingShift.endTime, "yyyy-MM-dd'T'HH:mm")
    : `${defaultDateStr}T18:00`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-[425px] p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-4 text-white">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <DialogTitle className="text-lg font-semibold text-white">
                {editingShift ? 'Editar Turno' : 'Novo Turno'}
              </DialogTitle>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Horários
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startTime" className="block text-xs text-slate-500 mb-1">
                    Início
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    id="startTime"
                    required
                    defaultValue={defaultStartTime}
                    onChange={(e) => {
                      const endTime = (document.getElementById('endTime') as HTMLInputElement).value;
                      calculateShiftStats(e.target.value, endTime);
                    }}
                    className="w-full rounded-md border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-xs text-slate-500 mb-1">
                    Fim
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    id="endTime"
                    required
                    defaultValue={defaultEndTime}
                    onChange={(e) => {
                      const startTime = (document.getElementById('startTime') as HTMLInputElement).value;
                      calculateShiftStats(startTime, e.target.value);
                    }}
                    className="w-full rounded-md border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {duration !== null && (
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-medium">Duração base:</span>
                  <span className="font-semibold">{formatHoursDuration(duration)}</span>
                </div>
                {nightHours > 0 && (
                  <div className="mt-2 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <span>Horas noturnas:</span>
                      <span className="font-medium text-indigo-600">{nightHours}h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Adicional noturno:</span>
                      <span className="font-medium text-indigo-600">{nightBonus}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Clock className="w-4 h-4 text-indigo-600" />
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