export interface TimeRange {
  start: Date;
  end: Date;
}

export interface WorkingTime {
  baseMinutes: number;   // Minutos base trabalhados
  nightHours: number;    // Horas noturnas completas
  nightBonus: number;    // Minutos adicionais por trabalho noturno
  totalMinutes: number;  // Total de minutos (base + adicional)
}