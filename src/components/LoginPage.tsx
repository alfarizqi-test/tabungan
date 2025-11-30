// src/components/LoginPage.tsx
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  GraduationCap,
  Wallet,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { UserRole } from '../types';
import { Alert, AlertDescription } from './ui/alert';

interface LoginResult {
  success: boolean;
  message: string;
  studentId?: string;
}

interface LoginPageProps {
  onLogin: (role: UserRole, studentId?: string) => void;
  onAttemptLogin: (
    username: string,
    password: string,
    role: UserRole
  ) => Promise<LoginResult> | LoginResult;
}

export function LoginPage({ onLogin, onAttemptLogin }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');

    if (!selectedRole) {
      setError('Silakan pilih role terlebih dahulu');
      return;
    }

    const u = username.trim();
    const p = password;

    if (!u || !p) {
      setError('Username dan password harus diisi');
      return;
    }

    setLoading(true);
    try {
      const result = await Promise.resolve(
        onAttemptLogin(u, p, selectedRole)
      );

      if (!result.success) {
        setError(result.message || 'Login gagal');
        return;
      }

      if (selectedRole === 'student' && result.studentId) {
        onLogin('student', result.studentId);
      } else {
        onLogin('treasurer');
      }
    } catch (e) {
      console.error(e);
      setError('Terjadi kesalahan saat proses login');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <CardTitle>Sistem Tabungan Siswa</CardTitle>
          <CardDescription>Kelas XI TKJ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Pilih Role</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={selectedRole === 'student' ? 'default' : 'outline'}
                className="h-24 flex flex-col gap-2"
                onClick={() => {
                  setSelectedRole('student');
                  setError('');
                  setUsername('');
                  setPassword('');
                }}
              >
                <GraduationCap className="w-6 h-6" />
                <span>Siswa</span>
              </Button>
              <Button
                type="button"
                variant={
                  selectedRole === 'treasurer' ? 'default' : 'outline'
                }
                className="h-24 flex flex-col gap-2"
                onClick={() => {
                  setSelectedRole('treasurer');
                  setError('');
                  setUsername('');
                  setPassword('');
                }}
              >
                <Wallet className="w-6 h-6" />
                <span>Bendahara/Wali Kelas</span>
              </Button>
            </div>
          </div>

          {selectedRole && (
            <>
              <div className="space-y-2">
                <Label htmlFor="username">
                  {selectedRole === 'student'
                    ? 'NIS (Nomor Induk Siswa)'
                    : 'Username'}
                </Label>
                <Input
                  id="username"
                  placeholder={
                    selectedRole === 'student'
                      ? 'Masukkan NIS'
                      : 'Masukkan username'
                  }
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full"
            onClick={handleLogin}
            disabled={
              loading || !selectedRole || !username.trim() || !password.trim()
            }
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </Button>

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg space-y-1 hidden">
            <p className="font-medium">Demo Credentials (sesuai alat.json):</p>
            <p>Siswa: username = NIS, password sesuai file</p>
            <p>Bendahara / Wali Kelas: lihat data/alat.json</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
