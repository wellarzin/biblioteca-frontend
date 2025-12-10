import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LibraryAuth from './LibraryAuth';
import LibraryBooks from './LibraryBooks';
import AdminDashboard from './AdminDashboard';
import AdminLoans from './AdminLoans';
import MyLoans from './MyLoans';
import LoanCalendar from './LoanCalendar';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LibraryAuth />} />
        <Route path="/books" element={<ProtectedRoute><LibraryBooks /></ProtectedRoute>} />
        <Route path="/my-loans" element={<ProtectedRoute><MyLoans /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><LoanCalendar /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/loans" element={<AdminRoute><AdminLoans /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

// Rota protegida para usuários autenticados
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

// Rota protegida apenas para admins
function AdminRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  if (userStr) {
    const user = JSON.parse(userStr);
    if (user.role !== 'ADMIN') {
      return <Navigate to="/books" replace />;
    }
  }
  
  return <>{children}</>;
}

export default App;