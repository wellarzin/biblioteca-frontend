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

export interface DashboardStats {
  totalLoans: number;
  totalBooks: number;
  totalUsers: number;
  activeLoans: number;
  availableBooks: number;
}

export interface CreateBookData {
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  copiesTotal: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [loans, books, users] = await Promise.all([
      api.get('/loans'),
      api.get('/books'),
      api.get('/users'),
    ]);

    const totalLoans = (loans.data as any[]).length;
    const totalBooks = (books.data as any[]).length;
    const totalUsers = (users.data as any[]).length;
    const activeLoans = (loans.data as any[]).filter((loan: any) => loan.status === 'BORROWED').length;
    const availableBooks = (books.data as any[]).reduce((sum: number, book: any) => sum + book.copiesAvail, 0);

    return {
      totalLoans,
      totalBooks,
      totalUsers,
      activeLoans,
      availableBooks,
    };
  } catch (error) {
    console.error('Erro ao buscar stats:', error);
    throw error;
  }
}

export async function getAllBooksAdmin() {
  const response = await api.get('/books');
  return response.data;
}

export async function createBook(data: CreateBookData) {
  const response = await api.post('/books', data);
  return response.data;
}

export async function updateBook(id: number, data: Partial<CreateBookData>) {
  const response = await api.put(`/books/${id}`, data);
  return response.data;
}

export async function deleteBook(id: number) {
  const response = await api.delete(`/books/${id}`);
  return response.data;
}

export async function getAllLoans() {
  const response = await api.get('/loans');
  return response.data;
}

export async function approveLoan(loanId: number) {
  const response = await api.post(`/loans/approve/${loanId}`);
  return response.data;
}

export async function getAllUsers() {
  const response = await api.get('/users');
  return response.data;
}