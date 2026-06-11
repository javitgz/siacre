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