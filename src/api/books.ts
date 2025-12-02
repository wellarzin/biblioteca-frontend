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

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  copiesTotal: number;
  copiesAvail: number;
  createdAt: string;
  reviews?: Review[];
}

export interface Review {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
  response?: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export async function getBooks(): Promise<Book[]> {
  const response = await api.get('/books') as { data: Book[] };
  return response.data ;
}

export async function getBookById(id: number): Promise<Book> {
  const response = await api.get(`/books/${id}`);
  return response.data as Book;
}

export async function reserveBook(bookId: number) {
  const response = await api.post(`/loans/reserve/${bookId}`);
  return response.data;
}