import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import {
    RefreshControl,
    Alert as RNAlert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import Alert from '../components/Alert';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';

// ─── INTERFACES DE CONTROL DE ACCESO (RBAC) ───────────────────────────

export interface Permisos {
  dashboard: boolean;
  clientes: boolean;
  parametros: boolean;
  reportes: boolean;
  configuracion: boolean;
  usuarios: boolean;
  roles: boolean;
  auditoria: boolean;
}

export interface Rol {
  id: string;
  nombre: string;
  permisos: Permisos;
}

interface Modulo {
  id: keyof Permisos; // Restringe el ID estrictamente a las propiedades de Permisos
  nombre: string;
  icono: React.ComponentProps<typeof Ionicons>['name'];
}

type Props = StackScreenProps<RootStackParamList, 'Roles'>;

export default function RolesScreen({ navigation }: Props) {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertTipo, setAlertTipo] = useState<'positivo' | 'negativo'>('positivo');
  const [alertMensaje, setAlertMensaje] = useState<string>('');

  // Matriz de módulos del sistema vinculada estrictamente al tipo Permisos
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

  const cargarRoles = async () => {
    try {
      const rolesGuardados = await AsyncStorage.getItem('@roles');
      if (rolesGuardados) {
        setRoles(JSON.parse(rolesGuardados) as Rol[]);
      } else {
        // Semilla de datos local con tipado estricto
        const rolesEjemplo: Rol[] = [
          {
            id: '1',
            nombre: 'Administrador',
            permisos: {
              dashboard: true,
              clientes: true,
              parametros: true,
              reportes: true,
              configuracion: true,
              usuarios: true,
              roles: true,
              auditoria: true,
            },
          },
          {
            id: '2',
            nombre: 'Analista',
            permisos: {
              dashboard: true,
              clientes: true,
              parametros: false,
              reportes: true,
              configuracion: false,
              usuarios: false,
              roles: false,
              auditoria: false,
            },
          },
        ];
        setRoles(rolesEjemplo);
        await AsyncStorage.setItem('@roles', JSON.stringify(rolesEjemplo));
      }
    } catch (error) {
      console.error('Error cargando roles:', error);
      mostrarAlerta('negativo', 'No se pudieron cargar los roles.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarRoles();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarRoles();
    setRefreshing(false);
  };

  const handleAgregar = () => {
    navigation.navigate('FormularioRol');
  };

  const handleEditar = (rol: Rol) => {
    navigation.navigate('FormularioRol', { rolExistente: rol });
  };

  const handleEliminar = (rol: Rol) => {
    RNAlert.alert(
      'Eliminar rol',
      `¿Está seguro de eliminar el rol ${rol.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const rolesActualizados = roles.filter(r => r.id !== rol.id);
            setRoles(rolesActualizados);
            await AsyncStorage.setItem('@roles', JSON.stringify(rolesActualizados));
            mostrarAlerta('positivo', 'Rol eliminado correctamente');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Alert
        visible={alertVisible}
        tipo={alertTipo}
        mensaje={alertMensaje}
        onHide={() => setAlertVisible(false)}
      />

      {/* Cabecera */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.blanco} />
        </TouchableOpacity>
        <Text style={[styles.textoBlanco, styles.titulo]}>Roles</Text>
        <TouchableOpacity onPress={handleAgregar} style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.blanco} />
        </TouchableOpacity>
      </View>

      {/* Contenedor Operativo */}
      <View style={styles.fondoBlanco}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Sub-Navegación del Módulo de Gobernanza */}
          <View style={styles.botonesAccion}>
            <TouchableOpacity
              style={[styles.botonAccion, styles.botonSecundario]}
              onPress={() => navigation.navigate('Usuarios')}
            >
              <Text style={styles.botonAccionTexto}>Usuarios</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.botonAccion, styles.botonPrimario]}
              disabled={true} // El botón Primario resalta que estamos parados aquí
            >
              <Text style={styles.botonAccionTexto}>Roles</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.botonAccion, styles.botonSecundario]}
              onPress={() => navigation.navigate('Auditoria')}
            >
              <Text style={styles.botonAccionTexto}>Auditoria</Text>
            </TouchableOpacity>
          </View>

          {roles.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="key-outline" size={50} color={colors.gris} />
              <Text style={styles.emptyStateText}>No hay roles registrados</Text>
              <TouchableOpacity style={styles.emptyStateButton} onPress={handleAgregar}>
                <Text style={styles.emptyStateButtonText}>Crear primer rol</Text>
              </TouchableOpacity>
            </View>
          ) : (
            roles.map((rol) => (
              <View key={rol.id} style={styles.rolCard}>
                <View style={styles.rolHeader}>
                  <Ionicons name="key-outline" size={24} color={colors.azulClaro} />
                  <Text style={styles.rolNombre}>{rol.nombre}</Text>
                  
                  <View style={styles.rolAcciones}>
                    <TouchableOpacity
                      style={[styles.botonIcono, styles.botonEditar]}
                      onPress={() => handleEditar(rol)}
                    >
                      <Ionicons name="pencil" size={16} color={colors.blanco} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.botonIcono, styles.botonEliminar]}
                      onPress={() => handleEliminar(rol)}
                    >
                      <Ionicons name="trash" size={16} color={colors.blanco} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Grid Dinámico de Permisos */}
                <View style={styles.permisosContainer}>
                  {modulos.map((modulo) => {
                    const tienePermiso = rol.permisos[modulo.id];
                    return (
                      <View key={modulo.id} style={styles.permisoItem}>
                        <Ionicons 
                          name={modulo.icono} 
                          size={14} 
                          color={tienePermiso ? colors.verdeEsmeralda : colors.gris} 
                        />
                        <Text style={[styles.permisoTexto, !tienePermiso && styles.permisoInactivo]}>
                          {modulo.nombre}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.azulOscuro,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 17,
  },
  backButton: { padding: 8 },
  textoBlanco: { color: colors.blanco },
  titulo: { fontSize: 18, fontWeight: 'bold' },
  addButton: { padding: 8 },
  fondoBlanco: {
    flex: 1,
    backgroundColor: colors.blanco,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -8,
    paddingTop: 16,
  },
  botonesAccion: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  botonAccion: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  // Inversión semántica de botones para reflejar que "Roles" es la pantalla activa
  botonPrimario: { backgroundColor: colors.azulClaro },
  botonSecundario: { backgroundColor: colors.grisAzulado || '#6C7A89' },
  botonAccionTexto: { color: colors.blanco, fontSize: 12, fontWeight: '500' },
  rolCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  rolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  rolNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.azulOscuro,
    marginLeft: 8,
    flex: 1,
  },
  rolAcciones: {
    flexDirection: 'row',
    gap: 8,
  },
  botonIcono: {
    width: 30,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonEditar: { backgroundColor: '#ffc107' },
  botonEliminar: { backgroundColor: '#dc3545' },
  permisosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  permisoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#eee',
  },
  permisoTexto: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.grisOscuro,
  },
  permisoInactivo: {
    color: colors.gris,
    textDecorationLine: 'line-through', // Opción visual para auditoría rápida de permisos denegados
    opacity: 0.6,
  },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyStateText: { color: colors.grisOscuro, marginTop: 10, marginBottom: 20 },
  emptyStateButton: { backgroundColor: colors.azulClaro, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  emptyStateButtonText: { color: colors.blanco, fontWeight: '500' },
});