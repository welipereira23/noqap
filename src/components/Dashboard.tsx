import React, { useState } from 'react';
import { Plus, Clock, Calendar } from 'lucide-react';
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
        <div className="fixed bottom-6 right-6">
          <div className="relative">
            {showRecordOptions && (
              <div className="absolute bottom-16 right-0 w-56 sm:w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2">
                <button
                  onClick={() => {
                    setIsShiftModalOpen(true);
                    handleCloseRecordOptions();
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <span>Novo Turno</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setIsNonAccountingModalOpen(true);
                    handleCloseRecordOptions();
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <span>Dia Não Contábil</span>
                  </div>
                </button>
              </div>
            )}
            <button
              onClick={handleFabClick}
              className="flex items-center justify-center w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
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