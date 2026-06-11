export interface PermisoRelacion {
  id: number;
  nombre: string;
  estado: number;
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: number;
  creado: string;
  modificado?: string;
  permisos: PermisoRelacion[];
}

export interface RolCreate {
  nombre: string;
  descripcion?: string;
  estado?: number;
}

export interface RolUpdate {
  nombre?: string;
  descripcion?: string;
  estado?: number;
}

// Permiso individual (catálogo)
export interface Permiso {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: number;
  creado: string;
  modificado?: string;
}

export interface PermisoCreate {
  nombre: string;
  descripcion?: string;
}

export interface PermisoUpdate {
  nombre?: string;
  descripcion?: string;
}