import { API_HEADERS, BASE_URL } from '../constants/api';
import { getUserSession } from './storage';

// Importar tipos desde sus archivos
import type { AuditoriaFiltros, AuditoriaLog } from '../types/auditoria.types';
import type { LoginRequest, TokenResponse } from '../types/auth.types';
import type { Empresa, EmpresaCreate, EmpresaUpdate } from '../types/empresa.types';
import type { Escenario, EscenarioCreate, EscenarioUpdate } from '../types/escenario.types';
import type { Naturaleza, NaturalezaCreate, NaturalezaUpdate } from '../types/naturaleza.types';
import type { NucleoVariable, NucleoVariableUpdate } from '../types/nucleo.types';
import type { Parametro, ParametroCreate, ParametroUpdate } from '../types/parametros.types';
import type { Permiso, PermisoCreate, PermisoRelacion, PermisoUpdate, Rol, RolCreate, RolUpdate } from '../types/role.types';
import type { Score, ScoreUpdate } from '../types/score.types';
import type { Usuario, UsuarioCreate, UsuarioUpdate } from '../types/user.types';

// Re-exportar todos los tipos para compatibilidad con código existente
export type {
  Empresa,
  EmpresaUpdate, LoginRequest, Naturaleza,
  NaturalezaCreate,
  NaturalezaUpdate, Permiso, PermisoCreate, PermisoRelacion, PermisoUpdate, Rol,
  RolCreate,
  RolUpdate, TokenResponse,
  Usuario,
  UsuarioCreate,
  UsuarioUpdate
};

// ============================================================================
// FUNCIÓN BASE APIREQUEST
// ============================================================================

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const session = await getUserSession();
  const headers: Record<string, string> = {
    ...API_HEADERS,
    ...(options.headers as Record<string, string> || {}),
  };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  if (!response.ok) {
    let errorMessage = `Error HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch { }
    throw new Error(errorMessage);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

// ============================================================================
// ROLES (HU01)
// ============================================================================

export const obtenerRoles = async (skip = 0, limit = 100): Promise<Rol[]> => {
  return apiRequest<Rol[]>(`/api/roles?skip=${skip}&limit=${limit}`);
};

export const obtenerRolPorId = async (rolId: number): Promise<Rol> => {
  return apiRequest<Rol>(`/api/roles/${rolId}`);
};

export const crearRol = async (rolData: RolCreate): Promise<Rol> => {
  return apiRequest<Rol>('/api/roles', { method: 'POST', body: JSON.stringify(rolData) });
};

export const actualizarRol = async (rolId: number, rolData: RolUpdate): Promise<Rol> => {
  return apiRequest<Rol>(`/api/roles/${rolId}`, { method: 'PATCH', body: JSON.stringify(rolData) });
};

export const eliminarRol = async (rolId: number): Promise<Rol> => {
  return apiRequest<Rol>(`/api/roles/${rolId}`, { method: 'DELETE' });
};

// ============================================================================
// PERMISOS (HU02)
// ============================================================================

export const obtenerPermisos = async (skip = 0, limit = 100): Promise<Permiso[]> => {
  return apiRequest<Permiso[]>(`/api/permisos?skip=${skip}&limit=${limit}`);
};

export const crearPermiso = async (data: PermisoCreate): Promise<Permiso> => {
  return apiRequest<Permiso>('/api/permisos', { method: 'POST', body: JSON.stringify(data) });
};

export const actualizarPermiso = async (id: number, data: PermisoUpdate): Promise<Permiso> => {
  return apiRequest<Permiso>(`/api/permisos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
};

export const eliminarPermiso = async (id: number): Promise<Permiso> => {
  return apiRequest<Permiso>(`/api/permisos/${id}`, { method: 'DELETE' });
};

// ============================================================================
// PERMISOS ROLES (HU03)
// ============================================================================

export const obtenerPermisosCatalogo = async (skip = 0, limit = 100): Promise<Permiso[]> => {
  return apiRequest<Permiso[]>('/api/roles/permisos');
};

export const asignarPermisosARol = async (rolId: number, permisosIds: number[]): Promise<void> => {
  return apiRequest<void>(`/api/roles/${rolId}/permisos`, { method: 'POST', body: JSON.stringify(permisosIds) });
};

// ============================================================================
// NATURALEZAS (HU04)
// ============================================================================

export const obtenerNaturalezas = async (skip = 0, limit = 100): Promise<Naturaleza[]> => {
  return apiRequest<Naturaleza[]>(`/api/naturalezas?skip=${skip}&limit=${limit}`);
};

export const crearNaturaleza = async (data: NaturalezaCreate): Promise<Naturaleza> => {
  return apiRequest<Naturaleza>('/api/naturalezas', { method: 'POST', body: JSON.stringify(data) });
};

export const actualizarNaturaleza = async (id: number, data: NaturalezaUpdate): Promise<Naturaleza> => {
  return apiRequest<Naturaleza>(`/api/naturalezas/${id}`, { method: 'PUT', body: JSON.stringify(data) });
};

export const eliminarNaturaleza = async (id: number): Promise<Naturaleza> => {
  return apiRequest<Naturaleza>(`/api/naturalezas/${id}`, { method: 'DELETE' });
};

// ============================================================================
// EMPRESAS (HU05)
// ============================================================================

export const obtenerEmpresas = async (skip = 0, limit = 100): Promise<Empresa[]> => {
  return apiRequest<Empresa[]>(`/api/empresas?skip=${skip}&limit=${limit}`);
};

export const obtenerEmpresaPorId = async (id: number): Promise<Empresa> => {
  return apiRequest<Empresa>(`/api/empresas/${id}`);
};

export const crearEmpresa = async (data: EmpresaCreate): Promise<Empresa> => {
  return apiRequest<Empresa>('/api/empresas', { method: 'POST', body: JSON.stringify(data) });
};

export const actualizarEmpresa = async (id: number, data: EmpresaUpdate): Promise<Empresa> => {
  return apiRequest<Empresa>(`/api/empresas/${id}`, { method: 'PUT', body: JSON.stringify(data) });
};

export const eliminarEmpresa = async (id: number): Promise<Empresa> => {
  return apiRequest<Empresa>(`/api/empresas/${id}`, { method: 'DELETE' });
};

// ============================================================================
// USUARIOS (HU06)
// ============================================================================

// AUTENTICACIÓN DE USUARIOS

export const loginUser = async (credentials: LoginRequest): Promise<TokenResponse> => {
  const formData = new URLSearchParams();
  formData.append('username', credentials.email);
  formData.append('password', credentials.password);
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });
  if (!response.ok) {
    let errorMessage = 'Credenciales inválidas';
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch { }
    throw new Error(errorMessage);
  }
  return response.json() as Promise<TokenResponse>;
};

export const obtenerUsuarios = async (skip = 0, limit = 100): Promise<Usuario[]> => {
  return apiRequest<Usuario[]>(`/api/usuarios?skip=${skip}&limit=${limit}`);
};

export const crearUsuario = async (usuarioData: UsuarioCreate): Promise<Usuario> => {
  return apiRequest<Usuario>('/api/usuarios', { method: 'POST', body: JSON.stringify(usuarioData) });
};

export const actualizarUsuario = async (userId: number, usuarioData: UsuarioUpdate): Promise<Usuario> => {
  return apiRequest<Usuario>(`/api/usuarios/${userId}`, { method: 'PATCH', body: JSON.stringify(usuarioData) });
};

export const eliminarUsuario = async (userId: number): Promise<Usuario> => {
  return apiRequest<Usuario>(`/api/usuarios/${userId}`, { method: 'DELETE' });
};

export const cambiarEstadoUsuario = async (userId: number, activo: boolean): Promise<Usuario> => {
  return apiRequest<Usuario>(`/api/usuarios/${userId}/estado?activo=${activo}`, { method: 'PATCH' });
};

export const obtenerMiPerfil = async (): Promise<Usuario> => {
  return apiRequest<Usuario>('/api/usuarios/me');
};

export const actualizarMiPerfil = async (usuarioData: UsuarioUpdate): Promise<Usuario> => {
  return apiRequest<Usuario>('/api/usuarios/me', { method: 'PATCH', body: JSON.stringify(usuarioData) });
};

// ============================================================================
// AUDITORÍA (HU07)
// ============================================================================

export const obtenerLogsAuditoria = async (filtros: AuditoriaFiltros = {}): Promise<AuditoriaLog[]> => {
  const params = new URLSearchParams();
  if (filtros.skip !== undefined) params.append('skip', filtros.skip.toString());
  if (filtros.limit !== undefined) params.append('limit', filtros.limit.toString());
  if (filtros.usuario_id !== undefined) params.append('usuario_id', filtros.usuario_id.toString());
  if (filtros.empresa_id !== undefined) params.append('empresa_id', filtros.empresa_id.toString());
  if (filtros.accion) params.append('accion', filtros.accion);
  if (filtros.entidad) params.append('entidad', filtros.entidad);
  if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
  if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
  const url = `/api/auditorias?${params.toString()}`;
  return apiRequest<AuditoriaLog[]>(url);
};

// ============================================================================
// NÚCLEO DE VARIABLES (HU08)
// ============================================================================

export const obtenerNucleoVariables = async (): Promise<NucleoVariable[]> => {
  return apiRequest<NucleoVariable[]>('/api/nucleo-variables');
};

export const actualizarNucleoVariable = async (nombre: string, data: NucleoVariableUpdate): Promise<NucleoVariable> => {
  return apiRequest<NucleoVariable>(`/api/nucleo-variables/${nombre}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// ============================================================================
// SCORE (HU09)
// ============================================================================

export const obtenerScore = async (): Promise<Score> => {
  return apiRequest<Score>('/api/score');
};

export const actualizarScore = async (id: number, data: ScoreUpdate): Promise<Score> => {
  return apiRequest<Score>(`/api/score/${id}`, { method: 'PUT', body: JSON.stringify(data) });
};

export const recalcularDistribucion = async (): Promise<Score> => {
  return apiRequest<Score>('/api/score/recalcular-distribucion', { method: 'POST' });
};

// ============================================================================
// PARAMETROS (HU10)
// ============================================================================

export const obtenerParametros = async (): Promise<Parametro[]> => {
  return apiRequest<Parametro[]>('/api/parametros');
};

export const crearParametro = async (data: ParametroCreate): Promise<Parametro> => {
  return apiRequest<Parametro>('/api/parametros', { method: 'POST', body: JSON.stringify(data) });
};

export const actualizarParametro = async (id: number, data: ParametroUpdate): Promise<Parametro> => {
  return apiRequest<Parametro>(`/api/parametros/${id}`, { method: 'PUT', body: JSON.stringify(data) });
};

export const eliminarParametro = async (id: number): Promise<Parametro> => {
  return apiRequest<Parametro>(`/api/parametros/${id}`, { method: 'DELETE' });
};

// ============================================================================
// ESCENARIOS (HU11)
// ============================================================================

export const obtenerEscenariosPorParametro = async (parametroId: number): Promise<Escenario[]> => {
  return apiRequest<Escenario[]>(`/api/escenarios/parametro/${parametroId}`);
};

export const crearEscenario = async (data: EscenarioCreate): Promise<Escenario> => {
  return apiRequest<Escenario>('/api/escenarios', { method: 'POST', body: JSON.stringify(data) });
};

export const actualizarEscenario = async (id: number, data: EscenarioUpdate): Promise<Escenario> => {
  return apiRequest<Escenario>(`/api/escenarios/${id}`, { method: 'PUT', body: JSON.stringify(data) });
};

export const eliminarEscenario = async (id: number): Promise<Escenario> => {
  return apiRequest<Escenario>(`/api/escenarios/${id}`, { method: 'DELETE' });
};

// ============================================================================
// RIESGO (Matriz de riesgo) (HU12)
// ============================================================================

// ============================================================================
// VERSION SCORING (HU13)
// ============================================================================

// ============================================================================
// CLIENTES Y CREDITOS (HU14)
// ============================================================================

// ============================================================================
// LIMITES_CARTERA (HU15)
// ============================================================================

// ============================================================================
// PAGARES (HU16)
// ============================================================================

// ============================================================================
// DASHBOARD (HU17)
// ============================================================================

// ============================================================================
// REPORTES (HU18)
// ============================================================================

// ============================================================================
// NOTIFICACIONES (HU19)
// ============================================================================

// ============================================================================
// REPORTES (HU120)
// ============================================================================