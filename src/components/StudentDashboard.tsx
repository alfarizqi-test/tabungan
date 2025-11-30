// src/components/StudentDashboard.tsx
import React, { useState } from 'react';
import { Student, Transaction } from '../types';
import { DashboardLayout } from './DashboardLayout';
import { BalanceCard } from './BalanceCard';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, Minus, Download, Trash2 } from 'lucide-react';
import { TransactionModal } from './TransactionModal';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { exportStudentToExcel } from '../utils/excelExport';

interface StudentDashboardProps {
  student: Student;
  onUpdateStudent: (student: Student) => void;
  onLogout: () => void;
  onAddTransaction?: (studentId: string, tx: Transaction) => void; // optional granular handler
}

export function StudentDashboard({
  student,
  onUpdateStudent,
  onLogout,
  onAddTransaction
}: StudentDashboardProps) {
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDeposit = (amount: number, description: string) => {
    const newTransaction: Transaction = {
      id: `t${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'deposit',
      amount,
      description
    };

    // If parent wants granular updates, delegate
    if (onAddTransaction) {
      console.log('StudentDashboard -> delegating deposit to onAddTransaction', { studentId: student.id, tx: newTransaction });
      onAddTransaction(String(student.id), newTransaction);
      setDepositModalOpen(false);
      return;
    }

    // Fallback: update student locally and call onUpdateStudent
    const updatedStudent: Student = {
      ...student,
      balance: student.balance + amount,
      transactions: [newTransaction, ...student.transactions]
    };

    console.log('StudentDashboard -> fallback deposit updatedStudent', updatedStudent);
    onUpdateStudent(updatedStudent);
    setDepositModalOpen(false);
  };

  const handleWithdrawal = (amount: number, description: string) => {
    if (amount > student.balance) {
      alert('Saldo tidak mencukupi!');
      return;
    }

    const newTransaction: Transaction = {
      id: `t${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'withdrawal',
      amount,
      description
    };

    if (onAddTransaction) {
      console.log('StudentDashboard -> delegating withdrawal to onAddTransaction', { studentId: student.id, tx: newTransaction });
      onAddTransaction(String(student.id), newTransaction);
      setWithdrawalModalOpen(false);
      return;
    }

    const updatedStudent: Student = {
      ...student,
      balance: student.balance - amount,
      transactions: [newTransaction, ...student.transactions]
    };

    console.log('StudentDashboard -> fallback withdrawal updatedStudent', updatedStudent);
    onUpdateStudent(updatedStudent);
    setWithdrawalModalOpen(false);
  };

  const handleDeleteTransaction = () => {
    if (!selectedTransaction) return;

    const transaction = student.transactions.find(t => t.id === selectedTransaction);
    if (!transaction) return;

    const balanceAdjustment = transaction.type === 'deposit'
      ? -transaction.amount
      : transaction.amount;

    const updatedStudent: Student = {
      ...student,
      balance: student.balance + balanceAdjustment,
      transactions: student.transactions.filter(t => t.id !== selectedTransaction)
    };

    console.log('StudentDashboard -> delete transaction updatedStudent', updatedStudent);
    onUpdateStudent(updatedStudent);
    setDeleteDialogOpen(false);
    setSelectedTransaction(null);
  };

  const openDeleteDialog = (transactionId: string) => {
    setSelectedTransaction(transactionId);
    setDeleteDialogOpen(true);
  };

  const totalDeposits = student.transactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = student.transactions
    .filter(t => t.type === 'withdrawal')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <DashboardLayout
      userName={student.name}
      userRole="Siswa"
      onLogout={onLogout}
    >
      <div className="space-y-6">
        <div>
          <h2>Selamat Datang, {student.name}</h2>
          <p className="text-gray-500">NIS: {student.nim}</p>
        </div>

        <BalanceCard
          balance={student.balance}
          totalDeposits={totalDeposits}
          totalWithdrawals={totalWithdrawals}
        />

        <div className="flex flex-wrap gap-3 hidden">
          <Button onClick={() => setDepositModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Simpanan
          </Button>
          <Button variant="outline" onClick={() => setWithdrawalModalOpen(true)}>
            <Minus className="w-4 h-4 mr-2" />
            Tarik Simpanan
          </Button>
          <Button variant="outline" onClick={() => exportStudentToExcel(student)}>
            <Download className="w-4 h-4 mr-2" />
            Unduh Data Excel
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Riwayat Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500">
                        Belum ada transaksi
                      </TableCell>
                    </TableRow>
                  ) : (
                    student.transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            transaction.type === 'deposit'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.type === 'deposit' ? 'Simpan' : 'Tarik'}
                          </span>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell className="text-right">
                          <span className={transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}>
                            {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(transaction.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <TransactionModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        onSubmit={handleDeposit}
        type="deposit"
        title="Tambah Simpanan"
      />

      <TransactionModal
        isOpen={withdrawalModalOpen}
        onClose={() => setWithdrawalModalOpen(false)}
        onSubmit={handleWithdrawal}
        type="withdrawal"
        title="Tarik Simpanan"
      />

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedTransaction(null);
        }}
        onConfirm={handleDeleteTransaction}
        title="Hapus Transaksi"
        description="Apakah Anda yakin ingin menghapus transaksi ini? Saldo akan disesuaikan secara otomatis."
      />
    </DashboardLayout>
  );
}
