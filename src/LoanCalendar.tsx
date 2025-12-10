import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { getMyLoans, Loan } from './api/loans';
import Header from './components/Header';

export default function LoanCalendar() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
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
      // Filtrar apenas empréstimos ativos (BORROWED)
      const activeLoans = data.filter(loan => loan.status === 'BORROWED');
      setLoans(activeLoans);
      setLoading(false);
    } catch (err: any) {
      console.error('Erro ao buscar empréstimos:', err);
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getLoansForDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateToCheck = new Date(year, month, day);
    
    return loans.filter(loan => {
      if (!loan.dueDate) return false;
      const dueDate = new Date(loan.dueDate);
      return (
        dueDate.getDate() === day &&
        dueDate.getMonth() === month &&
        dueDate.getFullYear() === year
      );
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isPastDue = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return checkDate < today && getLoansForDay(day).length > 0;
  };

  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Carregando calendário...</p>
        </div>
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <Header userName={userName} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Calendário de Devoluções</h2>
          <p className="text-gray-600">Acompanhe as datas de devolução dos seus livros</p>
        </div>

        {/* Resumo de Empréstimos Ativos */}
        {loans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Livros Emprestados</p>
                  <p className="text-2xl font-bold text-blue-800">{loans.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Devoluções Próximas (7 dias)</p>
                  <p className="text-2xl font-bold text-yellow-800">
                    {loans.filter(l => l.dueDate && getDaysUntilDue(l.dueDate) <= 7 && getDaysUntilDue(l.dueDate) >= 0).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm text-red-600 font-medium">Atrasados</p>
                  <p className="text-2xl font-bold text-red-800">
                    {loans.filter(l => l.dueDate && getDaysUntilDue(l.dueDate) < 0).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calendário */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header do Calendário */}
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-6 h-6 text-white" />
                <h3 className="text-2xl font-bold text-white capitalize">
                  {formatMonthYear()}
                </h3>
              </div>

              <button
                onClick={nextMonth}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Dias da Semana */}
          <div className="grid grid-cols-7 bg-gray-50 border-b">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="p-3 text-center font-semibold text-gray-600 text-sm">
                {day}
              </div>
            ))}
          </div>

          {/* Grade de Dias */}
          <div className="grid grid-cols-7">
            {/* Dias vazios do início */}
            {emptyDays.map(i => (
              <div key={`empty-${i}`} className="aspect-square border-b border-r border-gray-100 bg-gray-50"></div>
            ))}

            {/* Dias do mês */}
            {days.map(day => {
              const dayLoans = getLoansForDay(day);
              const hasLoans = dayLoans.length > 0;
              const today = isToday(day);
              const pastDue = isPastDue(day);

              return (
                <div
                  key={day}
                  className={`aspect-square border-b border-r border-gray-100 p-2 ${
                    today ? 'bg-blue-50' : ''
                  } ${pastDue ? 'bg-red-50' : ''} hover:bg-orange-50 transition-colors`}
                >
                  <div className="h-full flex flex-col">
                    <span
                      className={`text-sm font-semibold mb-1 ${
                        today ? 'text-blue-600' : pastDue ? 'text-red-600' : 'text-gray-700'
                      }`}
                    >
                      {day}
                    </span>

                    {hasLoans && (
                      <div className="flex-1 space-y-1 overflow-y-auto">
                        {dayLoans.map(loan => (
                          <div
                            key={loan.id}
                            className={`text-xs p-1 rounded ${
                              pastDue
                                ? 'bg-red-200 text-red-800'
                                : 'bg-orange-200 text-orange-800'
                            }`}
                            title={loan.book?.title}
                          >
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{loan.book?.title}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lista de Próximas Devoluções */}
        {loans.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Próximas Devoluções</h3>
            <div className="space-y-3">
              {loans
                .sort((a, b) => {
                  if (!a.dueDate || !b.dueDate) return 0;
                  return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                })
                .map(loan => {
                  const daysLeft = loan.dueDate ? getDaysUntilDue(loan.dueDate) : null;
                  const isOverdue = daysLeft !== null && daysLeft < 0;
                  const isDueSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;

                  return (
                    <div
                      key={loan.id}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                        isOverdue
                          ? 'bg-red-50 border-red-200'
                          : isDueSoon
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className={`w-5 h-5 ${
                          isOverdue ? 'text-red-600' : isDueSoon ? 'text-yellow-600' : 'text-gray-600'
                        }`} />
                        <div>
                          <p className="font-semibold text-gray-800">{loan.book?.title}</p>
                          <p className="text-sm text-gray-600">{loan.book?.author}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className={`font-bold ${
                          isOverdue ? 'text-red-600' : isDueSoon ? 'text-yellow-600' : 'text-gray-700'
                        }`}>
                          {loan.dueDate
                            ? new Date(loan.dueDate).toLocaleDateString('pt-BR')
                            : '-'}
                        </p>
                        {daysLeft !== null && (
                          <p className={`text-sm ${
                            isOverdue ? 'text-red-600' : isDueSoon ? 'text-yellow-600' : 'text-gray-600'
                          }`}>
                            {isOverdue
                              ? `${Math.abs(daysLeft)} dias de atraso`
                              : daysLeft === 0
                              ? 'Vence hoje!'
                              : `Faltam ${daysLeft} dias`}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {loans.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg mt-8">
            <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Você não possui livros emprestados no momento</p>
            <p className="text-gray-500 text-sm mt-2">Reserve um livro para começar!</p>
          </div>
        )}
      </main>
    </div>
  );
}