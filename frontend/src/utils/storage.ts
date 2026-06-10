// src/utils/storage.ts
import * as SecureStore from 'expo-secure-store';

const USER_SESSION_KEY = 'siacre_user_session';

export interface UserData {
    id: string;
    nombre: string;
    email: string;
    rol_id: string;
    empresa_id: string;
}

export interface UserSession {
    access_token: string;
    token_type?: string; // Con signo de interrogación para hacerlo opcional
    user: UserData;
}

/**
 * Guarda la sesión cifrada proveniendte del backend FastAPI
 */
export const saveUserSession = async (session: UserSession): Promise<void> => {
    try {
        await SecureStore.setItemAsync(USER_SESSION_KEY, JSON.stringify(session));
    } catch (error) {
        console.error('Error al guardar la sesion segura: ', error);
        throw new Error('No se pudo persistir la sesion de forma cifrada.');
    }
};

/**
 * Recupera la sesión cifrada actual activa
 */
export const getUserSession = async (): Promise<UserSession | null> => {
    try {
        const sessionStr = await SecureStore.getItemAsync(USER_SESSION_KEY);
        return sessionStr ? JSON.parse(sessionStr) : null;
    } catch (error) {
        console.error('Error al recuperar la sesion segura: ', error);
        return null;
    }
};


/**
 * Elimina el token y destruye la sesion del dispositivo
 */
export const deleteUserSession = async (): Promise<void> => {
    try {
        await SecureStore.deleteItemAsync(USER_SESSION_KEY);
    } catch (error) {
        console.error('Error al eliminar la sesion segura: ', error);
    }
};