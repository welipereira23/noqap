import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Shift, NonAccountingDay } from '../types';
import { safeStorage } from '../utils/storage';
import { errorLogger } from '../utils/errorLog';

interface State {
  user: User | null;
  currentDate: Date;
  shifts: Shift[];
  nonAccountingDays: NonAccountingDay[];
  setUser: (user: User | null) => void;
  setCurrentDate: (date: Date) => void;
  setShifts: (shifts: Shift[]) => void;
  setNonAccountingDays: (days: NonAccountingDay[]) => void;
}

const convertShiftDates = (shift: Shift) => {
  // Implementação da função para converter as datas dos shifts
  // Esta implementação está faltando no código fornecido
  // Você precisa implementar essa função de acordo com as suas necessidades
  return shift;
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      user: null,
      currentDate: new Date(),
      shifts: [],
      nonAccountingDays: [],
      setUser: (user) => set({ user }),
      setCurrentDate: (date) => set({ currentDate: date }),
      setShifts: (shifts) => set({ shifts }),
      setNonAccountingDays: (days) => set({ nonAccountingDays: days }),
    }),
    {
      name: 'bolt-store',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        user: state.user,
        currentDate: state.currentDate,
        shifts: state.shifts,
        nonAccountingDays: state.nonAccountingDays,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Garante que currentDate seja uma instância de Date
          state.currentDate = new Date(state.currentDate);
          
          // Converte as datas dos shifts
          if (state.shifts) {
            state.shifts = state.shifts.map(convertShiftDates);
          }
          
          // Converte as datas dos dias não contábeis
          if (state.nonAccountingDays) {
            state.nonAccountingDays = state.nonAccountingDays.map(day => ({
              ...day,
              date: new Date(day.date)
            }));
          }
        }
      },
    }
  )
);