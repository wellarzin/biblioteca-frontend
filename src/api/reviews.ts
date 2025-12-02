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

export interface CreateReviewData {
  rating: number;
  comment?: string;
}

export async function createReview(bookId: number, data: CreateReviewData) {
  const response = await api.post(`/reviews/${bookId}`, data);
  return response.data;
}

export async function getBookReviews(bookId: number): Promise<Review[]> {
  const response = await api.get(`/reviews/book/${bookId}`);
  return response.data as Review[];
}