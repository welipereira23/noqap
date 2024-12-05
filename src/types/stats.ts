export interface MonthlyStats {
  days: {
    total: number;
    nonAccounting: number;
    effective: number;
  };
  minutes: {
    expected: number;
    worked: number;
    balance: number;
  };
}
