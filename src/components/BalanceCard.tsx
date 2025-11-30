import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface BalanceCardProps {
  balance: number;
  totalDeposits?: number;
  totalWithdrawals?: number;
}

export function BalanceCard({ balance, totalDeposits, totalWithdrawals }: BalanceCardProps) {
  const formatCurrency = (amount: number | undefined) => {
    if (typeof amount !== 'number' || isNaN(amount)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Saldo */}
      <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Saldo</CardTitle>
          <Wallet className="w-5 h-5 opacity-80" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{formatCurrency(balance)}</div>
        </CardContent>
      </Card>

      {/* Total Simpanan */}
      {totalDeposits !== undefined && (
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Simpanan</CardTitle>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(totalDeposits)}</div>
          </CardContent>
        </Card>
      )}

      {/* Total Penarikan */}
      {totalWithdrawals !== undefined && (
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Penarikan</CardTitle>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(totalWithdrawals)}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
