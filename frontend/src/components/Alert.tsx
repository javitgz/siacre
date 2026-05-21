import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    PanResponder,
    PanResponderGestureState,
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';
import { colors } from '../styles/globalStyles';

// Tipado estricto para las propiedades de la Alerta
interface AlertProps {
  visible: boolean;
  tipo: 'positivo' | 'negativo';
  mensaje: string;
  onHide?: () => void;
}

export default function Alert({ visible, tipo, mensaje, onHide }: AlertProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;

  // Configurar PanResponder con tipado nativo para gestos de arrastre hacia arriba
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState: PanResponderGestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
        if (gestureState.dy < 0) {
          // Solo permitir arrastre hacia arriba (valores negativos)
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState: PanResponderGestureState) => {
        if (gestureState.dy < -50) {
          // Si arrastró más de 50px hacia arriba, cerrar
          cerrarAlerta();
        } else {
          // Si no, regresar a la posición original con efecto resorte
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 12,
          }).start();
        }
      },
    })
  ).current;

  const cerrarAlerta = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      panY.setValue(0);
      onHide?.(); // Ejecución segura opcional gracias a TypeScript
    });
  };

  useEffect(() => {
    if (visible) {
      // Resetear posición
      panY.setValue(0);
      
      // Animación de entrada
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 12,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-ocultar después de 3 segundos
      const timer = setTimeout(() => {
        cerrarAlerta();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  const isPositivo = tipo === 'positivo';
  const backgroundColor = isPositivo ? colors.verdeEsmeralda : '#dc3545';
  
  // Tipado estricto para asegurar que el icono exista en la librería glyphMap de Ionicons
  const iconName: keyof typeof Ionicons.glyphMap = isPositivo ? 'checkmark-circle' : 'alert-circle';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          transform: [{ translateY }, { translateY: panY }],
          opacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={cerrarAlerta}
        activeOpacity={0.9}
      >
        <Ionicons name={iconName} size={24} color={colors.blanco} />
        <Text style={styles.texto}>{mensaje}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  texto: {
    flex: 1,
    color: colors.blanco,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});