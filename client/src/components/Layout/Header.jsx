import { Menu, Bell, User, LogOut, ChevronDown, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { authService } from '../../services/auth';
import ModalConfig from '../ModalConfig';

export default function Header({ toggleSidebar, sidebarAberta }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [menuConfig, setMenuConfig] = useState(false);
  const menuRef = useRef(null);
  const usuario = authService.getUsuario();

  useEffect(() => {
    function handleClickFora(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAberto(false);
      }
    }

    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  const handleLogout = () => {
    if (confirm('Deseja realmente sair?')) {
      authService.logout();
    }
  };

  const handleConfigSuccess = (usuarioAtualizado) => {
    window.location.reload();
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
      {/* Esquerda */}
      <button
        onClick={toggleSidebar}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        title={sidebarAberta ? 'Fechar menu' : 'Abrir menu'}
      >
        <Menu size={20} className="text-gray-600 dark:text-gray-300" />
      </button>

      {/* Direita */}
      <div className="flex items-center gap-3">
        {/* Notificações */}
        <button 
          className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Notificações"
        >
          <Bell size={20} className="text-gray-600 dark:text-gray-300" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Configurações (apenas admin) */}
        {usuario?.cargo === 'admin' && (
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Configurações"
            onClick={() => setMenuConfig(true)}
          >
            <Settings size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        )}

        {/* Perfil */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="text-left hidden md:block">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {usuario?.nome || 'Usuário'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {usuario?.cargo || 'Cargo'}
              </div>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {menuAberto && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="font-medium text-gray-900 dark:text-white">{usuario?.nome}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{usuario?.email}</div>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut size={18} />
                <span>Sair</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Config */}
      {menuConfig && (
        <ModalConfig
          usuario={usuario}
          onClose={() => setMenuConfig(false)}
          onSuccess={handleConfigSuccess}
        />
      )}
    </header>
  );
}
