import React, { useState, useEffect } from 'react';
import { X, BookOpen, Calendar, User, MessageSquare, Send } from 'lucide-react';
import { Book } from '../api/books';
import { getBookReviews, createReview, Review } from '../api/reviews';
import StarRating from './StarRating';

interface BookDetailModalProps {
  book: Book;
  onClose: () => void;
  onReserve: (bookId: number) => void;
}

export default function BookDetailModal({ book, onClose, onReserve }: BookDetailModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
  });

  useEffect(() => {
    fetchReviews();
  }, [book.id]);

  const fetchReviews = async () => {
    try {
      const data = await getBookReviews(book.id);
      setReviews(data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (newReview.rating === 0) {
      alert('Por favor, selecione uma classificação!');
      return;
    }

    try {
      await createReview(book.id, {
        rating: newReview.rating,
        comment: newReview.comment || undefined,
      });
      alert('Avaliação enviada com sucesso!');
      setNewReview({ rating: 0, comment: '' });
      setShowReviewForm(false);
      fetchReviews();
    } catch (error: any) {
      console.error('Erro ao enviar avaliação:', error);
      alert(error.response?.data?.message || 'Erro ao enviar avaliação');
    }
  };

 const calculateAvgRating = () => {
    if (reviews.length === 0) {
        return '0.0'; 
    }
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
};

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-amber-100 to-orange-100 p-8 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-24 h-32 bg-white rounded-lg shadow-lg flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-orange-600 opacity-50" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{book.title}</h2>
              <p className="text-lg text-gray-600 mb-3">por {book.author}</p>
              <div className="flex items-center gap-3">
                <StarRating rating={parseFloat(calculateAvgRating())} readonly size="md" />
                <span className="text-sm text-gray-600">
                  {calculateAvgRating()} ({reviews.length} avaliações)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          {/* Book Info */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span>ISBN: {book.isbn || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <BookOpen className="w-5 h-5" />
                <span>Disponíveis: {book.copiesAvail} / {book.copiesTotal}</span>
              </div>
            </div>

            {book.description && (
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-2">Descrição</h3>
                <p className="text-gray-600 leading-relaxed">{book.description}</p>
              </div>
            )}

            <button
              onClick={() => onReserve(book.id)}
              disabled={book.copiesAvail === 0}
              className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                book.copiesAvail > 0
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              {book.copiesAvail > 0 ? 'Reservar Livro' : 'Indisponível'}
            </button>
          </div>

          {/* Reviews Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Avaliações
              </h3>
              {!showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-semibold"
                >
                  Avaliar Livro
                </button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h4 className="font-semibold text-gray-800 mb-3">Sua Avaliação</h4>
                <div className="mb-3">
                  <label className="text-sm text-gray-600 mb-2 block">Classificação</label>
                  <StarRating
                    rating={newReview.rating}
                    onRatingChange={(rating) => setNewReview({ ...newReview, rating })}
                    size="lg"
                  />
                </div>
                <div className="mb-3">
                  <label className="text-sm text-gray-600 mb-2 block">Comentário (opcional)</label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Compartilhe sua opinião sobre este livro..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Enviar
                  </button>
                </div>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {loading ? (
                <p className="text-center text-gray-500 py-4">Carregando avaliações...</p>
              ) : reviews.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Nenhuma avaliação ainda. Seja o primeiro!</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="font-semibold text-gray-800">{review.user.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                    </div>
                    <StarRating rating={review.rating} readonly size="sm" />
                    {review.comment && (
                      <p className="text-gray-600 mt-2 leading-relaxed">{review.comment}</p>
                    )}
                    {review.response && (
                      <div className="mt-3 pl-4 border-l-2 border-orange-300 bg-orange-50 p-3 rounded">
                        <p className="text-sm font-semibold text-orange-800 mb-1">Resposta do Admin:</p>
                        <p className="text-sm text-orange-700">{review.response}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}