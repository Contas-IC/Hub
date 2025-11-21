import EmptyState from '../../components/EmptyState';
import { Briefcase } from 'lucide-react';

export default function DP() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Departamento Pessoal</h1>
        <p className="text-gray-600 mt-1">Gestão de departamento pessoal</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8">
        <EmptyState
          titulo="Módulo em Desenvolvimento"
          descricao="O módulo de Departamento Pessoal está sendo construído"
          icone={Briefcase}
        />
      </div>
    </div>
  );
}
