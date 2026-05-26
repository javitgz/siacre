// src/utils/api.ts
import { API_HEADERS, BASE_URL } from '../constants/api';
import { LoginRequest, UserResponse } from '../types/auth.types';
import { getUserSession } from './storage';

// ─── INTERFAZ DE PERMISOS (sincronizada con backend) ──────────────────────────────
export interface Permisos {
  dashboard: boolean;
  clientes: boolean;
  parametros: boolean;
  reportes: boolean;
  configuracion: boolean;
  usuarios: boolean;
  roles: boolean;
  auditoria: boolean;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion?: string;
  estado?: number;
  permisos: Permisos;
  creado?: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  apellidos?: string;
  tipo_documento?: string;
  documento?: string;
  telefono?: string;
  direccion?: string;
  municipio?: string;
  departamento?: string;
  email: string;
  activo: boolean;
  rol_id: number;
  rol_nombre?: string;
  creado?: string;
  password?: string; // solo para creación/actualización
}

export interface LogAuditoria {
  id: string;
  fecha: string;
  usuario: string;
  accion: string;
  modulo: String;
  detalles: string;
}

/**
 * Recupera el token JWT desde la sesión cifrada de SecureStore
 */
const getHeaders = async (): Promise<HeadersInit> => {
  const session = await getUserSession();
  const token = session?.access_token;
  return {
    ...API_HEADERS,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

// ─── SERVICIO DE AUTENTICACIÓN ───────────────────────────────────────
export const loginUser = async (credentials: LoginRequest): Promise<{ access_token: string; user: UserResponse }> => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Error en el inicio de sesión');
    }
    // data = { access_token, token_type, user }
    return data;
  } catch (error: any) {
    throw error;
  }
};

// ─── SERVICIOS DE USUARIOS ───────────────────────────────────────────
export const obtenerUsuarios = async (): Promise<Usuario[]> => {
  const headers = await getHeaders();
  const response = await fetch(`${BASE_URL}/api/usuarios/`, { method: 'GET', headers });
  if (!response.ok) throw new Error('Error al obtener el listado de usuarios');
  const data = await response.json();
  // Mapear estado: backend devuelve estado (1 activo, 0 inactivo)
  return data.map((u: any) => ({ ...u, activo: u.estado === 1 }));
};

export const eliminarUsuario = async (id: string): Promise<void> => {
  const headers = await getHeaders();
  const response = await fetch(`${BASE_URL}/api/usuarios/${id}`, { method: 'DELETE', headers });
  if (!response.ok) throw new Error('No se pudo eliminar el usuario');
};

export const cambiarEstadoUsuario = async (id: string, activo: boolean): Promise<Usuario> => {
  const headers = await getHeaders();
  // ✅ Enviar el parámetro en la URL (query string)
  const response = await fetch(`${BASE_URL}/api/usuarios/${id}/estado?activo=${activo}`, {
    method: 'PATCH',
    headers,
    // Sin cuerpo (body)
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Error al cambiar estado del usuario');
  }
  const data = await response.json();
  return { ...data, activo: data.estado === 1 };
};

// ✅ CORRECCIÓN: URL corregida (plural) y password se envía siempre (si existe)
export const crearUsuario = async (usuario: Omit<Usuario, 'id' | 'creado' | 'rol_nombre'>): Promise<Usuario> => {
  const headers = await getHeaders();
  const payload = {
    ...usuario,
    estado: usuario.activo ? 1 : 0,
    // Si no viene password (edición) se envía un string vacío (backend lo ignorará si no cambia)
    password: usuario.password || '',
    rol_id: usuario.rol_id
  };
  const response = await fetch(`${BASE_URL}/api/usuarios/`, {  // 🔁 plural
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Error al crear el usuario');
  }
  const data = await response.json();
  return { ...data, activo: data.estado === 1 };
};

export const actualizarUsuario = async (id: string, usuario: Omit<Usuario, 'id' | 'creado' | 'rol_nombre'>): Promise<Usuario> => {
  const headers = await getHeaders();
  const payload = {
    ...usuario,
    estado: usuario.activo ? 1 : 0,
    rol_id: usuario.rol_id,
    // Si la contraseña no se envía (vacía), el backend debería omitirla.
    // Por ahora la enviamos tal cual (puede ser vacía)
    password: usuario.password || ''
  };
  const response = await fetch(`${BASE_URL}/api/usuarios/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Error al actualizar el usuario');
  }
  const data = await response.json();
  return { ...data, activo: data.estado === 1 };
};

// ─── SERVICIOS DE ROLES (sin cambios) ─────────────────────────────────
export const obtenerRoles = async (): Promise<Rol[]> => {
  const headers = await getHeaders();
  const response = await fetch(`${BASE_URL}/api/roles/`, { method: 'GET', headers });
  if (!response.ok) {
    console.error(`Error en /api/roles. Status: ${response.status}`);
    throw new Error('Error al obtener los roles del sistema');
  }
  return await response.json();
};

export const crearRol = async (rol: Omit<Rol, 'id' | 'creado'>): Promise<Rol> => {
  const headers = await getHeaders();
  const response = await fetch(`${BASE_URL}/api/roles/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(rol)
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Error al crear el rol');
  }
  return await response.json();
};

export const actualizarRol = async (id: string, rol: Omit<Rol, 'id' | 'creado'>): Promise<Rol> => {
  const headers = await getHeaders();
  const response = await fetch(`${BASE_URL}/api/roles/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(rol)
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Error al actualizar el rol');
  }
  return await response.json();
};

export const eliminarRol = async (id: string): Promise<Rol> => {
  const headers = await getHeaders();
  const response = await fetch(`${BASE_URL}/api/roles/${id}`, { method: 'DELETE', headers });
  if (!response.ok) throw new Error('No se pudo eliminar el rol seleccionado');
  return await response.json();
};

// ─── SERVICIOS DE AUDITORÍA ──────────────────────────────────────────
export const obtenerLogsAuditoria = async (): Promise<LogAuditoria[]> => {
  const headers = await getHeaders();
  const response = await fetch(`${BASE_URL}/api/auditoria/`, {
    method: 'GET',
    headers
  });
  if (!response.ok) throw new Error('Error al obtener logs de auditoria');
  return await response.json();
};