import AsyncStorage from '@react-native-async-storage/async-storage';
/**
 * Interfaces estructurales para el tipado seguro de SIACRE
 * Permiten que TypeScript entienda la composicion de tus modelos de datos
*/
export interface Cliente {
    id?: string;
    nombre?: string;
    documento?: string;
    [key: string]: any; // permite que cualquier otra propiedad dinamica que ya uses en tus formularios
}

export interface Solicitud {
    id?: string;
    fecha?: string;
    estado?: string;
    fechaRevision?: string;
    observacion?: string;
    revisadoPor?: string;
    [key: string]: any; // permite almacenar dinamicamente datos financieros, scores, etc.
}

// Claves centralizadas para el almacenamiento local
const STORAGE_KEYS = {
    CLIENTES: '@siacre_clientes',
    USUARIOS: '@siacre_usuarios',
    PARAMETROS: '@siacre_parameters',
    SCORING_CONFIG: '@siacre_scoring_config',
    SOLICITUDES: '@siacre_solicitudes',
};

// ==============================================================================================
// SECCION: GESTION DE CLIENTES
// ==============================================================================================

export const guardarClientes = async (clientes: Cliente[]): Promise<boolean> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(clientes));
        return true;
    } catch (error) {
        console.error('Error guardando clientes:', error);
        return false;
    }
};

export const obtenerClientes = async (): Promise<Cliente[]> => {
    try {
        const clientes = await AsyncStorage.getItem(STORAGE_KEYS.CLIENTES);
        return clientes ? JSON.parse(clientes) : [];
    } catch (error) {
        console.error('Error obteniendo clientes:', error);
        return [];
    }
};

export const agregarCliente = async (cliente: Cliente): Promise<Cliente | null> => {
    try {
        const clientes = await obtenerClientes();
        const nuevoCliente: Cliente = {... cliente, id: Date.now().toString() };
        clientes.push(nuevoCliente);
        await guardarClientes(clientes);
        return nuevoCliente;
    } catch (error) {
        console.error('Error agregando cliente:', error);
        return null;
    }
};

export const actualizarCliente = async (id: string, datosActualizados: Partial<Cliente>): Promise<Cliente | null> => {
    try {
        const clientes = await obtenerClientes();
        const index = clientes.findIndex(c => c.id === id);
        if (index !== -1){
            clientes[index] = {...clientes[index], ...datosActualizados };
            await guardarClientes(clientes);
            return clientes[index];
        }
        return null;
    } catch (error) {
        console.error('Error actualizando cliente:', error);
        return null;
    }
};

export const eliminarCliente = async (id: string): Promise<boolean> => {
    try {
        const clientes = await obtenerClientes();
        const nuevoClientes = clientes.filter(c => c.id !== id);
        await guardarClientes(nuevoClientes);
        return true;
    } catch (error) {
        console.error('Error eliminando cliente:', error);
        return false;
    }
};

// ==========================================
// SECCIÓN: GESTIÓN DE SOLICITUDES DE CRÉDITO
// ==========================================

export const guardarSolicitudes = async (solicitudes: Solicitud[]): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SOLICITUDES, JSON.stringify(solicitudes));
    return true;
  } catch (error) {
    console.error('Error guardando solicitudes:', error);
    return false;
  }
};

export const obtenerSolicitudes = async (): Promise<Solicitud[]> => {
  try {
    const solicitudes = await AsyncStorage.getItem(STORAGE_KEYS.SOLICITUDES);
    return solicitudes ? JSON.parse(solicitudes) : [];
  } catch (error) {
    console.error('Error obteniendo solicitudes:', error);
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
    await guardarSolicitudes(solicitudes);
    return nuevaSolicitud;
  } catch (error) {
    console.error('Error agregando solicitud:', error);
    return null;
  }
};

export const obtenerSolicitudesPorEstado = async (estado: string): Promise<Solicitud[]> => {
  try {
    const solicitudes = await obtenerSolicitudes();
    return solicitudes.filter(s => s.estado === estado);
  } catch (error) {
    console.error('Error obteniendo solicitudes por estado:', error);
    return [];
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
        revisadoPor: 'Coordinador' // Ajustable según el flujo de autenticación posterior
      };
      await guardarSolicitudes(solicitudes);
      return solicitudes[index];
    }
    return null;
  } catch (error) {
    console.error('Error actualizando solicitud:', error);
    return null;
  }
};