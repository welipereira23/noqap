import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, FileText, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { useData } from '../../hooks/useData';
import { NonAccountingDayType } from '../../types';
import { toast } from 'sonner';

interface NonAccountingDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingDay?: {
    id: string;
    startDate: Date;
    endDate: Date;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const startDateStr = formData.get('startDate') as string;
      const endDateStr = formData.get('endDate') as string;
      const reason = formData.get('reason') as string;

      if (!startDateStr || !endDateStr) {
        toast.error('Por favor, selecione as datas');
        return;
      }

      // Criar datas sem manipulação de timezone
      const startDate = new Date(`${startDateStr}T12:00:00`);
      const endDate = new Date(`${endDateStr}T12:00:00`);

      // Validar datas
      if (startDate > endDate) {
        toast.error('A data inicial não pode ser posterior à data final');
        return;
      }

      // [DEBUG] Log dos dados antes de enviar
      console.log('[NonAccountingDayModal] Enviando dados:', {
        startDate,
        endDate,
        type: selectedType,
        reason: reason || undefined
      });

      await addNonAccountingDay({
        startDate,
        endDate,
        type: selectedType,
        reason: reason || undefined
      });
      
      toast.success('Dia não contábil registrado com sucesso!');
      onClose();
    } catch (error: any) {
      console.error('[NonAccountingDayModal] Erro ao registrar dia não contábil:', error);
      toast.error(error.message || 'Erro ao registrar dia não contábil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultStartDateStr = editingDay 
    ? format(editingDay.startDate, 'yyyy-MM-dd')
    : format(defaultDate, 'yyyy-MM-dd');
  const defaultEndDateStr = editingDay 
    ? format(editingDay.endDate, 'yyyy-MM-dd')
    : format(defaultDate, 'yyyy-MM-dd');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-[600px] md:w-[700px] p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 text-white">
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
            <DialogDescription className="text-white/80 text-sm">
              Registre um período não contábil como férias, licença ou outros.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  Data Início
                </label>
                <input
                  type="date"
                  name="startDate"
                  required
                  defaultValue={defaultStartDateStr}
                  className="w-full rounded-md border-slate-200 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  Data Fim
                </label>
                <input
                  type="date"
                  name="endDate"
                  required
                  defaultValue={defaultEndDateStr}
                  className="w-full rounded-md border-slate-200 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
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
            disabled={isSubmitting}
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