import React, { useState, useEffect } from 'react';
import { BookOpen, Mail, Lock, User, ArrowRight, BookMarked } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { login, register } from './api/auth';

interface AuthResponse {
  token?: string;
  user?: {
    id?: string;
    name?: string;
    email: string;
    role?: 'USER' | 'ADMIN';
  };
  message?: string;
}

export default function LibraryAuth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/books');
    }
  }, [navigate]);

  const handleSubmit = async () => {
    setMessage('');
    setIsError(false);
    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await login(formData.email, formData.password) as AuthResponse;
        console.log('Login response:', response);

        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user || { email: formData.email }));
        }
        
        setMessage('✓ Login realizado com sucesso! Redirecionando...');
        setIsError(false);

        setTimeout(() => {
          if (response.user?.role === 'ADMIN') {
            navigate('/admin/dashboard');
          } else {
            navigate('/books');
          }
        }, 1500);
      } else {
        const response = await register(formData.name, formData.email, formData.password) as AuthResponse;
        console.log('Register response:', response);

        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user || { name: formData.name, email: formData.email }));
          
          setMessage('✓ Cadastro realizado com sucesso! Redirecionando...');

          setTimeout(() => {
            if (response.user?.role === 'ADMIN') {
              navigate('/admin/dashboard');
            } else {
              navigate('/books');
            }
          }, 1500);
        } else {
          setMessage('✓ Cadastro realizado! Faça login para continuar.');
          setTimeout(() => {
            setIsLogin(true);
            setFormData({ email: formData.email, password: '', name: '' });
            setMessage('');
          }, 2000);
        }
      }

      setTimeout(() => {
        setFormData({ email: '', password: '', name: '' });
        setMessage('');
      }, 3000);
    } catch (error: any) {
      setIsError(true);
      console.error('Erro:', error);
    
      if (error.response) {
        const errorMessage = error.response.data.message || error.response.data.error;
        setMessage(errorMessage || 'Erro ao processar requisição');
      } else if (error.request) {
        setMessage('Erro de conexão. Verifique sua internet.');
      } else {
        setMessage('Erro inesperado. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl shadow-lg mb-4 transform hover:scale-105 transition-transform">
            <BookMarked className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Biblioteca</h1>
          <p className="text-gray-600">Seu universo de conhecimento</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm bg-opacity-95">
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
            <button
              onClick={() => { 
                setIsLogin(true); 
                setFormData({ email: '', password: '', name: '' }); 
                setMessage(''); 
                setIsError(false);
              }}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                isLogin
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Login
            </button>
            <button
              onClick={() => { 
                setIsLogin(false); 
                setFormData({ email: '', password: '', name: '' }); 
                setMessage(''); 
                setIsError(false);
              }}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                !isLogin
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Cadastro
            </button>
          </div>

          <div className="space-y-5">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Nome completo"
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder="Email"
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder="Senha"
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  disabled={isLoading}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors disabled:opacity-50"
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}

            {message && (
              <div className={`border-2 px-4 py-3 rounded-xl text-center font-medium ${
                isError 
                  ? 'bg-red-50 border-red-200 text-red-700' 
                  : 'bg-green-50 border-green-200 text-green-700'
              }`}>
                {message}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Entrar' : 'Criar conta'}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
              <button
                onClick={() => { 
                  setIsLogin(!isLogin); 
                  setFormData({ email: '', password: '', name: '' }); 
                  setMessage(''); 
                  setIsError(false);
                }}
                disabled={isLoading}
                className="text-orange-600 font-semibold hover:text-orange-700 transition-colors disabled:opacity-50"
              >
                {isLogin ? 'Cadastre-se' : 'Faça login'}
              </button>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-gray-600 text-sm flex items-center justify-center gap-2">
          <BookOpen className="w-4 h-4" />
          <span>Acesse milhares de livros e recursos</span>
        </div>
      </div>
    </div>
  );
}