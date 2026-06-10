import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';
import { deleteUserSession, getUserSession } from '../utils/storage';

// Definicion de tipos para las propiedades de la pantalla usando el Stack de navegacion
type Props = StackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({navigation}: Props){
    useEffect(()=>{
        const verificarSesionProgreso = async () => {
            // Carga de dos segundos para espera

            const tiempoEspera = new Promise((resolve)=> setTimeout(resolve, 2000));

            try {
                await deleteUserSession(); // añadida temporalmente
                // Ejecutamos la lectura del SecureStore en paralelo con el temporizador de la animación
                const [session] = await Promise.all([getUserSession(), tiempoEspera]);
                // Si hay un token valido guardado, saltamos al Dashboard; si no, al Login
                if (session && session.access_token){
                    navigation.replace('Dashboard');
                } else {
                    navigation.replace('Login');
                }
            } catch (error) {
                console.error('Error al validad sision en Splash: ', error);
                // Por seguridad, ante cualquier fallo del almacenamiento seguro, redirigirse al Login
                navigation.replace('Login');
            }
        };
        verificarSesionProgreso();
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Image
            source={require('../../assets/images/logo-siacre-oscuro.png')}
            style={styles.logo}
            resizeMode='contain'
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.azulOscuro,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 200,
        height: 200,
    },
});