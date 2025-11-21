import EmptyState from '../../components/EmptyState';
import { Users } from 'lucide-react';

export default function Onboarding() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Onboarding</h1>
        <p className="text-gray-600 mt-1">Acompanhamento de novos clientes</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8">
        <EmptyState
          titulo="Módulo em Desenvolvimento"
          descricao="O módulo de Onboarding está sendo construído"
          icone={Users}
        />
      </div>
    </div>
  );
}
