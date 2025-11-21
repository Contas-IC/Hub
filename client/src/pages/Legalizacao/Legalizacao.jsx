import EmptyState from '../../components/EmptyState';
import { FileCheck } from 'lucide-react';

export default function Legalizacao() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Legalização</h1>
        <p className="text-gray-600 mt-1">Gerenciamento de cadastros e legalizações</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8">
        <EmptyState
          titulo="Módulo em Desenvolvimento"
          descricao="O módulo de Legalização está sendo construído"
          icone={FileCheck}
        />
      </div>
    </div>
  );
}
