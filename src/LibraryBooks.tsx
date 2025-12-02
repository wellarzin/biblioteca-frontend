import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { getBooks, reserveBook, Book } from './api/books';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import BookCard from './components/BookCard';
import BookDetailModal from './components/BookDetailModal';

export default function LibraryBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.name || user.email);
    }

    fetchBooks();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  }, [searchTerm, books]);

  const fetchBooks = async () => {
    try {
      const data = await getBooks();
      setBooks(data);
      setFilteredBooks(data);
      setLoading(false);
    } catch (err: any) {
      console.error('Erro ao buscar livros:', err);
      setError('Erro ao carregar livros. Tente novamente.');
      setLoading(false);
    }
  };

  const handleReserve = async (bookId: number) => {
    try {
      await reserveBook(bookId);
      alert('Livro reservado com sucesso!');
      setSelectedBook(null); 
      fetchBooks(); 
    } catch (err: any) {
      console.error('Erro ao reservar:', err);
      alert(err.response?.data?.message || 'Erro ao reservar livro. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Carregando biblioteca...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <Header userName={userName} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <SearchBar 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm}
        />

        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-center">
            {error}
          </div>
        )}

        {filteredBooks.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {searchTerm ? 'Nenhum livro encontrado' : 'Nenhum livro disponível no momento'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <BookCard 
                key={book.id} 
                book={book} 
                onReserve={handleReserve}
                onClick={setSelectedBook}
              />
            ))}
          </div>
        )}
      </main>

      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onReserve={handleReserve}
        />
      )}
    </div>
  );
}