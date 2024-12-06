export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Shift {
  id: string;
  startTime: Date;
  endTime: Date;
  description?: string;
}

export type NonAccountingDayType = 
  | 'Férias'
  | 'Licença Médica'
  | 'Licença Maternidade'
  | 'Licença Paternidade'
  | 'Dispensa Luto'
  | 'Núpcias'
  | 'Outros';

export type NonAccountingDay = {
  id: string;
  startDate: Date;
  endDate: Date;
  type: NonAccountingDayType;
  reason?: string;
  userId: string;
};

export interface Subscription {
  id: string;
  status: 'active' | 'trial' | 'cancelled' | 'expired';
  trialEndsAt?: Date;
  cancelledAt?: Date;
  currentPeriodEnd: Date;
  plan: {
    id: string;
    name: string;
    interval: 'month' | 'year';
    price: number;
  };
}