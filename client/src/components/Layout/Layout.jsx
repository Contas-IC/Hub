import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  const [sidebarAberta, setSidebarAberta] = useState(true);

  const toggleSidebar = () => {
    setSidebarAberta(!sidebarAberta);
  };

  // Aplicar tema ao carregar
  useEffect(() => {
    const tema = localStorage.getItem('tema') || 'claro';
    document.documentElement.classList.toggle('dark', tema === 'escuro');
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar aberta={sidebarAberta} />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} sidebarAberta={sidebarAberta} />

        {/* Área de Conteúdo */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
