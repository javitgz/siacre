import { API_HEADERS, BASE_URL } from '../constants/api';
import { getUserSession } from './storage';


// ==================================================================
// TIPOS Y NUMEROS (Alineados con los schemras del backend)
// ==================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Usuario - Segun UserResponse del backend

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
  estado: number; // 1 activo, 0 inactivo
  rol_id: number;
  empresa_id: number;
  creado: string;
  modificado?: string;
  rol_nombre?: string; // campo añadido en la respuesta (opcional)
}

// Payload para crear usuario (UserCreate)
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
  empresa_id: number;
}

// Payload para actualizar usuario (UserUpdate - Todos opcionales)
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


// Rol - Segun RoleResponse del backend (incluye permisos anidados)
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

// Payload para crear rol (RoleCreate)
export interface RolCreate {
  nombre: string;
  descripcion?: string;
  estado?: number;
}

// Payload para actualizar rol (RoleUpdate)
export interface RolUpdate {
  nombre?: string;
  descripcion?: string;
  estado?: number;
}

// Permiso individual (para catálogo)
export interface Permiso {
  id: number;
  nombre: string;
  estado: number;
  creado: string;
  modificado?: string;
}

// Empresa – según EmpresaResponse
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

// Payload para actualizar empresa (EmpresaUpdate)
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

// ==================================================================
// FUNCION BASE PARA PETICIONES AUTENTICADAS
// ==================================================================

/*
* Realiza una peticion HTTP inyectadno automaticamente el token JWT
* obtenido del almacenamiento seguro.
* Lanza un error si la respuesta no es ok
*/

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const session = await getUserSession();

  const headers: Record<string, string> = {
    ...API_HEADERS,
    ...(options.headers as Record<string, string> || {}),
  };

  // Si existe una sesion activa, inyectamos el token para la validacion RBAC y Multi-Tenant del backend
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Error HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage; 
    } catch {
      // Si no se puede pasrsear JSON, se mantiene el mensaje por defecto
    }
    throw new Error(errorMessage);
  }
  // Si la respuesta es 204 No Content, retornar null o undefined segun convenga
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
};

// ==================================================================
// SERVICIO DE AUTENTICACION (Conectado con FastAPI)
// ==================================================================

/**
 * Inicia sesion con email y contraseña
 * Retorna el objeto TokenResponse (access_token, token_type) que luego
 * debe guardarse con saveUserSession.
 * @see loginUser en storage.ts 
*/

export const loginUser = async (credentials: LoginRequest): Promise<TokenResponse> => {
  
  const formData = new URLSearchParams();
  formData.append('username', credentials.email);
  formData.append('password', credentials.password);

  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    let errorMessage = 'Credenciales inválidas';
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // ignore
    }

    throw new Error(errorMessage);
  }
  return response.json() as Promise<TokenResponse>;
};

// ==================================================================
// USUARIOS (CRUD + cambio de estado)
// ==================================================================

/**
 * Obtiene la lista de usuarios de la empresa del usuario autenticado
 * Los analistas no tienen acceso; los coordinadores / supervisores no ven al administrador
*/
export const obtenerUsuarios = async (skip = 0, limit = 100): Promise<Usuario[]> => {
  return apiRequest<Usuario[]>(`/api/usuarios?skip=${skip}&limit=${limit}`);
};

/***
 * Crear un usuario nuevo
 * @param usuarioData - Debe incluir empresa_id. rol_id, password
*/
export const crearUsuario = async (usuarioData: UsuarioCreate): Promise<Usuario> => {
  return apiRequest<Usuario>('/api/usuarios', {
    method: 'POST',
    body: JSON.stringify(usuarioData),
  });
};

/***
 * Actualiza parcialmente un usuario existente
 * @param userIDd - ID del usuario a actualizar
 * @param usuarioData - Campos a modificar (todos opcionales)
*/
export const actualizarUsuario = async (userId: number, usuarioData: UsuarioUpdate): Promise<Usuario> => {
  return apiRequest<Usuario>(`/api/usuarios/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(usuarioData),
  });
};

/***
 * Elimina logicamente un usuario (Soft Delete, estado = 0)
 * @param userIDd - ID del usuario a eliminar
*/
export const eliminarUsuario = async (userId: number): Promise<Usuario> => {
  return apiRequest<Usuario>(`/api/usuarios/${userId}`, {
    method: 'DELETE',
  });
};

/***
 * Cambia el estado activo / inactivo de un usuario
 * @param userIDd - ID del usuario
 * @param activo - true para activar (estado=1), fasle para desactivar (estado=0)
*/
export const cambiarEstadoUsuario = async (userId: number, activo: boolean): Promise<Usuario> => {
  return apiRequest<Usuario>(`/api/usuarios${userId}/estado?activo=${activo}`, {
    method: 'PATCH',
  });
};

// ============================================================================
// ROLES Y PERMISOS
// ============================================================================

/**
 * Obtiene todos los roles (solo administrador).
 */
export const obtenerRoles = async (skip = 0, limit = 100): Promise<Rol[]> => {
  return apiRequest<Rol[]>(`/api/roles?skip=${skip}&limit=${limit}`);
};

/**
 * Obtiene un rol por su ID.
 */
export const obtenerRolPorId = async (rolId: number): Promise<Rol> => {
  return apiRequest<Rol>(`/api/roles/${rolId}`);
};

/**
 * Crea un nuevo rol.
 */
export const crearRol = async (rolData: RolCreate): Promise<Rol> => {
  return apiRequest<Rol>('/api/roles', {
    method: 'POST',
    body: JSON.stringify(rolData),
  });
};

/**
 * Actualiza parcialmente un rol.
 */
export const actualizarRol = async (rolId: number, rolData: RolUpdate): Promise<Rol> => {
  return apiRequest<Rol>(`/api/roles/${rolId}`, {
    method: 'PATCH',
    body: JSON.stringify(rolData),
  });
};

/**
 * Elimina lógicamente un rol (estado=0).
 */
export const eliminarRol = async (rolId: number): Promise<Rol> => {
  return apiRequest<Rol>(`/api/roles/${rolId}`, {
    method: 'DELETE',
  });
};

/**
 * Obtiene el catálogo maestro de permisos (solo administrador).
 */
export const obtenerPermisos = async (skip = 0, limit = 100): Promise<Permiso[]> => {
  return apiRequest<Permiso[]>('/api/roles/permisos');
};

/**
 * Asigna (sincroniza) una lista de IDs de permisos a un rol.
 * Reemplaza cualquier asignación previa.
 * @param rolId - ID del rol
 * @param permisosIds - Array de números con los IDs de los permisos a asignar
 */
export const asignarPermisosARol = async (rolId: number, permisosIds: number[]): Promise<void> => {
  // El backend espera un array en el body, no en JSON anidado.
  return apiRequest<void>(`/api/roles/${rolId}/permisos`, {
    method: 'POST',
    body: JSON.stringify(permisosIds),
  });
};

// ============================================================================
// EMPRESAS (perfil de la empresa del usuario autenticado)
// ============================================================================

/**
 * Obtiene los datos de la empresa asociada al usuario autenticado.
 */
export const obtenerEmpresaActual = async (): Promise<Empresa> => {
  return apiRequest<Empresa>('/api/empresas/me');
};

/**
 * Actualiza parcialmente los datos de la empresa del usuario autenticado.
 * Solo accesible para administradores.
 */
export const actualizarEmpresa = async (empresaData: EmpresaUpdate): Promise<Empresa> => {
  return apiRequest<Empresa>('/api/empresas/me', {
    method: 'PATCH',
    body: JSON.stringify(empresaData),
  });
};

// ============================================================================
// FUNCIÓN PARA OBTENER EL PERFIL DEL USUARIO AUTENTICADO (YA EXISTE EN storage.ts, pero añadimos conveniencia)
// ============================================================================

/**
 * Obtiene los datos del usuario autenticado directamente desde el backend.
 * Útil cuando se necesita información actualizada (no solo la almacenada en SecureStore).
 */
export const obtenerMiPerfil = async (): Promise<Usuario> => {
  return apiRequest<Usuario>('/api/usuarios/me');
};

/**
 * Actualiza el perfil del propio usuario autenticado.
 */
export const actualizarMiPerfil = async (usuarioData: UsuarioUpdate): Promise<Usuario> => {
  return apiRequest<Usuario>('/api/usuarios/me', {
    method: 'PATCH',
    body: JSON.stringify(usuarioData),
  });
};