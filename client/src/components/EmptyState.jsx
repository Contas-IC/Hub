import { FileX } from 'lucide-react';

export default function EmptyState({ 
  titulo = 'Nenhum registro encontrado',
  descricao = 'Não há dados para exibir no momento',
  icone: Icone = FileX,
  acao
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gray-100 rounded-full p-6 mb-4">
        <Icone size={48} className="text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{titulo}</h3>
      <p className="text-gray-500 text-center mb-6 max-w-md">{descricao}</p>
      {acao && acao}
    </div>
  );
}
