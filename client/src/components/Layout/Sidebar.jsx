import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCheck,
  Users,
  Calculator,
  Receipt,
  Briefcase
} from 'lucide-react';
import { authService } from '../../services/auth';

export default function Sidebar({ aberta }) {
  const location = useLocation();
  const permissoes = authService.getPermissoes();

  const menuItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      // Sem módulo - visível para todos
    },
    {
      path: '/usuarios',
      icon: Users,
      label: 'Usuários',
      modulo: 'ADMIN'
    },
    {
      path: '/legalizacao',
      icon: FileCheck,
      label: 'Legalização',
      modulo: 'LEGALIZACAO'
    },
    {
      path: '/onboarding',
      icon: Users,
      label: 'Onboarding',
      modulo: 'ONBOARDING'
    },
    {
      path: '/contabil',
      icon: Calculator,
      label: 'Contábil',
      modulo: 'CONTABIL'
    },
    {
      path: '/fiscal',
      icon: Receipt,
      label: 'Fiscal',
      modulo: 'FISCAL'
    },
    {
      path: '/dp',
      icon: Briefcase,
      label: 'Departamento Pessoal',
      modulo: 'DP'
    }
  ];

  // ✅ CORREÇÃO: Permitir itens sem módulo
  const itensVisiveis = menuItems.filter(item => {
    // Se não tem módulo, mostrar para todos
    if (!item.modulo) return true;
    
    // Se tem módulo, verificar permissão
    return permissoes.includes(item.modulo) || permissoes.includes('ADMIN');
  });

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className={`
        bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        text-gray-800 dark:text-gray-200 transition-all duration-300 flex flex-col
        ${aberta ? 'w-64' : 'w-20'}
      `}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 px-4">
        {aberta ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900 dark:text-white">HUB</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Gerenciamento</p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">H</span>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 py-6 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {itensVisiveis.map((item) => {
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
                    <span className="text-sm font-medium">
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Rodapé */}
      {aberta && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            v1.0.0 - 2025
          </div>
        </div>
      )}
    </aside>
  );
}
