import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Header from './Header';

export default function LayoutSetor({ children, sidebar: SidebarComponent, titulo }) {
  const [sidebarAberta, setSidebarAberta] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar do Setor */}
      <SidebarComponent aberta={sidebarAberta} />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarAberta(!sidebarAberta)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              {sidebarAberta ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {titulo}
            </h1>
          </div>
          <Header />
        </header>

        {/* Conteúdo */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
