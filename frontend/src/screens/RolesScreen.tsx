// frontend/src/screens/RolesScreen.tsx
// Refactorizado para usar API real. Se mantiene diseño y estilos originales.
// Cambios principales:
// - Importa funciones reales desde api.ts (obtenerRoles, eliminarRol, obtenerPermisos, asignarPermisosARol)
// - Mapea permisos (backend devuelve lista de objetos PermisoRelacion, frontend espera objeto Permisos)
// - Permite editar y eliminar roles
// - Botones de navegación (Usuarios, Auditoría) funcionan

import { Ionicons } from '@expo/vector-icons';
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
import { eliminarRol, obtenerRoles, PermisoRelacion, Rol } from '../utils/api';

type Props = StackScreenProps<RootStackParamList, 'Roles'>;

// Mapeo de nombres de permisos (para mostrar en la UI)
const modulos: { id: string; nombre: string; icono: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { id: 'dashboard', nombre: 'dashboard', icono: 'home-outline' },
  { id: 'clientes', nombre: 'clientes', icono: 'briefcase-outline' },
  { id: 'parametros', nombre: 'parametros', icono: 'options-outline' },
  { id: 'reportes', nombre: 'reportes', icono: 'pie-chart-outline' },
  { id: 'configuracion', nombre: 'configuracion', icono: 'settings-outline' },
  { id: 'usuarios', nombre: 'usuarios', icono: 'people-outline' },
  { id: 'roles', nombre: 'roles', icono: 'key-outline' },
  { id: 'auditoria', nombre: 'auditoria', icono: 'document-text-outline' },
];

export default function RolesScreen({ navigation }: Props) {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTipo, setAlertTipo] = useState<'positivo' | 'negativo'>('positivo');
  const [alertMensaje, setAlertMensaje] = useState('');

  const mostrarAlerta = (tipo: 'positivo' | 'negativo', mensaje: string) => {
    setAlertTipo(tipo);
    setAlertMensaje(mensaje);
    setAlertVisible(true);
  };

  const cargarRoles = async () => {
    try {
      const rolesServer = await obtenerRoles();
      setRoles(rolesServer);
    } catch (error: any) {
      console.error('Error cargando roles:', error);
      mostrarAlerta('negativo', error.message || 'No se pudieron sincronizar los roles.');
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

  const handleAgregar = () => navigation.navigate('FormularioRol');

  const handleEditar = (rol: Rol) => navigation.navigate('FormularioRol', { rolExistente: rol });

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
            try {
              await eliminarRol(rol.id);
              setRoles((prev) => prev.filter((r) => r.id !== rol.id));
              mostrarAlerta('positivo', 'Rol eliminado correctamente');
            } catch (error: any) {
              mostrarAlerta('negativo', error.message || 'Error al eliminar el rol');
            }
          },
        },
      ]
    );
  };

  // Convierte la lista de permisos del backend (array de {id, nombre, estado})
  // a un objeto booleano para la UI (igual que antes)
  const permisosToObject = (permisosList: PermisoRelacion[]): Record<string, boolean> => {
    const obj: Record<string, boolean> = {};
    modulos.forEach(mod => {
      obj[mod.id] = permisosList.some(p => p.nombre.toLowerCase() === mod.id);
    });
    return obj;
  };

  return (
    <View style={styles.container}>
      <Alert visible={alertVisible} tipo={alertTipo} mensaje={alertMensaje} onHide={() => setAlertVisible(false)} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.blanco} />
        </TouchableOpacity>
        <Text style={[styles.textoBlanco, styles.titulo]}>Roles</Text>
        <TouchableOpacity onPress={handleAgregar} style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.blanco} />
        </TouchableOpacity>
      </View>

      <View style={styles.fondoBlanco}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.botonesAccion}>
            <TouchableOpacity style={[styles.botonAccion, styles.botonSecundario]} onPress={() => navigation.navigate('Usuarios')}>
              <Text style={styles.botonAccionTexto}>Usuarios</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.botonAccion, styles.botonPrimary]} disabled={true}>
              <Text style={styles.botonAccionTexto}>Roles</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.botonAccion, styles.botonSecundario]} onPress={() => navigation.navigate('Auditoria')}>
              <Text style={styles.botonAccionTexto}>Auditoría</Text>
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
            roles.map((rol) => {
              const permisosObj = permisosToObject(rol.permisos || []);
              return (
                <View key={rol.id} style={styles.rolCard}>
                  <View style={styles.rolHeader}>
                    <Ionicons name="key-outline" size={24} color={colors.azulClaro} />
                    <Text style={styles.rolNombre}>{rol.nombre}</Text>
                    <View style={styles.rolAcciones}>
                      <TouchableOpacity style={[styles.botonIcono, styles.botonEditar]} onPress={() => handleEditar(rol)}>
                        <Ionicons name="pencil" size={16} color={colors.blanco} />
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.botonIcono, styles.botonEliminar]} onPress={() => handleEliminar(rol)}>
                        <Ionicons name="trash" size={16} color={colors.blanco} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.permisosContainer}>
                    {modulos.map((modulo) => {
                      const tienePermiso = permisosObj[modulo.id] ?? false;
                      return (
                        <View key={modulo.id} style={styles.permisoItem}>
                          <Ionicons name={modulo.icono} size={14} color={tienePermiso ? colors.verdeEsmeralda : colors.gris} />
                          <Text style={[styles.permisoTexto, !tienePermiso && styles.permisoInactivo]}>
                            {modulo.nombre}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </View>
  );
}

// Estilos originales (sin modificar)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.azulOscuro },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 17 },
  backButton: { padding: 8 },
  textoBlanco: { color: colors.blanco },
  titulo: { fontSize: 18, fontWeight: 'bold' },
  addButton: { padding: 8 },
  fondoBlanco: { flex: 1, backgroundColor: colors.blanco, borderTopLeftRadius: 25, borderTopRightRadius: 25, marginTop: -8, paddingTop: 16 },
  botonesAccion: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, gap: 8 },
  botonAccion: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  botonPrimary: { backgroundColor: colors.azulClaro },
  botonSecundario: { backgroundColor: colors.grisAzulado || '#6C7A89' },
  botonAccionTexto: { color: colors.blanco, fontSize: 12, fontWeight: '500' },
  rolCard: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 14, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e9ecef' },
  rolHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  rolNombre: { fontSize: 16, fontWeight: 'bold', color: colors.azulOscuro, marginLeft: 8, flex: 1 },
  rolAcciones: { flexDirection: 'row', gap: 8 },
  botonIcono: { width: 30, height: 30, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  botonEditar: { backgroundColor: '#ffc107' },
  botonEliminar: { backgroundColor: '#dc3545' },
  permisosContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  permisoItem: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, borderWidth: 1, borderColor: '#eee' },
  permisoTexto: { fontSize: 11, fontWeight: '500', color: colors.grisOscuro },
  permisoInactivo: { color: colors.gris, textDecorationLine: 'line-through', opacity: 0.6 },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyStateText: { color: colors.grisOscuro, marginTop: 10, marginBottom: 20 },
  emptyStateButton: { backgroundColor: colors.azulClaro, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  emptyStateButtonText: { color: colors.blanco, fontWeight: '500' },
});