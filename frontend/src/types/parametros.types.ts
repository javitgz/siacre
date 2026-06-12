export interface Parametro {
  id: number;
  codigo: string;
  nombre: string;
  caracteristica_medida: string;
  tipo:  'selector' | 'rango'; // ajusta según tu backend
  puntos_maximos: number;
  interpretacion?: string;
  nucleo_id: number;
  naturaleza_id: number;
  estado: number;
  modificado?: string;
}

export interface ParametroCreate {
  codigo: string;
  nombre: string;
  caracteristica_medida?: string;
  tipo: 'selector' | 'rango';
  puntos_maximos: number;
  interpretacion?: string;
  nucleo_id: number;
  naturaleza_id: number;
}

export interface ParametroUpdate {
  codigo?: string;
  nombre?: string;
  caracteristica_medida?: string;
  tipo?: 'selector' | 'rango';
  puntos_maximos?: number;
  interpretacion?: string;
  nucleo_id?: number;
  naturaleza_id?: number;
  estado?: number;
}