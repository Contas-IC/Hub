import { X, Moon, Sun, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import api from '../services/api';

export default function ModalConfig({ usuario, onClose, onSuccess }) {
  const [nome, setNome] = useState(usuario?.nome || '');
  const [email, setEmail] = useState(usuario?.email || '');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [tema, setTema] = useState(localStorage.getItem('tema') || usuario?.tema || 'claro');
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  function handleTemaChange(nextTema) {
    setTema(nextTema);
    localStorage.setItem('tema', nextTema);
    if (nextTema === 'escuro') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  async function handleSave() {
    setLoading(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      const response = await api.put('/config/admin', {
        nome,
        email,
        senhaAtual: senhaAtual || undefined,
        novaSenha: novaSenha || undefined,
        tema
      });

      if (response.data.success) {
        setMensagem({ tipo: 'success', texto: response.data.message });
        
        // Atualizar localStorage com novos dados
        const usuarioAtualizado = response.data.data.usuario;
        localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));

        // Limpar campos de senha
        setSenhaAtual('');
        setNovaSenha('');

        // Chamar callback de sucesso
        if (onSuccess) {
          setTimeout(() => {
            onSuccess(usuarioAtualizado);
            onClose();
          }, 1500);
        }
      }
    } catch (error) {
      setMensagem({
        tipo: 'error',
        texto: error.response?.data?.message || 'Erro ao salvar configurações'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-lg relative animate-fadeIn">
        {/* Botão Fechar */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          onClick={onClose}
          disabled={loading}
        >
          <X size={24} />
        </button>

        {/* Título */}
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Configurações do Sistema
        </h2>

        {/* Mensagens de Sucesso/Erro */}
        {mensagem.texto && (
          <div className={`
            flex items-center gap-2 p-4 rounded-lg mb-4
            ${mensagem.tipo === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
            }
          `}>
            {mensagem.tipo === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="text-sm font-medium">{mensagem.texto}</span>
          </div>
        )}
        
        {/* Formulário */}
        <div className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={nome}
              onChange={e => setNome(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Senha Atual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Senha Atual
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(preencha apenas se quiser alterar a senha)</span>
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={senhaAtual}
              onChange={e => setSenhaAtual(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {/* Nova Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nova Senha
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(mínimo 6 caracteres)</span>
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={novaSenha}
              onChange={e => setNovaSenha(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          {/* Tema */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tema do Sistema
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleTemaChange('claro')}
                disabled={loading}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all
                  ${tema === 'claro'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                <Sun size={20} />
                Claro
              </button>
              <button
                type="button"
                onClick={() => handleTemaChange('escuro')}
                disabled={loading}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all
                  ${tema === 'escuro'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                <Moon size={20} />
                Escuro
              </button>
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <button
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Salvando...
            </>
          ) : (
            'Salvar Alterações'
          )}
        </button>
      </div>
    </div>
  );
}
