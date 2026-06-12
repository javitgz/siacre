export type TipoVariable = 'cualitativa' | 'cuantitativa';

export interface NucleoVariable {
  id: number;
  nombre: TipoVariable;
  carga: number;      // peso entre 0 y 1
  descripcion: string | null;
  estado: number;     // 1 activo, 0 inactivo
  creado: string;
  modificado: string;
}

export interface NucleoVariableUpdate {
  carga?: number;
  descripcion?: string | null;
  estado?: number;
}