// src/components/TransactionModal.tsx
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, description: string) => void;
  type: 'deposit' | 'withdrawal';
  title: string;
}

export function TransactionModal({ isOpen, onClose, onSubmit, type, title }: TransactionModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // reset fields when modal opens
      setAmount('');
      setDescription('');
      setError(null);
    }
  }, [isOpen]);

  const parseAmount = (txt: string) => {
    // Terima format "50.000" atau "50,000" atau "50000"
    const cleaned = String(txt).replace(/[^\d.,-]/g, '').replace(',', '.');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : NaN;
  };

  const handleSubmit = (e?: React.MouseEvent | React.FormEvent) => {
    if (e && 'preventDefault' in e) e.preventDefault();
    setError(null);

    const num = parseAmount(amount);
    if (!Number.isFinite(num) || num <= 0) {
      setError('Masukkan jumlah yang valid (lebih dari 0).');
      return;
    }

    if (!description.trim()) {
      setError('Keterangan harus diisi.');
      return;
    }

    onSubmit(num, description.trim());
    // reset & close
    setAmount('');
    setDescription('');
    setError(null);
    onClose();
  };

  const handleClose = () => {
    setAmount('');
    setDescription('');
    setError(null);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // submit on Enter (but avoid when focus is on multiline textarea)
      const target = e.target as HTMLElement;
      if (target.tagName.toLowerCase() !== 'textarea') {
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className="space-y-4 py-4" onKeyDown={handleKeyDown}>
            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah (Rp)</Label>
              <Input
                id="amount"
                type="text"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="numeric"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Keterangan</Label>
              <Textarea
                id="description"
                placeholder="Masukkan keterangan transaksi"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={handleClose}>
              Batal
            </Button>
            <Button
              type="submit"
              onClick={(e) => { /* handled by form submit */ }}
              disabled={!(parseAmount(amount) > 0 && description.trim())}
            >
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TransactionModal;
