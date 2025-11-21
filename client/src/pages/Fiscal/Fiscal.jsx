import EmptyState from '../../components/EmptyState';
import { Receipt } from 'lucide-react';

export default function Fiscal() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fiscal</h1>
        <p className="text-gray-600 mt-1">Gestão fiscal de clientes</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8">
        <EmptyState
          titulo="Módulo em Desenvolvimento"
          descricao="O módulo Fiscal está sendo construído"
          icone={Receipt}
        />
      </div>
    </div>
  );
}
