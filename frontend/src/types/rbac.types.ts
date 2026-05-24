// INTERFAZ DEL MODELO RBAC
export interface Permisos {
    dashboard: boolean;
    clientes: boolean;
    reportes: boolean;
    configuracion: boolean;
    usuarios: boolean;
    roles: boolean;
    auditoria: boolean;
}

export interface Rol {
    id: string;
    nombre: string;
    permisos: Permisos;
}