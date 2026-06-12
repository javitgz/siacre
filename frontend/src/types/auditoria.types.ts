export interface AuditoriaLog {
  id: number;
  usuario_id: number;
  empresa_id: number;
  accion: string;
  entidad: string;
  detalle: string | null;
  creado: string;
}

export interface AuditoriaFiltros {
  skip?: number;
  limit?: number;
  usuario_id?: number;
  empresa_id?: number;
  accion?: string;
  entidad?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}