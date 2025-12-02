import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ searchTerm, onSearchChange, placeholder = "Buscar por título ou autor..." }: SearchBarProps) {
  return (
    <div className="mb-8">
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-orange-500 focus:outline-none transition-colors shadow-sm"
        />
      </div>
    </div>
  );
}