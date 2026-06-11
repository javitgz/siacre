// frontend/src/screens/PermisosScreen.tsx
// Barra de navegación superior: Usuarios, Roles, Auditoría, Permisos
// Sin Naturalezas
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import { Alert as RNAlert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Alert from '../components/Alert';
import BottomNavigation from '../components/BottomNavigation';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';
import { Permiso, eliminarPermiso, obtenerPermisos } from '../utils/api';

type Props = StackScreenProps<RootStackParamList, 'Permisos'>;

export default function PermisosScreen({ navigation }: Props) {
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTipo, setAlertTipo] = useState<'positivo' | 'negativo'>('positivo');
  const [alertMensaje, setAlertMensaje] = useState('');

  const mostrarAlerta = (tipo: 'positivo' | 'negativo', mensaje: string) => {
    setAlertTipo(tipo);
    setAlertMensaje(mensaje);
    setAlertVisible(true);
  };

  const cargarPermisos = async () => {
    try {
      const data = await obtenerPermisos();
      setPermisos(data);
    } catch (error: any) {
      mostrarAlerta('negativo', error.message || 'Error al cargar permisos');
    }
  };

  useFocusEffect(useCallback(() => { cargarPermisos(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarPermisos();
    setRefreshing(false);
  };

  const handleAgregar = () => navigation.navigate('FormularioPermiso');
  const handleEditar = (permiso: Permiso) => navigation.navigate('FormularioPermiso', { permisoExistente: permiso });
  const handleEliminar = (permiso: Permiso) => {
    RNAlert.alert('Eliminar permiso', `¿Eliminar el permiso "${permiso.nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try {
            await eliminarPermiso(permiso.id);
            setPermisos(prev => prev.filter(p => p.id !== permiso.id));
            mostrarAlerta('positivo', 'Permiso eliminado');
          } catch (error: any) {
            mostrarAlerta('negativo', error.message || 'Error al eliminar');
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <Alert visible={alertVisible} tipo={alertTipo} mensaje={alertMensaje} onHide={() => setAlertVisible(false)} />
      <View style={styles.header}>
        <Text style={[styles.textoBlanco, styles.titulo]}>Permisos</Text>
        <TouchableOpacity onPress={handleAgregar} style={styles.addButton}>
          <Ionicons name="add-circle" size={28} color={colors.blanco} />
        </TouchableOpacity>
      </View>
      <View style={styles.fondoBlanco}>
        <View style={styles.botonesAccion}>
          <TouchableOpacity style={[styles.botonAccion, styles.botonSecundario]} onPress={() => navigation.navigate('Usuarios')}>
            <Text style={styles.botonAccionTexto}>Usuarios</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.botonAccion, styles.botonSecundario]} onPress={() => navigation.navigate('Roles')}>
            <Text style={styles.botonAccionTexto}>Roles</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.botonAccion, styles.botonSecundario]} onPress={() => navigation.navigate('Auditoria')}>
            <Text style={styles.botonAccionTexto}>Auditoría</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.botonAccion, styles.botonPrimary]} disabled={true}>
            <Text style={styles.botonAccionTexto}>Permisos</Text>
          </TouchableOpacity>
        </View>
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          {permisos.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="key-outline" size={50} color={colors.gris} />
              <Text style={styles.emptyStateText}>No hay permisos registrados</Text>
              <TouchableOpacity style={styles.emptyStateButton} onPress={handleAgregar}>
                <Text style={styles.emptyStateButtonText}>Crear primer permiso</Text>
              </TouchableOpacity>
            </View>
          ) : (
            permisos.map(p => (
              <View key={p.id} style={styles.itemCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemNombre}>{p.nombre}</Text>
                  {p.descripcion ? <Text style={styles.itemDescripcion}>{p.descripcion}</Text> : null}
                </View>
                <View style={styles.itemAcciones}>
                  <TouchableOpacity style={[styles.botonIcono, styles.botonEditar]} onPress={() => handleEditar(p)}>
                    <Ionicons name="pencil" size={16} color={colors.blanco} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.botonIcono, styles.botonEliminar]} onPress={() => handleEliminar(p)}>
                    <Ionicons name="trash" size={16} color={colors.blanco} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
      <BottomNavigation navigation={navigation} currentScreen="Permisos" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.azulOscuro },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 17 },
  textoBlanco: { color: colors.blanco },
  titulo: { fontSize: 18, fontWeight: 'bold' },
  addButton: { padding: 8 },
  fondoBlanco: { flex: 1, backgroundColor: colors.blanco, borderTopLeftRadius: 25, borderTopRightRadius: 25, marginTop: -8, paddingTop: 16 },
  botonesAccion: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, gap: 8 },
  botonAccion: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  botonPrimary: { backgroundColor: colors.azulClaro },
  botonSecundario: { backgroundColor: colors.grisAzulado },
  botonAccionTexto: { color: colors.blanco, fontSize: 12, fontWeight: '500' },
  itemCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 12, padding: 14, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e9ecef' },
  itemInfo: { flex: 1 },
  itemNombre: { fontSize: 16, fontWeight: 'bold', color: colors.azulOscuro },
  itemDescripcion: { fontSize: 12, color: colors.grisOscuro, marginTop: 4 },
  itemAcciones: { flexDirection: 'row', gap: 8 },
  botonIcono: { width: 32, height: 32, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  botonEditar: { backgroundColor: '#ffc107' },
  botonEliminar: { backgroundColor: '#dc3545' },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyStateText: { color: colors.grisOscuro, marginTop: 10, marginBottom: 20 },
  emptyStateButton: { backgroundColor: colors.azulClaro, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  emptyStateButtonText: { color: colors.blanco, fontWeight: '500' },
});