import { auditoriaService } from '../services/auditoria';

export function useAuditoria() {
  const registrar = (dados) => {
    return auditoriaService.registrar(dados);
  };

  const getLogs = (filtros) => {
    return auditoriaService.getLogs(filtros);
  };

  return { registrar, getLogs };
}
