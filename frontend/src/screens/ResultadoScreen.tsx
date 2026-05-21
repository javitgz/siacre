import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';

type Props = StackScreenProps<RootStackParamList, 'Resultado'>;

export default function ResultadoScreen({ route, navigation }: Props) {
  // Extraemos todos los parámetros dinámicos con valores seguros por defecto
  const {
    tipo = 'positivo',
    titulo = 'Operación Exitosa',
    subtitulo,
    rutaDestino = 'Dashboard',
    tiempoEspera = 1500,
    textoBoton = 'Continuar'
  } = route.params || {};

  const esPositivo = tipo === 'positivo';

  useEffect(() => {
    // Si es un resultado positivo, avanza automáticamente tras el tiempo configurado
    if (esPositivo) {
      const timer = setTimeout(() => {
        navigation.replace(rutaDestino as any);
      }, tiempoEspera);

      return () => clearTimeout(timer);
    }
  }, [navigation, esPositivo, rutaDestino, tiempoEspera]);

  const handleBotonPress = () => {
    // Para flujos manuales (especialmente errores), el usuario presiona el botón para avanzar o regresar
    navigation.replace(rutaDestino as any);
  };

  return (
    <View style={styles.container}>
      {/* Icono Dinámico: Cambia según el tipo de respuesta */}
      <Ionicons 
        name={esPositivo ? "checkmark-circle" : "close-circle"} 
        size={110} 
        color={esPositivo ? colors.verdeEsmeralda : colors.rojoError} 
      />
      
      {/* Título Dinámico */}
      <Text style={styles.titulo}>{titulo}</Text>
      
      {/* Subtítulo Dinámico (Opcional) */}
      {subtitulo && <Text style={styles.subtitulo}>{subtitulo}</Text>}

      {/* Botón de acción: Se muestra automáticamente si es negativo, o si es positivo pero no queremos temporizador */}
      {!esPositivo && (
        <TouchableOpacity style={styles.boton} onPress={handleBotonPress}>
          <Text style={styles.botonTexto}>{textoBoton}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.azulOscuro, // Mantenemos tu elegante fondo corporativo
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  titulo: {
    color: colors.blanco,
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 24,
    textAlign: 'center',
  },
  subtitulo: {
    color: colors.blanco,
    opacity: 0.75,
    fontSize: 15,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
  boton: {
    backgroundColor: colors.azulClaro || '#4A78A8',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 35,
    width: '100%',
    alignItems: 'center',
  },
  botonTexto: {
    color: colors.blanco,
    fontWeight: 'bold',
    fontSize: 16,
  },
});