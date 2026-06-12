export interface Score {
  id: number;
  puntaje_maximo: number;
  distribucion: Record<string, number>;
  estado: number;
  creado: string;
  modificado: string;
}

export interface ScoreUpdate {
  puntaje_maximo?: number;
  distribucion?: Record<string, number>;
  estado?: number;
}