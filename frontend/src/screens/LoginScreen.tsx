import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
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
import { BASE_URL } from '../constants/api';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';
import { loginUser } from '../utils/api';
import { deleteUserSession, saveUserSession } from '../utils/storage';

type Props = StackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTipo, setAlertTipo] = useState<'positivo' | 'negativo'>('negativo');
  const [alertMensaje, setAlertMensaje] = useState('');

  useEffect(() => {
    const limpiarSesionAnterior = async () => {
      await deleteUserSession();
    };
    limpiarSesionAnterior();
  }, []);

  const handleLogin = async () => {
    if (!correo.trim() || !clave.trim()) {
      setAlertTipo('negativo');
      setAlertMensaje('Por favor, completa todos los campos.');
      setAlertVisible(true);
      return;
    }

    setLoading(true);
    try {
      // 1. Obtener token
      const tokenResponse = await loginUser({ email: correo.trim(), password: clave });
      const token = tokenResponse.access_token;

      // 2. Obtener perfil manualmente con el token
      const profileResponse = await fetch(`${BASE_URL}/api/usuarios/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        throw new Error(`Error al obtener perfil: ${profileResponse.status} - ${errorText}`);
      }

      const perfil = await profileResponse.json();

      // 3. Guardar sesión completa
      await saveUserSession({
        access_token: token,
        token_type: tokenResponse.token_type,
        user: {
          id: perfil.id.toString(),
          nombre: perfil.nombres,
          email: perfil.email,
          rol_id: perfil.rol_id.toString(),
          rol_nombre: perfil.rol_nombre || '',  // ← añadir esto
          empresa_id: perfil.empresa_id.toString(),
        }
      });

      // 4. Mostrar éxito
      setAlertTipo('positivo');
      setAlertMensaje(`¡Bienvenido, ${perfil.nombres}!`);
      setAlertVisible(true);

      setTimeout(() => {
        setAlertVisible(false);
        navigation.replace('Resultado', {
          tipo: 'positivo',
          titulo: '¡Bienvenido!',
          subtitulo: 'Cargando la aplicación...',
          rutaDestino: 'Dashboard',
          tiempoEspera: 1500
        });
      }, 1200);

    } catch (error: any) {
      console.log('Error en login:', error);
      setAlertTipo('negativo');
      setAlertMensaje(error.message || 'Credenciales inválidas o error de conexión');
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
      <Alert visible={alertVisible} tipo={alertTipo} mensaje={alertMensaje} onHide={() => setAlertVisible(false)} />
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
          {loading ? <ActivityIndicator color={colors.blanco} /> : <Text style={styles.botonTexto}>Iniciar sesión</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.blanco },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  logo: { width: 250, height: 80, alignSelf: 'center', marginBottom: 20 },
  titulo: { fontSize: 18, textAlign: 'center', marginBottom: 20, color: colors.azulOscuro },
  input: { borderWidth: 1, borderColor: '#dee2e6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 12, fontSize: 14, backgroundColor: colors.blanco, color: '#000' },
  boton: { backgroundColor: colors.azulClaro, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  botonDeshabilitado: { backgroundColor: '#a2c8f2' },
  botonTexto: { color: colors.blanco, fontWeight: 'bold', fontSize: 16 },
});