// src/components/DashboardLayout.tsx
import React, { ReactNode, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { LogOut, Menu, X, Wallet } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  userName: string;
  userRole: string;
  onLogout: () => void;
}

export function DashboardLayout({ children, userName, userRole, onLogout }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // close sidebar on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // if the window is resized to large (desktop), ensure sidebar overlay is closed
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-semibold">Sistem Tabungan Siswa</h1>
                <p className="text-xs text-gray-500">Kelas XI TKJ 3</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm">{userName}</p>
              <p className="text-xs text-gray-500">{userRole}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Logout">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          role="button"
          aria-label="Tutup sidebar"
        />
      )}

      {/* Sidebar (mobile only) - placeholder for future nav */}
      {sidebarOpen && (
        <aside className="fixed left-0 top-0 z-50 h-full w-64 bg-white border-r lg:hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-medium">{userName}</div>
                <div className="text-xs text-gray-500">{userRole}</div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} aria-label="Tutup sidebar">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* TODO: letakkan navigasi / link di sini */}
          <nav className="p-4 space-y-2">
            {/* contoh: */}
            {/* <a className="block px-3 py-2 rounded hover:bg-gray-100">Dashboard</a> */}
            <div className="text-sm text-gray-500">Navigasi (kosong)</div>
          </nav>
        </aside>
      )}

      {/* Main Content */}
      <main className="container mx-auto p-4 lg:p-6">
        {children}
      </main>
    </div>
  );
}
