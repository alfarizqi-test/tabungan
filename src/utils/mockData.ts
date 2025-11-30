import { Student } from '../types';

export const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Ahmad Rizki',
    nim: '2023001',
    balance: 150000,
    transactions: [
      { id: 't1', date: '2025-11-01', type: 'deposit', amount: 50000, description: 'Simpanan Mingguan' },
      { id: 't2', date: '2025-11-08', type: 'deposit', amount: 50000, description: 'Simpanan Mingguan' },
      { id: 't3', date: '2025-11-10', type: 'deposit', amount: 50000, description: 'Simpanan Mingguan' },
    ]
  },
  {
    id: '2',
    name: 'Siti Nurhaliza',
    nim: '2023002',
    balance: 200000,
    transactions: [
      { id: 't4', date: '2025-11-01', type: 'deposit', amount: 100000, description: 'Simpanan Bulanan' },
      { id: 't5', date: '2025-11-08', type: 'deposit', amount: 50000, description: 'Simpanan Mingguan' },
      { id: 't6', date: '2025-11-12', type: 'deposit', amount: 50000, description: 'Simpanan Mingguan' },
    ]
  },
  {
    id: '3',
    name: 'Budi Santoso',
    nim: '2023003',
    balance: 75000,
    transactions: [
      { id: 't7', date: '2025-11-01', type: 'deposit', amount: 100000, description: 'Simpanan Awal' },
      { id: 't8', date: '2025-11-05', type: 'withdrawal', amount: 25000, description: 'Penarikan' },
    ]
  },
  {
    id: '4',
    name: 'Dewi Lestari',
    nim: '2023004',
    balance: 300000,
    transactions: [
      { id: 't9', date: '2025-11-01', type: 'deposit', amount: 150000, description: 'Simpanan Bulanan' },
      { id: 't10', date: '2025-11-08', type: 'deposit', amount: 75000, description: 'Simpanan Mingguan' },
      { id: 't11', date: '2025-11-12', type: 'deposit', amount: 75000, description: 'Simpanan Mingguan' },
    ]
  },
  {
    id: '5',
    name: 'Eko Prasetyo',
    nim: '2023005',
    balance: 125000,
    transactions: [
      { id: 't12', date: '2025-11-01', type: 'deposit', amount: 50000, description: 'Simpanan Mingguan' },
      { id: 't13', date: '2025-11-08', type: 'deposit', amount: 50000, description: 'Simpanan Mingguan' },
      { id: 't14', date: '2025-11-11', type: 'deposit', amount: 25000, description: 'Simpanan Tambahan' },
    ]
  }
];
