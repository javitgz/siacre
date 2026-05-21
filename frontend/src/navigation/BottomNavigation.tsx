import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';

// Estructura estricta para cada elemento del menú flotante
interface MenuItem {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen: keyof RootStackParamList; // Asegura que la pantalla exista en el AppNavigator
}

// Propiedades que recibe el componente
interface BottomNavigationProps {
  navigation: StackNavigationProp<RootStackParamList, keyof RootStackParamList>;
  currentScreen: keyof RootStackParamList | string;
}

const menus: MenuItem[] = [
  { name: 'Inicio', icon: 'home-outline', screen: 'Dashboard' },
  { name: 'Clientes', icon: 'briefcase-outline', screen: 'Clientes' },
  { name: 'Parámetros', icon: 'options-outline', screen: 'Parametros' },
  { name: 'Reportes', icon: 'pie-chart-outline', screen: 'Reportes' },
  { name: 'Config', icon: 'settings-outline', screen: 'Configuracion' },
  { name: 'Usuarios', icon: 'person-outline', screen: 'Usuarios' },
];

export default function BottomNavigation({ navigation, currentScreen }: BottomNavigationProps) {
  
  const handlePress = (screen: keyof RootStackParamList) => {
    if (screen !== currentScreen && navigation) {
      // Forzamos el tipado de la ruta para el método navigate heredado del Stack
      navigation.navigate(screen as any);
    }
  };

  const screenActual = typeof currentScreen === 'string' ? currentScreen : 'Dashboard';

  return (
    <View style={styles.container}>
      {menus.map((menu) => (
        <TouchableOpacity
          key={menu.screen}
          style={styles.icono}
          onPress={() => handlePress(menu.screen)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={menu.icon}
            size={25}
            color={screenActual === menu.screen ? colors.verdeEsmeralda : colors.blanco}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: '5%',
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.azulOscuro,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 8,
    // Sombra suave
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  icono: {
    padding: 8,
  },
});