import { useState, useEffect } from 'react';

export function useModuloLoading(duracao = 1000) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => {
      setLoading(false);
    }, duracao);

    return () => clearTimeout(timer);
  }, [duracao]);

  return loading;
}
