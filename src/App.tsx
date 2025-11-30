// src/App.tsx
import React, { useEffect, useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { StudentDashboard } from './components/StudentDashboard';
import { TreasurerDashboard } from './components/TreasurerDashboard';
import { Student, UserRole, Transaction } from './types';

const API_BASE = 'http://192.168.1.10:4000';

type LoginResult = {
  success: boolean;
  message: string;
  studentId?: string;
};

function normalizeStudents(raw: any[]): Student[] {
  return (raw || []).map((s: any) => ({
    ...s,
    id: String(s.id),
    transactions: Array.isArray(s.transactions)
      ? s.transactions.map((t: any) => ({ ...t }))
      : [],
    balance:
      typeof s.balance === 'number' ? s.balance : Number(s.balance) || 0,
  }));
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

  // load data siswa dari backend saat mount
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/students`);
        const data = await res.json();
        setStudents(normalizeStudents(data));
      } catch (e) {
        console.error('Gagal load students dari backend', e);
      }
    };
    load();
  }, []);

  const reloadStudents = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/students`);
      const data = await res.json();
      setStudents(normalizeStudents(data));
    } catch (e) {
      console.error('Gagal reload students dari backend', e);
    }
  };

  // ---- Handlers ----
  const handleLogin = (role: UserRole, studentId?: string) => {
    console.log('App.handleLogin called', { role, studentId });
    setUserRole(role);
    setIsLoggedIn(true);
    if (role === 'student' && studentId) {
      setCurrentStudentId(String(studentId));
    } else {
      setCurrentStudentId(null);
    }
  };

  const handleLogout = () => {
    console.log('App.handleLogout');
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentStudentId(null);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    // update hanya di front-end (kalau mau, bisa sekalian kirim ke backend)
    setStudents((prev) =>
      prev.map((s) =>
        String(s.id) === String(updatedStudent.id) ? { ...updatedStudent } : s
      )
    );
  };

  const handleUpdateStudents = (updatedStudents: Student[]) => {
    console.log('App.handleUpdateStudents called ->', updatedStudents);
    setStudents(normalizeStudents(updatedStudents as any[]));
  };

  // dipanggil dari dashboard saat transaksi dibuat
  const handleAddTransaction = async (studentId: string, tx: Transaction) => {
    console.log('App.handleAddTransaction', { studentId, tx });
    try {
      const res = await fetch(
        `${API_BASE}/api/students/${studentId}/transactions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: tx.amount,
            description: tx.description,
            type: tx.type,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        alert(err?.message || 'Gagal menyimpan transaksi ke server');
        return;
      }

      const updatedStudent = (await res.json()) as Student;

      // update state lokal sesuai data dari server
      setStudents((prev) =>
        prev.map((s) =>
          String(s.id) === String(updatedStudent.id) ? updatedStudent : s
        )
      );
    } catch (e) {
      console.error(e);
      alert('Gagal menghubungi server');
    }
  };

  const handleDeleteTransaction = async (studentId: string, txId: string) => {
    console.log('App.handleDeleteTransaction', { studentId, txId });
    try {
      const res = await fetch(
        `${API_BASE}/api/students/${studentId}/transactions/${txId}`,
        {
          method: 'DELETE',
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        alert(err?.message || 'Gagal menghapus transaksi di server');
        return;
      }

      const updatedStudent = (await res.json()) as Student;

      setStudents(prev =>
        prev.map(s =>
          String(s.id) === String(updatedStudent.id) ? updatedStudent : s
        )
      );
    } catch (e) {
      console.error(e);
      alert('Gagal menghubungi server untuk hapus transaksi');
    }
  };

  // ---- attemptLogin: pakai backend /api/login ----
  const attemptLogin = async (
    username: string,
    password: string,
    _roleFromUI?: UserRole
  ): Promise<LoginResult> => {
    console.log('App.attemptLogin ->', {
      username,
      password,
      roleFromUI: _roleFromUI,
    });

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        return { success: false, message: 'Username / password salah' };
      }

      const data = await res.json();
      const role = data.role as UserRole;

      // reload data siswa dari backend setelah login
      await reloadStudents();

      if (role === 'student') {
        const sid = data.studentId;
        handleLogin('student', sid);
        return { success: true, message: 'Login berhasil', studentId: sid };
      } else {
        handleLogin('treasurer');
        return { success: true, message: 'Login berhasil' };
      }
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Gagal menghubungi server' };
    }
  };

  console.log('App render ->', {
    isLoggedIn,
    userRole,
    currentStudentId,
    studentsCount: students.length,
  });

  // ---- Render ----
  if (!isLoggedIn) {
    return (
      <LoginPage
        onLogin={handleLogin}
        onAttemptLogin={attemptLogin}
      />
    );
  }

  if (userRole === 'student' && currentStudentId) {
    const student = students.find(
      (s) => String(s.id) === String(currentStudentId)
    );
    if (!student) return <div>Student not found</div>;
    return (
      <StudentDashboard
        student={student}
        onUpdateStudent={handleUpdateStudent}
        onLogout={handleLogout}
        onAddTransaction={handleAddTransaction}
        //onDeleteTransaction={handleDeleteTransaction}
      />
    );
  }

  if (userRole === 'treasurer') {
    return (
      <TreasurerDashboard
        students={students}
        onUpdateStudents={handleUpdateStudents}
        onLogout={handleLogout}
        onAddTransaction={handleAddTransaction}
        onDeleteTransaction={handleDeleteTransaction}
      />
    );
  }

  return null;
}

export default App;
