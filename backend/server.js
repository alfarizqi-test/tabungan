// backend/server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// =======================
// PATH KE FILE JSON
// =======================
const alatPath = path.join(__dirname, 'data', 'alat.json');
const duitPath = path.join(__dirname, 'data', 'duit.json');

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// =======================
// API LOGIN
// =======================
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const credentials = loadJson(alatPath);

  const found = credentials.find(
    c => c.username === username && c.password === password
  );

  if (!found) {
    return res.status(401).json({
      success: false,
      message: 'Username / password salah',
    });
  }

  return res.json({
    success: true,
    role: found.role,
    studentId: found.studentId || null,
    name: found.name || null,
  });
});

// =======================
// GET SEMUA SISWA
// =======================
app.get('/api/students', (req, res) => {
  const students = loadJson(duitPath);
  res.json(students);
});

// =======================
// GET 1 SISWA
// =======================
app.get('/api/students/:id', (req, res) => {
  const students = loadJson(duitPath);
  const student = students.find(
    s => String(s.id) === String(req.params.id)
  );

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  res.json(student);
});

// =======================
// TAMBAH TRANSAKSI
// =======================
app.post('/api/students/:id/transactions', (req, res) => {
  const { amount, description, type } = req.body;
  const studentId = req.params.id;

  if (!amount || !description || !['deposit', 'withdrawal'].includes(type)) {
    return res.status(400).json({ message: 'Data transaksi tidak valid' });
  }

  const students = loadJson(duitPath);
  const idx = students.findIndex(
    s => String(s.id) === String(studentId)
  );

  if (idx === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const student = students[idx];

  if (type === 'withdrawal' && student.balance < amount) {
    return res.status(400).json({ message: 'Saldo tidak mencukupi' });
  }

  const newTx = {
    id: `t${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    type,
    amount,
    description,
  };

  const balanceChange = type === 'deposit' ? amount : -amount;

  const updated = {
    ...student,
    balance: student.balance + balanceChange,
    transactions: [newTx, ...student.transactions],
  };

  students[idx] = updated;
  saveJson(duitPath, students);

  res.json(updated);
});

// =======================
// HAPUS TRANSAKSI
// =======================
app.delete('/api/students/:id/transactions/:txId', (req, res) => {
  const { id, txId } = req.params;
  const students = loadJson(duitPath);

  const idx = students.findIndex(
    s => String(s.id) === String(id)
  );

  if (idx === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const student = students[idx];
  const tx = student.transactions.find(t => t.id === txId);

  if (!tx) {
    return res.status(404).json({ message: 'Transaction not found' });
  }

  const balanceAdjustment =
    tx.type === 'deposit' ? -tx.amount : tx.amount;

  const updated = {
    ...student,
    balance: student.balance + balanceAdjustment,
    transactions: student.transactions.filter(t => t.id !== txId),
  };

  students[idx] = updated;
  saveJson(duitPath, students);

  res.json(updated);
});

// =======================
// SERVE FRONTEND (VITE)
// =======================
const frontendPath = path.join(__dirname, '..', 'dist');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
