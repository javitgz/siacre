export type TipoEscenario = 'selector' | 'rango';

export interface Escenario {
  id: number;
  parametro_id: number;
  tipo: TipoEscenario;
  selector_valor?: string;
  rango_min?: number;
  rango_max?: number;
  porcentaje: number;
  estado: number;
  creado: string;
  modificado?: string;
}

export interface EscenarioCreate {
  parametro_id: number;
  tipo: TipoEscenario;
  selector_valor?: string;
  rango_min?: number;
  rango_max?: number;
  porcentaje: number;
}

export interface EscenarioUpdate {
  tipo?: TipoEscenario;
  selector_valor?: string;
  rango_min?: number;
  rango_max?: number;
  porcentaje?: number;
  estado?: number;
}