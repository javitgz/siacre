import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect, useRef, useState } from 'react';
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

// Definición de tipos para las propiedades de la pantalla
type Props = StackScreenProps<RootStackParamList, 'Login'>;

// Tipo estricto para las respuestas de alerta en SIACRE
type TipoAlerta = 'positivo' | 'negativo';

export default function LoginScreen({ navigation }: Props) {
  const [correo, setCorreo] = useState<string>('');
  const [clave, setClave] = useState<string>('');
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertTipo, setAlertTipo] = useState<TipoAlerta>('positivo');
  const [alertMensaje, setAlertMensaje] = useState<string>('');

  // Referencia segura para el temporizador, evitando conflictos con el namespace NodeJS
  const loginTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Limpieza al desmontar el componente
    return () => {
      if (loginTimerRef.current) {
        clearTimeout(loginTimerRef.current);
      }
    };
  }, []);

  const mostrarAlerta = (tipo: TipoAlerta, mensaje: string) => {
    setAlertTipo(tipo);
    setAlertMensaje(mensaje);
    setAlertVisible(true);
  };

  const handleLogin = () => {
    if (!correo.trim() || !clave.trim()) {
      mostrarAlerta('negativo', '¡Error al ingresar!');
      return;
    } // <-- ¡Llave corregida aquí!

    mostrarAlerta('positivo', '¡Datos correctos!');
    
    loginTimerRef.current = setTimeout(() => {
      navigation.replace('RespuestaPositiva');
    }, 2000);
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