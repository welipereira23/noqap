import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Shift, NonAccountingDay } from '../types';

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
      storage: localStorage,
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);