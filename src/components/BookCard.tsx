import React from 'react';
import { BookOpen, Star, BookMarked, Calendar } from 'lucide-react';
import { Book } from '../api/books';

interface BookCardProps {
  book: Book;
  onReserve: (bookId: number) => void;
  onClick: (book: Book) => void;
}

export default function BookCard({ book, onReserve, onClick }: BookCardProps) {
  const calculateAvgRating = (reviews?: Book['reviews']) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div 
        onClick={() => onClick(book)}
        className="h-48 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
      >
        <BookOpen className="w-20 h-20 text-orange-600 opacity-50" />
      </div>

      <div className="p-6">
        <h3 
          onClick={() => onClick(book)}
          className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 cursor-pointer hover:text-orange-600 transition-colors"
        >
          {book.title}
        </h3>
        <p className="text-gray-600 mb-3">por {book.author}</p>

        {book.description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-3">
            {book.description}
          </p>
        )}

        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <span className="font-semibold text-gray-700">
            {calculateAvgRating(book.reviews)}
          </span>
          <span className="text-sm text-gray-500">
            ({book.reviews?.length || 0} avaliações)
          </span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">
              Disponíveis: <span className="font-bold text-gray-800">{book.copiesAvail}/{book.copiesTotal}</span>
            </span>
          </div>
        </div>

        <button
          onClick={() => onReserve(book.id)}
          disabled={book.copiesAvail === 0}
          className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            book.copiesAvail > 0
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:shadow-lg transform hover:scale-[1.02]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <BookMarked className="w-5 h-5" />
          {book.copiesAvail > 0 ? 'Reservar Livro' : 'Indisponível'}
        </button>
      </div>
    </div>
  );
}