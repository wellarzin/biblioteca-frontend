import React, { useState, useEffect } from 'react';
import { BookOpen, Check, X, Clock, AlertCircle, User, Calendar } from 'lucide-react';
import { getAllLoans, approveLoan, rejectLoan, Loan } from './api/loans';
import Header from './components/Header';

export default function AdminLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | Loan['status']>('ALL');
  const [rejectModal, setRejectModal] = useState<{ show: boolean; loanId: number | null; adminNote: string }>({
    show: false,
    loanId: null,
    adminNote: '',
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.name || user.email);
    }

    fetchLoans();
  }, []);

  useEffect(() => {
    if (filterStatus === 'ALL') {
      setFilteredLoans(loans);
    } else {
      setFilteredLoans(loans.filter(loan => loan.status === filterStatus));
    }
  }, [filterStatus, loans]);

  const fetchLoans = async () => {
    try {
      const data = await getAllLoans();
      setLoans(data);
      setFilteredLoans(data);
      setLoading(false);
    } catch (err: any) {
      console.error('Erro ao buscar empréstimos:', err);
      setError('Erro ao carregar propostas. Tente novamente.');
      setLoading(false);
    }
  };

  const handleApprove = async (loanId: number) => {
    if (window.confirm('Deseja aprovar esta proposta?')) {
      try {
        await approveLoan(loanId);
        alert('Proposta aprovada com sucesso!');
        fetchLoans();
      } catch (err: any) {
        console.error('Erro ao aprovar:', err);
        alert(err.response?.data?.message || 'Erro ao aprovar proposta');
      }
    }
  };

  const handleRejectClick = (loanId: number) => {
    setRejectModal({ show: true, loanId, adminNote: '' });
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal.loanId) return;

    try {
      await rejectLoan(rejectModal.loanId, rejectModal.adminNote || undefined);
      alert('Proposta rejeitada!');
      setRejectModal({ show: false, loanId: null, adminNote: '' });
      fetchLoans();
    } catch (err: any) {
      console.error('Erro ao rejeitar:', err);
      alert(err.response?.data?.message || 'Erro ao rejeitar proposta');
    }
  };

  const getStatusBadge = (status: Loan['status']) => {
    const badges = {
      RESERVED: { text: 'Pendente', class: 'bg-yellow-100 text-yellow-800' },
      BORROWED: { text: 'Emprestado', class: 'bg-green-100 text-green-800' },
      RETURNED: { text: 'Devolvido', class: 'bg-blue-100 text-blue-800' },
      REJECTED: { text: 'Rejeitado', class: 'bg-red-100 text-red-800' },
      CANCELLED: { text: 'Cancelado', class: 'bg-gray-100 text-gray-800' },
    };

    const badge = badges[status];

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badge.class}`}>
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

  const getPendingCount = () => loans.filter(l => l.status === 'RESERVED').length;

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
      <Header userName={`Admin: ${userName}`} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Gerenciar Propostas</h2>
          <p className="text-gray-600">
            {getPendingCount()} propostas pendentes de aprovação
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filterStatus === 'ALL'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Todas ({loans.length})
          </button>
          <button
            onClick={() => setFilterStatus('RESERVED')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filterStatus === 'RESERVED'
                ? 'bg-yellow-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Pendentes ({loans.filter(l => l.status === 'RESERVED').length})
          </button>
          <button
            onClick={() => setFilterStatus('BORROWED')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filterStatus === 'BORROWED'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Aprovadas ({loans.filter(l => l.status === 'BORROWED').length})
          </button>
          <button
            onClick={() => setFilterStatus('REJECTED')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filterStatus === 'REJECTED'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Rejeitadas ({loans.filter(l => l.status === 'REJECTED').length})
          </button>
        </div>

        {/* Lista de Propostas */}
        {filteredLoans.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Nenhuma proposta encontrada</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Usuário</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Livro</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Data</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLoans.map((loan) => (
                    <tr key={loan.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-800">{loan.user?.name}</p>
                            <p className="text-sm text-gray-500">{loan.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-orange-600" />
                          <div>
                            <p className="font-medium text-gray-800">{loan.book?.title}</p>
                            <p className="text-sm text-gray-500">{loan.book?.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{formatDate(loan.createdAt)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {getStatusBadge(loan.status)}
                      </td>
                      <td className="py-4 px-4">
                        {loan.status === 'RESERVED' && (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleApprove(loan.id)}
                              className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                              title="Aprovar"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleRejectClick(loan.id)}
                              className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                              title="Rejeitar"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Rejeição */}
      {rejectModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Rejeitar Proposta</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo da rejeição (opcional)
              </label>
              <textarea
                value={rejectModal.adminNote}
                onChange={(e) => setRejectModal({ ...rejectModal, adminNote: e.target.value })}
                placeholder="Ex: Livro já está emprestado para outro usuário..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setRejectModal({ show: false, loanId: null, adminNote: '' })}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRejectConfirm}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Rejeitar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}