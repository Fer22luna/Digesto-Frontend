import React from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import { Toaster } from 'sonner';
import { Routes, Route, Navigate } from 'react-router-dom';

// pages - Admin only
import AdminRegulationsList from './pages/admin/RegulationsList';
import AdminRegulationNew from './pages/admin/RegulationNew';
import AdminRegulationEditor from './pages/admin/RegulationEditor';
import HeaderRemoto from './components/HeaderRemoto';

function App() {

  return (
    <div className="App flex flex-col min-h-screen">
      <Toaster position="bottom-right" />
      <HeaderRemoto />
      <Header />
      <main className="flex-1 p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<AdminRegulationsList />} />
          <Route path="/admin/regulations/new" element={<AdminRegulationNew />} />
          <Route path="/admin/regulations/:id" element={<AdminRegulationEditor />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
