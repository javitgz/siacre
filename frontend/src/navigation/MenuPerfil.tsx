import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import {
    Modal,
    Alert as RNAlert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';

// Interface estricta para las propiedades del componente
interface MenuPerfilProps {
  visible: boolean;
  onClose: () => void;
  // Usamos StackNavigationProp para habilitar métodos específicos de Stacks como .replace()
  navigation: StackNavigationProp<RootStackParamList, keyof RootStackParamList>;
}

export default function MenuPerfil({ visible, onClose, navigation }: MenuPerfilProps) {
  
  const handleCerrarSesion = () => {
    RNAlert.alert(
      'Cerrar sesión',
      '¿Está seguro que desea cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            onClose();
            navigation.replace('Login'); // Redirección limpia destruyendo el historial anterior
          },
        },
      ]
    );
  };

  const handleVerPerfil = () => {
    onClose();
    navigation.navigate('MiPerfil');
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.menuContainer}>
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem} onPress={handleVerPerfil}>
              <Ionicons name="person-outline" size={20} color={colors.azulOscuro} />
              <Text style={styles.menuItemText}>Mi Perfil</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.menuItem} onPress={handleCerrarSesion}>
              <Ionicons name="log-out-outline" size={20} color="#dc3545" />
              <Text style={[styles.menuItemText, styles.cerrarSesionText]}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    position: 'absolute',
    top: 100,
    right: 16,
  },
  menu: {
    backgroundColor: colors.blanco,
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemText: {
    fontSize: 14,
    color: colors.grisOscuro,
  },
  cerrarSesionText: {
    color: '#dc3545',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 4,
  },
});