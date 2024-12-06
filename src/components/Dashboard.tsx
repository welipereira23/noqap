import React, { useState } from 'react';
import { Menu, PieChart, Plus, AlertOctagon, AlertTriangle } from 'lucide-react';
import { QuarterStats } from './dashboard/QuarterStats';
import { MonthList } from './dashboard/MonthList';
import { ShiftModal } from './modals/ShiftModal';
import { NonAccountingDayModal } from './modals/NonAccountingDayModal';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';

export function Dashboard() {
  // Sempre inicializa com a data atual
  const { currentDate, setCurrentDate } = useStore(state => ({
    currentDate: state.currentDate,
    setCurrentDate: state.setCurrentDate
  }));
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isNonAccountingModalOpen, setIsNonAccountingModalOpen] = useState(false);
  const [showRecordOptions, setShowRecordOptions] = useState(false);
  const { subscription } = useStore();

  const handleFabClick = () => {
    setShowRecordOptions(true);
  };

  const handleCloseRecordOptions = () => {
    setShowRecordOptions(false);
  };

  // Verificar se o trial expirou
  const trialDaysLeft = subscription?.trial_end 
    ? Math.ceil((new Date(subscription.trial_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;
  const isTrialExpired = subscription?.status === 'trialing' && trialDaysLeft <= 0;

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Avisos de Assinatura */}
        {isTrialExpired && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertOctagon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Seu período de teste expirou. Para continuar usando todos os recursos, 
                  <Link to="/subscription" className="font-medium underline ml-1">
                    assine agora
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {!subscription?.status && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Você não possui uma assinatura ativa. 
                  <Link to="/subscription" className="font-medium underline ml-1">
                    Assine agora
                  </Link>
                  {' '}para continuar usando o sistema.
                </p>
              </div>
            </div>
          </div>
        )}

        <QuarterStats
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />

        <MonthList currentDate={currentDate} />

        {/* FAB with options */}
        {!isTrialExpired && (
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
        )}

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