import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="site-footer mt-auto bg-gray-100 text-gray-700">
      <div className="footer-content max-w-7xl mx-auto py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900">Portal de Decretos, Resoluciones y Ordenanzas</h3>
          <p className="text-sm">Sistema de gestión y publicación de normativas institucionales</p>
        </div>
        <div className="space-y-3 min-h-[130px] flex flex-col justify-center">
          <h4 className="font-semibold text-gray-900">Enlaces Útiles</h4>
          <ul className="space-y-1 text-sm">
            <li>
              <a href="/" className="hover:text-blue-600">Portal Público</a>
            </li>
            <li>
              <a href="/admin" className="hover:text-blue-600">Administración</a>
            </li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900">Contacto</h4>
          <p className="text-sm">
            Email: info@pdro.gob
            <br />
            Tel: (123) 456-7890
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300/70 to-transparent" />
        <p className="pt-4 text-center text-sm text-gray-500">© {new Date().getFullYear()} PDRO. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
