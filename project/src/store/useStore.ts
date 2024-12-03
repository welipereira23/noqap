import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Shift, NonAccountingDay, Subscription } from '../types';

interface Store {
  user: User | null;
  shifts: Shift[];
  nonAccountingDays: NonAccountingDay[];
  subscription: Subscription | null;
  setUser: (user: User | null) => void;
  addShift: (shift: Shift) => void;
  updateShift: (id: string, data: Partial<Omit<Shift, 'id'>>) => void;
  removeShift: (id: string) => void;
  addNonAccountingDay: (day: NonAccountingDay) => void;
  updateNonAccountingDay: (id: string, data: Partial<Omit<NonAccountingDay, 'id'>>) => void;
  removeNonAccountingDay: (id: string) => void;
  setSubscription: (subscription: Subscription | null) => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      user: null,
      shifts: [],
      nonAccountingDays: [],
      subscription: null,
      setUser: (user) => set({ user }),
      addShift: (shift) =>
        set((state) => ({
          shifts: [...state.shifts, shift].sort((a, b) => 
            b.startTime.getTime() - a.startTime.getTime()
          )
        })),
      updateShift: (id, data) =>
        set((state) => ({
          shifts: state.shifts.map((shift) =>
            shift.id === id ? { ...shift, ...data } : shift
          ).sort((a, b) => b.startTime.getTime() - a.startTime.getTime()),
        })),
      removeShift: (id) =>
        set((state) => ({
          shifts: state.shifts.filter((shift) => shift.id !== id),
        })),
      addNonAccountingDay: (day) =>
        set((state) => ({
          nonAccountingDays: [...state.nonAccountingDays, day].sort((a, b) =>
            b.date.getTime() - a.date.getTime()
          )
        })),
      updateNonAccountingDay: (id, data) =>
        set((state) => ({
          nonAccountingDays: state.nonAccountingDays.map((day) =>
            day.id === id ? { ...day, ...data } : day
          ).sort((a, b) => b.date.getTime() - a.date.getTime()),
        })),
      removeNonAccountingDay: (id) =>
        set((state) => ({
          nonAccountingDays: state.nonAccountingDays.filter((day) => day.id !== id),
        })),
      setSubscription: (subscription) =>
        set({ subscription }),
    }),
    {
      name: 'time-tracking-storage',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          
          const data = JSON.parse(str);
          return {
            ...data,
            state: {
              ...data.state,
              shifts: data.state.shifts.map((shift: any) => ({
                ...shift,
                startTime: new Date(shift.startTime),
                endTime: new Date(shift.endTime)
              })),
              nonAccountingDays: data.state.nonAccountingDays.map((day: any) => ({
                ...day,
                date: new Date(day.date)
              }))
            }
          };
        },
        setItem: (name, value) => {
          const data = {
            ...value,
            state: {
              ...value.state,
              shifts: value.state.shifts.map((shift: Shift) => ({
                ...shift,
                startTime: shift.startTime.toISOString(),
                endTime: shift.endTime.toISOString()
              })),
              nonAccountingDays: value.state.nonAccountingDays.map((day: NonAccountingDay) => ({
                ...day,
                date: day.date.toISOString()
              }))
            }
          };
          localStorage.setItem(name, JSON.stringify(data));
        },
        removeItem: (name) => localStorage.removeItem(name)
      }
    }
  )
);