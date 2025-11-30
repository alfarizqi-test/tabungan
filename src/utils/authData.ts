export interface LoginCredentials {
  username: string;
  password: string;
  role: 'student' | 'treasurer';
  studentId?: string;
  name?: string;
}

// Mock credentials database
export const credentials: LoginCredentials[] = [
  // Students - username is their NIS, password is default
  {
    username: '2023001',
    password: 'ahmad123',
    role: 'student',
    studentId: '1',
    name: 'Ahmad Rizki'
  },
  {
    username: '2023002',
    password: 'siti123',
    role: 'student',
    studentId: '2',
    name: 'Siti Nurhaliza'
  },
  {
    username: '2023003',
    password: 'budi123',
    role: 'student',
    studentId: '3',
    name: 'Budi Santoso'
  },
  {
    username: '2023004',
    password: 'dewi123',
    role: 'student',
    studentId: '4',
    name: 'Dewi Lestari'
  },
  {
    username: '2023005',
    password: 'eko123',
    role: 'student',
    studentId: '5',
    name: 'Eko Prasetyo'
  },
  // Treasurer/Homeroom Teacher
  {
    username: 'bendahara',
    password: 'bendahara2025',
    role: 'treasurer',
    name: 'Bendahara Kelas XI TKJ'
  },
  {
    username: 'walikelas',
    password: 'walikelas2025',
    role: 'treasurer',
    name: 'Wali Kelas XI TKJ'
  }
];

export const validateLogin = (username: string, password: string, role: 'student' | 'treasurer'): LoginCredentials | null => {
  const user = credentials.find(
    cred => cred.username === username && cred.password === password && cred.role === role
  );
  return user || null;
};
