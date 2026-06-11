export interface Naturaleza {
  id: number;
  nombre: 'natural' | 'juridica';
  descripcion?: string;
  estado: number;
  creado: string;
  modificado?: string;
}

export interface NaturalezaCreate {
  nombre: 'natural' | 'juridica';
  descripcion?: string;
}

export interface NaturalezaUpdate {
  nombre?: 'natural' | 'juridica';
  descripcion?: string;
}