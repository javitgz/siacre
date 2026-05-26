// src/utils/storage.ts
import * as SecureStore from 'expo-secure-store';

const USER_SESSION_KEY = 'siacre_user_session';

export interface UserSession {
    access_token: string;
    user: any;
}

/**
 * Guarda la sesión del usuario de forma cifrada en el dispositivo
 */
export const saveUserSession = async (session: UserSession): Promise<void> => {
    await SecureStore.setItemAsync(USER_SESSION_KEY, JSON.stringify(session));
};

/**
 * Recupera la sesión cifrada del usuario
 */
export const getUserSession = async (): Promise<UserSession | null> => {
    const session = await SecureStore.getItemAsync(USER_SESSION_KEY);
    return session ? JSON.parse(session) : null;
};


/**
 * Elimina la sesión (Cierre de sesión / Logout)
 */
export const deleteUserSession = async (): Promise<void> => {
    await SecureStore.deleteItemAsync(USER_SESSION_KEY);
};