import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity
} from 'react-native';
import Alert from '../components/Alert';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';

// Definición de propiedades de navegación para la pantalla de Login
type Props = StackScreenProps<RootStackParamList, 'Login'>;

// Tipo estricto para las alertas locales (en este caso, manejaremos solo la negativa)
type TipoAlerta = 'positivo' | 'negativo';

export default function LoginScreen({ navigation }: Props) {
    const [correo, setCorreo] = useState<string>('');
    const [clave, setClave] = useState<string>('');
    const [alertVisible, setAlertVisible] = useState<boolean>(false);
    const [alertTipo, setAlertTipo] = useState<TipoAlerta>('negativo');
    const [alertMensaje, setAlertMensaje] = useState<string>('');

    const handleLogin = () => {
        // 1. Validación básica de campos vacíos
        if (!correo.trim() || !clave.trim()) {
            setAlertTipo('negativo');
            setAlertMensaje('Por favor, completa todos los campos.');
            setAlertVisible(true);
            return;
        }

        // 2. Validación de credenciales quemadas para pruebas locales
        if (correo === 'admin@siacre.com' && clave === '123456') {
            // Primero activamos la notificación local positiva
            setAlertTipo('positivo');
            setAlertMensaje('Credenciales correctas');
            setAlertVisible(true);
            // Retrasamos el salto de pantalla 1.2 segundos para que el usuario pueda leer la notificación
            setTimeout(() => {
                setAlertVisible(false); // Ocultamos la alerta local justo antes de migrar
                // Ejecutamos el reemplazo hacia tu pantalla unificada de estado
                navigation.replace('Resultado', {
                    tipo: 'positivo',
                    titulo: '¡Bienvenido!',
                    subtitulo: 'Cargando la aplicación..',
                    rutaDestino: 'Dashboard',
                    tiempoEspera: 1500 // Tiempo que durará la pantalla azul antes del Dashboard
                });
            }, 1200); // 1200ms es el tiempo ideal de lectura para un mensaje corto
        } else {
            // Si falla, se queda en la pantalla y activa la notificación negativa local
            setAlertTipo('negativo');
            setAlertMensaje('Credenciales incorrectas');
            setAlertVisible(true);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* El componente Alert aquí solo se activará con las notificaciones negativas o de validación */}
            <Alert
                visible={alertVisible}
                tipo={alertTipo}
                mensaje={alertMensaje}
                onHide={() => setAlertVisible(false)}
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Image
                    source={require('../../assets/images/logo-siacre-claro.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.titulo}>Inicie sesión</Text>

                <TextInput
                    style={styles.input}
                    placeholder="nombre@example.com"
                    placeholderTextColor={colors.gris}
                    value={correo}
                    onChangeText={setCorreo}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    placeholderTextColor={colors.gris}
                    value={clave}
                    onChangeText={setClave}
                    secureTextEntry
                />

                <TouchableOpacity style={styles.boton} onPress={handleLogin}>
                    <Text style={styles.botonTexto}>Iniciar sesión</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.blanco,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    logo: {
        width: 250,
        height: 80,
        alignSelf: 'center',
        marginBottom: 20,
    },
    titulo: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
        color: colors.azulOscuro,
    },
    input: {
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginBottom: 12,
        fontSize: 14,
        backgroundColor: colors.blanco,
    },
    boton: {
        backgroundColor: colors.azulClaro,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    botonTexto: {
        color: colors.blanco,
        fontWeight: 'bold',
        fontSize: 16,
    },
});