import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import {
    ActivityIndicator,
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
import { loginUser } from '../utils/api';
import { saveUserSession } from '../utils/storage';

type Props = StackScreenProps<RootStackParamList, 'Login'>;
type TipoAlerta = 'positivo' | 'negativo';

export default function LoginScreen({ navigation }: Props) {
    const [correo, setCorreo] = useState<string>('');
    const [clave, setClave] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [alertVisible, setAlertVisible] = useState<boolean>(false);
    const [alertTipo, setAlertTipo] = useState<TipoAlerta>('negativo');
    const [alertMensaje, setAlertMensaje] = useState<string>('');

    const handleLogin = async () => {
        if (!correo.trim() || !clave.trim()) {
            setAlertTipo('negativo');
            setAlertMensaje('Por favor, completa todos los campos.');
            setAlertVisible(true);
            return;
        }

        setLoading(true);
        try {
            // ✅ Una sola llamada a loginUser
            const response = await loginUser({ 
                email: correo.trim(), 
                password: clave 
            });

            // ✅ Guardar token y datos de usuario en SecureStore
            await saveUserSession({
                access_token: response.access_token,
                user: response.user
            });

            // ✅ Mostrar alerta con el nombre del usuario
            setAlertTipo('positivo');
            setAlertMensaje(`¡Bienvenido, ${response.user.nombre}!`);
            setAlertVisible(true);

            setTimeout(() => {
                setAlertVisible(false);
                navigation.replace('Resultado', {
                    tipo: 'positivo',
                    titulo: '¡Bienvenido!',
                    subtitulo: 'Cargando la aplicación..',
                    rutaDestino: 'Dashboard',
                    tiempoEspera: 1500 
                });
            }, 1200);

        } catch (error: any) {
            setAlertTipo('negativo');
            setAlertMensaje(error.message || 'Error inesperado al iniciar sesión');
            setAlertVisible(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
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
                    autoCorrect={false}
                    editable={!loading}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    placeholderTextColor={colors.gris}
                    value={clave}
                    onChangeText={setClave}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                />

                <TouchableOpacity 
                    style={[styles.boton, loading && styles.botonDeshabilitado]} 
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.blanco} />
                    ) : (
                        <Text style={styles.botonTexto}>Iniciar sesión</Text>
                    )}
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
        color: '#000000',
    },
    boton: {
        backgroundColor: colors.azulClaro,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    botonDeshabilitado: {
        backgroundColor: '#a2c8f2',
    },
    botonTexto: {
        color: colors.blanco,
        fontWeight: 'bold',
        fontSize: 16,
    },
});