export interface Parametro { 
    id: string,
    nombre: string;
    descripcion: string;
    peso?: number;
    tipo_medicion?: 'meta' | 'rango' | string;
    valor_meta?: string;
    rango_min?: string;
    rango_max?: string;
}