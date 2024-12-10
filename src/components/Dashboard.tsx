import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useStore } from '../store/useStore';
import { MonthList } from './dashboard/MonthList';
import { QuarterStats } from './dashboard/QuarterStats';
import { ShiftModal } from './modals/ShiftModal';
import { NonAccountingDayModal } from './modals/NonAccountingDayModal';

export function Dashboard() {
  // Sempre inicializa com a data atual
  const { currentDate, setCurrentDate } = useStore(state => ({
    currentDate: state.currentDate,
    setCurrentDate: state.setCurrentDate
  }));
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isNonAccountingModalOpen, setIsNonAccountingModalOpen] = useState(false);
  const [showRecordOptions, setShowRecordOptions] = useState(false);

  const handleFabClick = () => {
    setShowRecordOptions(true);
  };

  const handleCloseRecordOptions = () => {
    setShowRecordOptions(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-7xl mx-auto">
        <QuarterStats
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />

        <MonthList currentDate={currentDate} />

        {/* FAB with options */}
        <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-2">
          {showRecordOptions && (
            <div className="bg-white rounded-lg shadow-lg p-2 mb-2 animate-in slide-in-from-bottom-5">
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsShiftModalOpen(true);
                    handleCloseRecordOptions();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Turno</span>
                </button>
                <button
                  onClick={() => {
                    setIsNonAccountingModalOpen(true);
                    handleCloseRecordOptions();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Dia Não Contábil</span>
                </button>
              </div>
            </div>
          )}
          <button
            onClick={handleFabClick}
            className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Modals */}
        <ShiftModal
          isOpen={isShiftModalOpen}
          onClose={() => setIsShiftModalOpen(false)}
        />
        <NonAccountingDayModal
          isOpen={isNonAccountingModalOpen}
          onClose={() => setIsNonAccountingModalOpen(false)}
        />
      </div>
    </div>
  );
}