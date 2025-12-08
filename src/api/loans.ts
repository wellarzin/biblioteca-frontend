import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers!.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type LoanStatus = 'RESERVED' | 'BORROWED' | 'RETURNED' | 'CANCELLED' | 'REJECTED';
export type LoanType = 'LOAN' | 'RESERVATION';

export interface Loan {
  id: number;
  userId: number;
  bookId: number;
  type: LoanType;
  status: LoanStatus;
  startDate?: string;
  dueDate?: string;
  returnDate?: string;
  createdAt: string;
  adminNote?: string;
  book?: {
    id: number;
    title: string;
    author: string;
    isbn?: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

// Buscar todos os empréstimos do usuário
export async function getMyLoans(): Promise<Loan[]> {
  const response = await api.get('/loans');
  return response.data as Loan[];
}

// Buscar todos os empréstimos (admin)
export async function getAllLoans(): Promise<Loan[]> {
  const response = await api.get('/loans');
  return response.data as Loan[];
}

// Aprovar empréstimo (admin)
export async function approveLoan(loanId: number) {
  const response = await api.post(`/loans/approve/${loanId}`);
  return response.data;
}

// Rejeitar empréstimo (criar endpoint no backend)
export async function rejectLoan(loanId: number, adminNote?: string) {
  const response = await api.post(`/loans/reject/${loanId}`, { adminNote });
  return response.data;
}

// Devolver livro
export async function returnBook(loanId: number) {
  const response = await api.post(`/loans/return/${loanId}`);
  return response.data;
}