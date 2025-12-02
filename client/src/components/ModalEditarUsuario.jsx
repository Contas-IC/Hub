import { X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function ModalEditarUsuario({ usuario, onClose, onSuccess }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cargo, setCargo] = useState('usuario');
  const [permissoes, setPermissoes] = useState({
    ADMIN: { selecionado: false, pode_editar: false },
    LEGALIZACAO: { selecionado: false, pode_editar: false },
    ONBOARDING: { selecionado: false, pode_editar: false },
    CONTABIL: { selecionado: false, pode_editar: false },
    FISCAL: { selecionado: false, pode_editar: false },
    DP: { selecionado: false, pode_editar: false }
  });
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome || '');
      setEmail(usuario.email || '');
      setCargo(usuario.cargo || 'usuario');

      // Inicializar permissões
      const permissoesIniciais = {
        ADMIN: { selecionado: false, pode_editar: false },
        LEGALIZACAO: { selecionado: false, pode_editar: false },
        ONBOARDING: { selecionado: false, pode_editar: false },
        CONTABIL: { selecionado: false, pode_editar: false },
        FISCAL: { selecionado: false, pode_editar: false },
        DP: { selecionado: false, pode_editar: false }
      };

      if (usuario.permissoes && Array.isArray(usuario.permissoes)) {
        usuario.permissoes.forEach(perm => {
          if (permissoesIniciais[perm.modulo]) {
            permissoesIniciais[perm.modulo] = {
              selecionado: true,
              pode_editar: perm.pode_editar === 1
            };
          }
        });
      }

      setPermissoes(permissoesIniciais);
    }
  }, [usuario]);

  const handlePermissaoChange = (modulo, campo) => {
    setPermissoes(prev => ({
      ...prev,
      [modulo]: {
        ...prev[modulo],
        [campo]: !prev[modulo][campo]
      }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      const permissoesArray = Object.entries(permissoes)
        .filter(([_, value]) => value.selecionado)
        .map(([modulo, value]) => ({
          modulo,
          pode_editar: value.pode_editar
        }));

      const updateData = {
        nome,
        email,
        cargo,
        permissoes: permissoesArray
      };

      // Só incluir senha se foi preenchida
      if (senha.trim() !== '') {
        updateData.senha = senha;
      }

      const response = await api.put(`/usuarios/${usuario.id}`, updateData);

      if (response.data.success) {
        setMensagem({ tipo: 'success', texto: response.data.message });
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (error) {
      setMensagem({
        tipo: 'error',
        texto: error.response?.data?.message || 'Erro ao atualizar usuário'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          onClick={onClose}
          disabled={loading}
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Editar Usuário
        </h2>

        {mensagem.texto && (
          <div className={`flex items-center gap-2 p-4 rounded-lg mb-4 ${
            mensagem.tipo === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}>
            {mensagem.tipo === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="text-sm font-medium">{mensagem.texto}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={nome}
              onChange={e => setNome(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nova Senha (deixe em branco para manter a atual)
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              disabled={loading}
              placeholder="Digite apenas se quiser alterar a senha"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cargo
            </label>
            <select
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={cargo}
              onChange={e => setCargo(e.target.value)}
              disabled={loading}
            >
              <option value="usuario">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Permissões de Acesso aos Módulos
            </label>
            <div className="space-y-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              {Object.entries(permissoes).map(([modulo, value]) => (
                <div key={modulo} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={value.selecionado}
                      onChange={() => handlePermissaoChange(modulo, 'selecionado')}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                    <span className="font-medium text-gray-900 dark:text-white">{modulo}</span>
                  </div>
                  {value.selecionado && (
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={value.pode_editar}
                        onChange={() => handlePermissaoChange(modulo, 'pode_editar')}
                        className="w-4 h-4 text-blue-600 rounded"
                        disabled={loading}
                      />
                      <span className="text-gray-700 dark:text-gray-300">Pode editar</span>
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Atualizando...
            </>
          ) : (
            'Atualizar Usuário'
          )}
        </button>
      </div>
    </div>
  );
}
