import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, Trash2 } from 'lucide-react';
import { useData } from '../../hooks/useData';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

export function ShiftList() {
  const { shifts, deleteShift } = useData();
  const [shiftToDelete, setShiftToDelete] = useState<string | null>(null);

  const handleDelete = (shiftId: string) => {
    setShiftToDelete(shiftId);
  };

  const handleConfirmDelete = async () => {
    if (!shiftToDelete) return;
    
    try {
      await deleteShift(shiftToDelete);
      setShiftToDelete(null);
    } catch (error) {
      console.error('Erro ao deletar turno:', error);
    }
  };

  const handleCancelDelete = () => {
    setShiftToDelete(null);
  };

  return (
    <>
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
                  onClick={() => handleDelete(shift.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <AlertDialog open={!!shiftToDelete} onOpenChange={handleCancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este turno? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}