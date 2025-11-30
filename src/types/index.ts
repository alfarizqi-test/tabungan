export type UserRole = 'student' | 'treasurer';

export interface Transaction {
  id: string;
  date: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  description: string;
}

export interface Student {
  id: string;
  name: string;
  nim: string;
  balance: number;
  transactions: Transaction[];
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  studentId?: string;
}
