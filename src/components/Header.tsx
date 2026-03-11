import React from 'react';
import { FileText } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="site-header sticky top-0 z-50 bg-blue-600 text-white">
      <div className="header-content max-w-7xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <FileText className="h-8 w-8 header-icon" />
          <div className="hidden md:block">
            <h1 className="text-xl font-bold">Portal de Decretos, Resoluciones y Ordenanzas</h1>
            <p className="text-sm text-white/90">Sistema de Gestión Normativa - Administración</p>
          </div>
          <div className="md:hidden">
            <h1 className="text-lg font-bold">PDRO Admin</h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
