// frontend/src/utils/asyncStorage.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Interfaces estructurales para el tipado seguro de SIACRE
 * Permiten que TypeScript entienda la composición de tus modelos de datos
 */
export interface Cliente {
    id?: string;
    nombre?: string;
    documento?: string;
    [key: string]: any; // Permite propiedades dinámicas temporales de formularios
}

export interface Solicitud {
    id?: string;
    fecha?: string;
    estado?: string;
    fechaRevision?: string;
    observacion?: string;
    revisadoPor?: string;
    [key: string]: any; // Permite almacenar dinámicamente datos financieros o scores
}

// Claves estrictamente necesarias para el almacenamiento local temporal o modo offline
const STORAGE_KEYS = {
    CLIENTES: '@siacre_clientes',
    SOLICITUDES: '@siacre_solicitudes',
};

// ==============================================================================================
// SECCIÓN: GESTIÓN DE CLIENTES (MÍNIMO LOCAL)
// ==============================================================================================

export const guardarClientes = async (clientes: Cliente[]): Promise<boolean> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(clientes));
        return true;
    } catch (error) {
        console.error('Error guardando clientes en AsyncStorage:', error);
        return false;
    }
};

export const obtenerClientes = async (): Promise<Cliente[]> => {
    try {
        const clientes = await AsyncStorage.getItem(STORAGE_KEYS.CLIENTES);
        return clientes ? JSON.parse(clientes) : [];
    } catch (error) {
        console.error('Error obteniendo clientes de AsyncStorage:', error);
        return [];
    }
};

export const agregarCliente = async (cliente: Cliente): Promise<Cliente | null> => {
    try {
        const clientes = await obtenerClientes();
        const nuevoCliente: Cliente = { ...cliente, id: Date.now().toString() };
        clientes.push(nuevoCliente);
        const guardadoExitoso = await guardarClientes(clientes);
        return guardadoExitoso ? nuevoCliente : null;
    } catch (error) {
        console.error('Error agregando cliente en AsyncStorage:', error);
        return null;
    }
};

// ==============================================================================================
// SECCIÓN: GESTIÓN DE SOLICITUDES DE CRÉDITO (MÍNIMO LOCAL)
// ==============================================================================================

export const guardarSolicitudes = async (solicitudes: Solicitud[]): Promise<boolean> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.SOLICITUDES, JSON.stringify(solicitudes));
        return true;
    } catch (error) {
        console.error('Error guardando solicitudes en AsyncStorage:', error);
        return false;
    }
};

export const obtenerSolicitudes = async (): Promise<Solicitud[]> => {
    try {
        const solicitudes = await AsyncStorage.getItem(STORAGE_KEYS.SOLICITUDES);
        return solicitudes ? JSON.parse(solicitudes) : [];
    } catch (error) {
        console.error('Error obteniendo solicitudes de AsyncStorage:', error);
        return [];
    }
};

export const agregarSolicitud = async (solicitud: Solicitud): Promise<Solicitud | null> => {
    try {
        const solicitudes = await obtenerSolicitudes();
        const nuevaSolicitud: Solicitud = { 
            ...solicitud, 
            id: Date.now().toString(), 
            fecha: new Date().toISOString() 
        };
        solicitudes.push(nuevaSolicitud);
        const guardadoExitoso = await guardarSolicitudes(solicitudes);
        return guardadoExitoso ? nuevaSolicitud : null;
    } catch (error) {
        console.error('Error  agregando solicitud en AsyncStorage:', error);
        return null;
    }
};

export const actualizarEstadoSolicitud = async (
    id: string, 
    nuevoEstado: string, 
    observacion: string = ''
): Promise<Solicitud | null> => {
    try {
        const solicitudes = await obtenerSolicitudes();
        const index = solicitudes.findIndex(s => s.id === id);
        if (index !== -1) {
            solicitudes[index] = { 
                ...solicitudes[index], 
                estado: nuevoEstado,
                fechaRevision: new Date().toISOString(),
                observacion,
                revisadoPor: 'Coordinador'
            };
            const guardadoExitoso = await guardarSolicitudes(solicitudes);
            return guardadoExitoso ? solicitudes[index] : null;
        }
        return null;
    } catch (error) {
        console.error('Error actualizando estado de solicitud en AsyncStorage:', error);
        return null;
    }
};