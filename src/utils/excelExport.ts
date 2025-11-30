import * as XLSX from 'xlsx';
import { Student, Transaction } from '../types';

export const exportStudentToExcel = (student: Student) => {
  const data = student.transactions.map(t => ({
    'Tanggal': t.date,
    'Tipe': t.type === 'deposit' ? 'Simpan' : 'Tarik',
    'Jumlah': t.amount,
    'Keterangan': t.description
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transaksi');

  // Add summary sheet
  const summary = [
    { 'Informasi': 'Nama', 'Detail': student.name },
    { 'Informasi': 'NIS', 'Detail': student.nim },
    { 'Informasi': 'Total Saldo', 'Detail': student.balance }
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summary);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

  XLSX.writeFile(wb, `Tabungan_${student.name.replace(/\s/g, '_')}.xlsx`);
};

export const exportAllStudentsToExcel = (students: Student[]) => {
  // Summary sheet
  const summaryData = students.map(s => ({
    'NIS': s.nim,
    'Nama': s.name,
    'Total Saldo': s.balance,
    'Jumlah Transaksi': s.transactions.length
  }));
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);

  // All transactions sheet
  const allTransactions = students.flatMap(s => 
    s.transactions.map(t => ({
      'NIS': s.nim,
      'Nama': s.name,
      'Tanggal': t.date,
      'Tipe': t.type === 'deposit' ? 'Simpan' : 'Tarik',
      'Jumlah': t.amount,
      'Keterangan': t.description
    }))
  ).sort((a, b) => new Date(b.Tanggal).getTime() - new Date(a.Tanggal).getTime());
  const wsTransactions = XLSX.utils.json_to_sheet(allTransactions);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Siswa');
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Semua Transaksi');

  XLSX.writeFile(wb, `Tabungan_Kelas_XI_TKJ_${new Date().toISOString().split('T')[0]}.xlsx`);
};
