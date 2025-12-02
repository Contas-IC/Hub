import { Link, useLocation } from 'react-router-dom';
import {
  FileCheck,
  Home,
  Users,
  Calendar,
  Settings,
  ArrowLeft,
  Award,
  DollarSign
} from 'lucide-react';

export default function SidebarLegalizacao({ aberta }) {
  const location = useLocation();

  const menuItems = [
    {
      path: '/legalizacao',
      icon: Home,
      label: 'Visão Geral'
    },
    {
      path: '/legalizacao/clientes',
      icon: Users,
      label: 'Clientes'
    },
    {
      path: '/legalizacao/financeiros',
      icon: DollarSign,
      label: 'Financeiros'
    },
    {
      path: '/legalizacao/certificados',
      icon: Award,
      label: 'Certificados'
    },
    {
      path: '/legalizacao/agenda',
      icon: Calendar,
      label: 'Agenda'
    },
    {
      path: '/legalizacao/configuracoes',
      icon: Settings,
      label: 'Configurações'
    }
  ];

  const isActive = (path) => {
    if (path === '/legalizacao') {
      return location.pathname === '/legalizacao';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`
        bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transition-all duration-300 flex flex-col
        ${aberta ? 'w-64' : 'w-20'}
      `}
    >
      {/* Cabeçalho do Setor */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 px-4">
        {aberta ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <FileCheck size={24} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">Legalização</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Módulo</p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <FileCheck size={24} className="text-white" />
          </div>
        )}
      </div>

      {/* Menu do Setor */}
      <nav className="flex-1 py-6 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-lg transition-all
                    ${active
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                  title={!aberta ? item.label : ''}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {aberta && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Voltar ao Dashboard Principal */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          title={!aberta ? 'Voltar ao Dashboard' : ''}
        >
          <ArrowLeft size={20} className="flex-shrink-0" />
          {aberta && <span className="text-sm font-medium">Voltar ao Dashboard</span>}
        </Link>
      </div>
    </aside>
  );
}
