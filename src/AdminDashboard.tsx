import React, { useState, useEffect } from 'react';
import { BookOpen, Users, TrendingUp, Package, Plus, Trash2, AlertCircle } from 'lucide-react';
import { getDashboardStats, getAllBooksAdmin, createBook, deleteBook, DashboardStats } from './api/admin';
import { Book } from './api/books';
import Header from './components/Header';
import StatsCard from './components/StatsCard';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLoans: 0,
    totalBooks: 0,
    totalUsers: 0,
    activeLoans: 0,
    availableBooks: 0,
  });
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    copiesTotal: 1,
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.name || user.email);
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError('');
      const [statsData, booksData] = await Promise.all([
        getDashboardStats(),
        getAllBooksAdmin(),
      ]);
      setStats(statsData);
      setBooks(booksData as Book[]);
      setLoading(false);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados. Tente novamente.');
      setLoading(false);
    }
  };

  const handleAddBook = async () => {
    if (!newBook.title || !newBook.author) {
      alert('Título e Autor são obrigatórios!');
      return;
    }

    try {
      await createBook({
        ...newBook,
        isbn: newBook.isbn || undefined,
        description: newBook.description || undefined,
      });
      alert('Livro adicionado com sucesso!');
      setShowAddModal(false);
      setNewBook({ title: '', author: '', isbn: '', description: '', copiesTotal: 1 });
      fetchData();
    } catch (error: any) {
      console.error('Erro ao adicionar livro:', error);
      alert(error.response?.data?.message || 'Erro ao adicionar livro');
    }
  };

  const handleDeleteBook = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar este livro?')) {
      try {
        await deleteBook(id);
        alert('Livro deletado com sucesso!');
        fetchData();
      } catch (error: any) {
        console.error('Erro ao deletar livro:', error);
        alert(error.response?.data?.message || 'Erro ao deletar livro');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <Header userName={`Admin: ${userName}`} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Administrativo</h2>
          <p className="text-gray-600">Visão geral do sistema</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total de Empréstimos"
            value={stats.totalLoans}
            icon={TrendingUp}
            color="blue"
          />
          <StatsCard
            title="Livros no Estoque"
            value={stats.totalBooks}
            icon={BookOpen}
            color="green"
          />
          <StatsCard
            title="Usuários Cadastrados"
            value={stats.totalUsers}
            icon={Users}
            color="purple"
          />
          <StatsCard
            title="Livros Disponíveis"
            value={stats.availableBooks}
            icon={Package}
            color="orange"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Visão Geral</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 font-medium">Empréstimos Ativos</span>
                  <span className="text-gray-800 font-bold">{stats.activeLoans}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min((stats.activeLoans / stats.totalLoans) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 font-medium">Livros Disponíveis</span>
                  <span className="text-gray-800 font-bold">{stats.availableBooks}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min((stats.availableBooks / (stats.totalBooks * 2)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 font-medium">Total de Usuários</span>
                  <span className="text-gray-800 font-bold">{stats.totalUsers}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min((stats.totalUsers / 50) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Distribuição</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {Math.round((stats.activeLoans / stats.totalLoans) * 100) || 0}%
                </div>
                <div className="text-sm text-gray-600">Empréstimos Ativos</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {Math.round((stats.availableBooks / stats.totalBooks) * 100) || 0}%
                </div>
                <div className="text-sm text-gray-600">Taxa de Disponibilidade</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {stats.totalBooks}
                </div>
                <div className="text-sm text-gray-600">Livros Cadastrados</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {stats.totalUsers}
                </div>
                <div className="text-sm text-gray-600">Usuários Ativos</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Gerenciar Livros</h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Adicionar Livro
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Título</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Autor</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ISBN</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Disponíveis</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Total</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {books.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhum livro cadastrado. Adicione o primeiro!
                    </td>
                  </tr>
                ) : (
                  books.map((book) => (
                    <tr key={book.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{book.title}</td>
                      <td className="py-3 px-4 text-gray-600">{book.author}</td>
                      <td className="py-3 px-4 text-gray-600">{book.isbn || '-'}</td>
                      <td className="py-3 px-4 text-center font-semibold text-green-600">
                        {book.copiesAvail}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600">{book.copiesTotal}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Deletar livro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Adicionar Novo Livro</h3>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Título *"
                value={newBook.title}
                onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
              />
              
              <input
                type="text"
                placeholder="Autor *"
                value={newBook.author}
                onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
              />
              
              <input
                type="text"
                placeholder="ISBN"
                value={newBook.isbn}
                onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
              />
              
              <textarea
                placeholder="Descrição"
                value={newBook.description}
                onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none resize-none"
              />
              
              <input
                type="number"
                placeholder="Número de cópias *"
                value={newBook.copiesTotal}
                onChange={(e) => setNewBook({ ...newBook, copiesTotal: parseInt(e.target.value) || 1 })}
                min="1"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddBook}
                disabled={!newBook.title || !newBook.author}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}