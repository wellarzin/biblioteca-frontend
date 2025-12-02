import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api/auth',
  withCredentials: true,
});

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string; 
  };
  message?: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await api.post('/login', { email, password }) as { data: LoginResponse };
  return response.data;
}

export async function register(name: string, email: string, password: string): Promise<LoginResponse> {
  const response = await api.post('/register', { name, email, password }) as { data: LoginResponse };
  return response.data;
}