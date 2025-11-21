export default function Card({ 
  titulo, 
  valor, 
  icone: Icone, 
  cor = 'blue',
  subtitulo,
  trend 
}) {
  const cores = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    indigo: 'bg-indigo-500'
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{titulo}</p>
          <p className="text-3xl font-bold text-gray-900">{valor}</p>
          {subtitulo && (
            <p className="text-sm text-gray-500 mt-1">{subtitulo}</p>
          )}
          {trend && (
            <div className={`text-sm mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </div>
          )}
        </div>
        
        {Icone && (
          <div className={`${cores[cor]} p-4 rounded-xl`}>
            <Icone size={28} className="text-white" />
          </div>
        )}
      </div>
    </div>
  );
}
