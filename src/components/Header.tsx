import React from 'react';
import { BookMarked, LogOut, User, ClipboardList } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  userName: string;
}

export default function Header({ userName }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = userName.startsWith('Admin:');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center">
            <BookMarked className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Biblioteca</h1>
            <p className="text-sm text-gray-600">Explore nosso acervo</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!isAdmin && location.pathname === '/books' && (
            <button
              onClick={() => navigate('/my-loans')}
              className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <ClipboardList className="w-5 h-5" />
              <span>Minhas Propostas</span>
            </button>
          )}
          
          {!isAdmin && location.pathname === '/my-loans' && (
            <button
              onClick={() => navigate('/books')}
              className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <BookMarked className="w-5 h-5" />
              <span>Biblioteca</span>
            </button>
          )}

          {isAdmin && location.pathname === '/admin/dashboard' && (
            <button
              onClick={() => navigate('/admin/loans')}
              className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <ClipboardList className="w-5 h-5" />
              <span>Propostas</span>
            </button>
          )}

          {isAdmin && location.pathname === '/admin/loans' && (
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <BookMarked className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
          )}

          <div className="flex items-center gap-2 text-gray-700">
            <User className="w-5 h-5" />
            <span className="font-medium">{userName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}