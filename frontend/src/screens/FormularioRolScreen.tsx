import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import React, { ComponentProps, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Alert from '../components/Alert';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';
import { Permisos, Rol } from './RolesScreen'; // Reutilizamos las interfaces core para evitar duplicar código

// ─── INTERFACES LOCALES ──────────────────────────────────────────────

interface FormDataState {
  nombre: string;
  permisos: Permisos;
}

interface Modulo {
  id: keyof Permisos;
  nombre: string;
  icono: ComponentProps<typeof Ionicons>['name'];
}

type Props = StackScreenProps<RootStackParamList, 'FormularioRol'>;

export default function FormularioRolScreen({ navigation, route }: Props) {
  // Extraemos de forma segura el parámetro opcional gracias al Navigator corregido
  const rolExistente = route.params?.rolExistente;
  const esEdicion = !!rolExistente;

  const [formData, setFormData] = useState<FormDataState>({
    nombre: rolExistente?.nombre || '',
    permisos: rolExistente?.permisos || {
      dashboard: true,
      clientes: false,
      parametros: false,
      reportes: false,
      configuracion: false,
      usuarios: false,
      roles: false,
      auditoria: false,
    },
  });

  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertTipo, setAlertTipo] = useState<'positivo' | 'negativo'>('positivo');
  const [alertMensaje, setAlertMensaje] = useState<string>('');

  // Diccionario estricto sincronizado con la pantalla de visualización
  const modulos: Modulo[] = [
    { id: 'dashboard', nombre: 'Dashboard', icono: 'home-outline' },
    { id: 'clientes', nombre: 'Clientes', icono: 'briefcase-outline' },
    { id: 'parametros', nombre: 'Parámetros', icono: 'options-outline' },
    { id: 'reportes', nombre: 'Reportes', icono: 'pie-chart-outline' },
    { id: 'configuracion', nombre: 'Configuración', icono: 'settings-outline' },
    { id: 'usuarios', nombre: 'Usuarios', icono: 'people-outline' },
    { id: 'roles', nombre: 'Roles', icono: 'key-outline' },
    { id: 'auditoria', nombre: 'Auditoría', icono: 'document-text-outline' },
  ];

  const mostrarAlerta = (tipo: 'positivo' | 'negativo', mensaje: string) => {
    setAlertTipo(tipo);
    setAlertMensaje(mensaje);
    setAlertVisible(true);
  };

  // El argumento se restringe estrictamente a las llaves válidas de la interfaz Permisos
  const togglePermiso = (moduloId: keyof Permisos) => {
    setFormData((prev) => ({
      ...prev,
      permisos: {
        ...prev.permisos,
        [moduloId]: !prev.permisos[moduloId],
      },
    }));
  };

  const handleGuardar = async () => {
    if (!formData.nombre.trim()) {
      mostrarAlerta('negativo', 'Ingrese el nombre del rol');
      return;
    }

    const nuevoRol: Rol = {
      id: rolExistente?.id || Date.now().toString(),
      nombre: formData.nombre.trim(),
      permisos: formData.permisos,
    };

    try {
      const rolesGuardados = await AsyncStorage.getItem('@roles');
      let lista: Rol[] = rolesGuardados ? (JSON.parse(rolesGuardados) as Rol[]) : [];

      if (esEdicion) {
        lista = lista.map((r) => (r.id === rolExistente.id ? nuevoRol : r));
      } else {
        lista.push(nuevoRol);
      }

      await AsyncStorage.setItem('@roles', JSON.stringify(lista));

      mostrarAlerta('positivo', `Rol ${esEdicion ? 'actualizado' : 'creado'} correctamente`);
      
      // Retraso controlado para que el usuario experimente la alerta antes de salir
      setTimeout(() => {
        navigation.goBack();
      }, 1300);
    } catch (error) {
      console.error('Error guardando rol:', error);
      mostrarAlerta('negativo', 'Error al guardar el rol');
    }
  };

  return (
    <View style={styles.container}>
      <Alert
        visible={alertVisible}
        tipo={alertTipo}
        mensaje={alertMensaje}
        onHide={() => setAlertVisible(false)}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Cabecera Corporativa */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.azulOscuro} />
          </TouchableOpacity>
          <Text style={styles.titulo}>
            {esEdicion ? 'Editar' : 'Crear'} rol
          </Text>
          <View style={styles.placeholderHeader} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Input Nombre */}
          <Text style={styles.label}>Nombre del rol *</Text>
          <TextInput
            style={styles.input}
            value={formData.nombre}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, nombre: text }))}
            placeholder="Ej: Analista Senior"
            placeholderTextColor="#adb5bd"
          />

          {/* Listado de Selección de Permisos (RBAC) */}
          <Text style={styles.labelPermisos}>Permisos de Acceso</Text>
          
          <View style={styles.checkboxContainer}>
            {modulos.map((modulo) => {
              const activo = formData.permisos[modulo.id];
              return (
                <TouchableOpacity
                  key={modulo.id}
                  style={[styles.permisoCheckbox, activo && styles.permisoCheckboxActivo]}
                  onPress={() => togglePermiso(modulo.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={activo ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={activo ? colors.azulClaro : colors.gris}
                  />
                  <View style={styles.permisoCheckboxInfo}>
                    <Ionicons 
                      name={modulo.icono} 
                      size={16} 
                      color={activo ? colors.azulOscuro : colors.grisOscuro} 
                    />
                    <Text style={[styles.permisoCheckboxText, activo && styles.textActivo]}>
                      {modulo.nombre}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Botón de Guardado */}
          <TouchableOpacity style={styles.boton} onPress={handleGuardar} activeOpacity={0.8}>
            <Text style={styles.botonTexto}>Guardar Configuración</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.blanco,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.blanco,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.azulOscuro,
  },
  placeholderHeader: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 15,
    color: colors.azulOscuro,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: '#f8f9fa',
    color: colors.azulOscuro,
  },
  labelPermisos: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 25,
    color: colors.azulOscuro,
  },
  checkboxContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  permisoCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 12,
    marginBottom: 4,
  },
  permisoCheckboxActivo: {
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  permisoCheckboxInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  permisoCheckboxText: {
    fontSize: 14,
    color: colors.grisOscuro,
    fontWeight: '500',
  },
  textActivo: {
    color: colors.azulOscuro,
    fontWeight: '600',
  },
  boton: {
    backgroundColor: colors.azulClaro,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  botonTexto: {
    color: colors.blanco,
    fontWeight: 'bold',
    fontSize: 16,
  },
});