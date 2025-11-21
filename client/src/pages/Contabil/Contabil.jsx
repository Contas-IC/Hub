import EmptyState from '../../components/EmptyState';
import { Calculator } from 'lucide-react';

export default function Contabil() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Contábil</h1>
        <p className="text-gray-600 mt-1">Gestão contábil de clientes</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8">
        <EmptyState
          titulo="Módulo em Desenvolvimento"
          descricao="O módulo Contábil está sendo construído"
          icone={Calculator}
        />
      </div>
    </div>
  );
}
