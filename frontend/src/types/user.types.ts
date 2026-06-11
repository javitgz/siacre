export interface Usuario {
  id: number;
  nombres: string;
  apellidos?: string;
  tipo_documento?: string;
  documento?: string;
  telefono?: string;
  direccion?: string;
  municipio?: string;
  departamento?: string;
  email: string;
  estado: number;
  rol_id: number;
  empresa_id: number;
  creado: string;
  modificado?: string;
  rol_nombre?: string;
}

export interface UsuarioCreate {
  nombres: string;
  apellidos?: string;
  tipo_documento?: string;
  documento?: string;
  telefono?: string;
  direccion?: string;
  municipio?: string;
  departamento?: string;
  email: string;
  password: string;
  rol_id: number;
  empresa_id?: number; // opcional, backend lo asigna
}

export interface UsuarioUpdate {
  nombres?: string;
  apellidos?: string;
  tipo_documento?: string;
  documento?: string;
  telefono?: string;
  direccion?: string;
  municipio?: string;
  departamento?: string;
  email?: string;
  password?: string;
  rol_id?: number;
  estado?: number;
}