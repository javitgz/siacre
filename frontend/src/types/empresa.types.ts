export type TipoDocumento = 'CC' | 'NIT' | 'CE' | 'NUIP';

export interface Empresa {
  id: number;
  naturaleza: 'natural' | 'juridica';
  nombres?: string;
  apellidos?: string;
  razon_social?: string;
  tipo_documento: 'CC' | 'NIT' | 'CE' | 'NUIP';
  documento: string;
  dv?: number;
  direccion: string;
  municipio: string;
  departamento: string;
  email: string;
  telefono: string;
  estado: number;
  ruta_logo?: string;
  creado: string;
  modificado?: string;
}

export interface EmpresaCreate {
  naturaleza: 'natural' | 'juridica';
  nombres?: string;
  apellidos?: string;
  razon_social?: string;
  tipo_documento: 'CC' | 'NIT' | 'CE' | 'NUIP';
  documento: string;
  dv?: number;
  direccion: string;
  municipio: string;
  departamento: string;
  email: string;
  telefono: string;
  ruta_logo?: string;
}

export interface EmpresaUpdate {
  naturaleza?: 'natural' | 'juridica';
  nombres?: string;
  apellidos?: string;
  razon_social?: string;
  tipo_documento?: 'CC' | 'NIT' | 'CE' | 'NUIP';
  documento?: string;
  dv?: number;
  direccion?: string;
  municipio?: string;
  departamento?: string;
  email?: string;
  telefono?: string;
  estado?: number;
  ruta_logo?: string;
}

// Lista de opciones para UI
export const TIPOS_DOCUMENTO: TipoDocumento[] = ['CC', 'NIT', 'CE', 'NUIP'];