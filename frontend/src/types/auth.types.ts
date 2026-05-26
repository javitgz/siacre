export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  nombre: string;
  email: string;
  estado: number;
  rol_id: number;
  creado: string; // O Date para parsearlo
}