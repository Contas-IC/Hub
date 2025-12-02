import { useState } from "react";
import { X, Calendar, Clock, FileText, Save, Users } from "lucide-react";

export default function ModalNovaTarefa({ onClose, onSalvar }) {
  const [nova, setNova] = useState({
    titulo: "",
    data: "",
    hora: "",
    cliente: "",
    tipo: "",
    status: "PENDENTE"
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setNova({ ...nova, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onSalvar(nova);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 w-full max-w-xl rounded-lg shadow-2xl animate-scaleIn flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex gap-2 items-center">
            <Calendar className="text-white" size={22} />
            <div>
              <h2 className="text-lg font-bold text-white">Nova Tarefa</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 space-y-6">
          <div>
            <label className="block text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
              <FileText size={15} className="inline-block mr-1" />
              Título da Tarefa
            </label>
            <input
              type="text"
              name="titulo"
              required
              maxLength={60}
              value={nova.titulo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
              placeholder="Descreva a tarefa/compromisso"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                <Calendar size={15} className="inline-block mr-1" />
                Data
              </label>
              <input
                type="date"
                required
                name="data"
                value={nova.data}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                <Clock size={15} className="inline-block mr-1" />
                Hora
              </label>
              <input
                type="time"
                required
                name="hora"
                value={nova.hora}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                <Users size={15} className="inline-block mr-1" />
                Cliente (opcional)
              </label>
              <input
                type="text"
                name="cliente"
                value={nova.cliente}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Cliente relacionado à tarefa"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                Tipo/Tópico
              </label>
              <select
                name="tipo"
                required
                value={nova.tipo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Selecione</option>
                <option value="FINANCEIRO">Financeiro</option>
                <option value="REUNIAO">Reunião</option>
                <option value="DOCUMENTO">Documento</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Save size={18} />
            )}
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
