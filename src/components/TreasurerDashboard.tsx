// src/components/TreasurerDashboard.tsx
import React, { useState, Fragment } from 'react';
import { Student, Transaction } from '../types';
import { DashboardLayout } from './DashboardLayout';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Download, Plus, Minus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { TransactionModal } from './TransactionModal';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { exportAllStudentsToExcel } from '../utils/excelExport';

interface TreasurerDashboardProps {
  students: Student[];
  onUpdateStudents: (students: Student[]) => void;
  onLogout: () => void;
  onAddTransaction?: (studentId: string, tx: Transaction) => void;
  onDeleteTransaction?: (studentId: string, txId: string) => void; // ✅ baru
}

export function TreasurerDashboard({
  students,
  onUpdateStudents,
  onLogout,
  onAddTransaction,
  onDeleteTransaction,
}: TreasurerDashboardProps) {
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ studentId: string; transactionId: string } | null>(null);

  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number' || Number.isNaN(amount)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const toggleExpand = (studentId: string) => {
    setExpandedStudent((prev) => (prev === studentId ? null : studentId));
  };

  const openTransactionModal = (studentId: string, type: 'deposit' | 'withdrawal') => {
    setSelectedStudentId(studentId);
    setModalType(type);
    setModalOpen(true);
  };

  const handleTransaction = (amount: number, description: string) => {
    if (!selectedStudentId) return;

    const newTransaction: Transaction = {
      id: `t${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: modalType,
      amount,
      description,
    };

    // ✅ kalau App kasih handler, lempar ke App (backend)
    if (onAddTransaction) {
      console.log('TreasurerDashboard -> delegating onAddTransaction', {
        studentId: selectedStudentId,
        tx: newTransaction,
      });
      onAddTransaction(String(selectedStudentId), newTransaction);
      setModalOpen(false);
      setSelectedStudentId(null);
      return;
    }

    // fallback lama: cuma update state lokal
    const updatedStudents = students.map((student) => {
      if (String(student.id) === String(selectedStudentId)) {
        if (modalType === 'withdrawal' && student.balance < amount) {
          alert('Saldo tidak mencukupi!');
          return student;
        }
        const balanceChange = modalType === 'deposit' ? amount : -amount;
        return {
          ...student,
          balance: student.balance + balanceChange,
          transactions: [newTransaction, ...student.transactions],
        };
      }
      return student;
    });

    console.log('TreasurerDashboard: updatedStudents (preview) ->', updatedStudents);
    onUpdateStudents(updatedStudents);
    setModalOpen(false);
    setSelectedStudentId(null);
  };

  const openDeleteDialog = (studentId: string, transactionId: string) => {
    setDeleteTarget({ studentId, transactionId });
    setDeleteDialogOpen(true);
  };

  const handleDeleteTransaction = () => {
    if (!deleteTarget) return;

    // ✅ kalau App menyediakan handler hapus (backend), pakai itu
    if (onDeleteTransaction) {
      console.log('TreasurerDashboard -> delegating delete to onDeleteTransaction', deleteTarget);
      onDeleteTransaction(deleteTarget.studentId, deleteTarget.transactionId);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      return;
    }

    // fallback lama: hanya ubah state lokal (tidak menyentuh backend)
    const updatedStudents = students.map((student) => {
      if (String(student.id) === String(deleteTarget.studentId)) {
        const transaction = student.transactions.find((t) => t.id === deleteTarget.transactionId);
        if (!transaction) return student;

        const balanceAdjustment =
          transaction.type === 'deposit' ? -transaction.amount : transaction.amount;

        return {
          ...student,
          balance: student.balance + balanceAdjustment,
          transactions: student.transactions.filter((t) => t.id !== deleteTarget.transactionId),
        };
      }
      return student;
    });

    console.log('TreasurerDashboard.handleDeleteTransaction ->', updatedStudents);
    onUpdateStudents(updatedStudents);
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const totalClassBalance = (students || []).reduce((sum, s) => sum + (s.balance || 0), 0);
  const totalStudents = students?.length || 0;
  const totalTransactions = (students || []).reduce(
    (sum, s) => sum + (s.transactions?.length || 0),
    0
  );

  return (
    <DashboardLayout userName="Bendahara/Wali Kelas" userRole="Administrator" onLogout={onLogout}>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2>Dashboard Bendahara</h2>
            <p className="text-gray-500">Kelola data tabungan seluruh siswa</p>
          </div>
          <Button onClick={() => exportAllStudentsToExcel(students)}>
            <Download className="w-4 h-4 mr-2" />
            Unduh Semua Data
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Saldo Kelas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{formatCurrency(totalClassBalance)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Siswa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{totalStudents} Siswa</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Transaksi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{totalTransactions}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Data Tabungan Siswa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>NIS</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="text-center">Transaksi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(students || []).map((student) => (
                    <Fragment key={student.id}>
                      <TableRow className="cursor-pointer hover:bg-gray-50">
                        <TableCell onClick={() => toggleExpand(student.id)}>
                          {expandedStudent === student.id ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </TableCell>
                        <TableCell onClick={() => toggleExpand(student.id)}>{student.nim}</TableCell>
                        <TableCell onClick={() => toggleExpand(student.id)}>{student.name}</TableCell>
                        <TableCell className="text-right" onClick={() => toggleExpand(student.id)}>
                          {formatCurrency(student.balance)}
                        </TableCell>
                        <TableCell className="text-center" onClick={() => toggleExpand(student.id)}>
                          {student.transactions.length}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openTransactionModal(student.id, 'deposit')}
                            >
                              <Plus className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openTransactionModal(student.id, 'withdrawal')}
                            >
                              <Minus className="w-4 h-4 text-orange-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {expandedStudent === student.id && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-gray-50 p-0">
                            <div className="p-4">
                              <h4 className="mb-3">Riwayat Transaksi</h4>
                              {student.transactions.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">Belum ada transaksi</p>
                              ) : (
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
                                    {student.transactions.map((transaction) => (
                                      <TableRow key={transaction.id}>
                                        <TableCell>{formatDate(transaction.date)}</TableCell>
                                        <TableCell>
                                          <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                              transaction.type === 'deposit'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}
                                          >
                                            {transaction.type === 'deposit' ? 'Simpan' : 'Tarik'}
                                          </span>
                                        </TableCell>
                                        <TableCell>{transaction.description}</TableCell>
                                        <TableCell className="text-right">
                                          <span
                                            className={
                                              transaction.type === 'deposit'
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                            }
                                          >
                                            {transaction.type === 'deposit' ? '+' : '-'}
                                            {formatCurrency(transaction.amount)}
                                          </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              openDeleteDialog(student.id, transaction.id)
                                            }
                                          >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedStudentId(null);
        }}
        onSubmit={handleTransaction}
        type={modalType}
        title={modalType === 'deposit' ? 'Tambah Simpanan' : 'Tarik Simpanan'}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteTransaction}
        title="Hapus Transaksi"
        description="Apakah Anda yakin ingin menghapus transaksi ini? Saldo akan disesuaikan secara otomatis."
      />
    </DashboardLayout>
  );
}
