import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { getMyLoans, Loan } from './api/loans';
import Header from './components/Header';

export default function MyLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.name || user.email);
    }

    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const data = await getMyLoans();
      setLoans(data);
      setLoading(false);
    } catch (err: any) {
      console.error('Erro ao buscar empréstimos:', err);
      setError('Erro ao carregar propostas. Tente novamente.');
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Loan['status']) => {
    const badges = {
      RESERVED: { icon: Clock, text: 'Aguardando Aprovação', class: 'bg-yellow-100 text-yellow-800' },
      BORROWED: { icon: CheckCircle, text: 'Aprovado - Emprestado', class: 'bg-green-100 text-green-800' },
      RETURNED: { icon: CheckCircle, text: 'Devolvido', class: 'bg-blue-100 text-blue-800' },
      REJECTED: { icon: XCircle, text: 'Rejeitado', class: 'bg-red-100 text-red-800' },
      CANCELLED: { icon: XCircle, text: 'Cancelado', class: 'bg-gray-100 text-gray-800' },
    };

    const badge = badges[status];
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${badge.class}`}>
        <Icon className="w-4 h-4" />
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Carregando propostas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <Header userName={userName} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Minhas Propostas</h2>
          <p className="text-gray-600">Acompanhe o status das suas reservas</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {loans.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Você ainda não fez nenhuma proposta</p>
            <p className="text-gray-500 text-sm mt-2">Navegue pela biblioteca e reserve um livro!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {loans.map((loan) => (
              <div key={loan.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{loan.book?.title}</h3>
                      <p className="text-gray-600">por {loan.book?.author}</p>
                    </div>
                    {getStatusBadge(loan.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-5 h-5" />
                      <div>
                        <p className="text-xs text-gray-500">Data da Solicitação</p>
                        <p className="font-medium">{formatDate(loan.createdAt)}</p>
                      </div>
                    </div>

                    {loan.startDate && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-5 h-5" />
                        <div>
                          <p className="text-xs text-gray-500">Data de Início</p>
                          <p className="font-medium">{formatDate(loan.startDate)}</p>
                        </div>
                      </div>
                    )}

                    {loan.dueDate && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-5 h-5" />
                        <div>
                          <p className="text-xs text-gray-500">Data de Devolução</p>
                          <p className="font-medium">{formatDate(loan.dueDate)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {loan.adminNote && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                      <p className="text-sm font-semibold text-red-800 mb-1">Nota do Administrador:</p>
                      <p className="text-sm text-red-700">{loan.adminNote}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}