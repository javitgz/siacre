// frontend/src/screens/UsuariosScreen.tsx
// Barra de navegación superior: Usuarios, Roles, Auditoría, Permisos
// Botón "+" para crear usuario en header
// BottomNavigation presente
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Alert from '../components/Alert';
import BottomNavigation from '../components/BottomNavigation';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';
import { cambiarEstadoUsuario, obtenerUsuarios, Usuario } from '../utils/api';
import { getUserSession } from '../utils/storage';

type Props = StackScreenProps<RootStackParamList, 'Usuarios'>;

export default function UsuariosScreen({ navigation }: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTipo, setAlertTipo] = useState<'positivo' | 'negativo'>('positivo');
  const [alertMensaje, setAlertMensaje] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserRol, setCurrentUserRol] = useState<string>('');

  const mostrarAlerta = (tipo: 'positivo' | 'negativo', mensaje: string) => {
    setAlertTipo(tipo);
    setAlertMensaje(mensaje);
    setAlertVisible(true);
  };

  const cargarUsuarios = async () => {
    try {
      const datosServer = await obtenerUsuarios();
      setUsuarios(datosServer);
      const session = await getUserSession();
      if (session?.user?.id) {
        setCurrentUserId(parseInt(session.user.id));
        setCurrentUserRol(session.user.rol_nombre || '');
      }
    } catch (error: any) {
      mostrarAlerta('negativo', error.message || 'Error de conexión');
    }
  };

  useFocusEffect(useCallback(() => { cargarUsuarios(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarUsuarios();
    setRefreshing(false);
  };

  const handleAgregar = () => navigation.navigate('FormularioUsuario');
  const handleEditar = (usuario: Usuario) => navigation.navigate('FormularioUsuario', { usuarioExistente: usuario });

  const handleToggleActivo = async (usuario: Usuario) => {
    const nuevoEstado = usuario.estado === 0;
    try {
      await cambiarEstadoUsuario(usuario.id, nuevoEstado);
      setUsuarios(prev =>
        prev.map(u => (u.id === usuario.id ? { ...u, estado: nuevoEstado ? 1 : 0 } : u))
      );
      mostrarAlerta('positivo', `Usuario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`);
    } catch (error: any) {
      mostrarAlerta('negativo', error.message || 'Error al cambiar estado');
    }
  };

  const puedeCambiarEstado = (usuario: Usuario) => {
    if (usuario.id === currentUserId) return false;
    if (currentUserRol === 'administrador' && usuario.rol_nombre === 'administrador') return false;
    if (['coordinador', 'supervisor'].includes(currentUserRol) && usuario.rol_nombre !== 'analista') return false;
    return true;
  };

  return (
    <View style={styles.container}>
      <Alert visible={alertVisible} tipo={alertTipo} mensaje={alertMensaje} onHide={() => setAlertVisible(false)} />
      <View style={styles.header}>
        <Text style={[styles.textoBlanco, styles.titulo]}>Usuarios</Text>
        <TouchableOpacity onPress={handleAgregar} style={styles.addButton}>
          <Ionicons name="add-circle" size={28} color={colors.blanco} />
        </TouchableOpacity>
      </View>
      <View style={styles.fondoBlanco}>
        <View style={styles.botonesAccion}>
          <TouchableOpacity style={[styles.botonAccion, styles.botonPrimary]} onPress={() => navigation.navigate('Usuarios')}>
            <Text style={styles.botonAccionTexto}>Usuarios</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.botonAccion, styles.botonSecundario]} onPress={() => navigation.navigate('Roles')}>
            <Text style={styles.botonAccionTexto}>Roles</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.botonAccion, styles.botonSecundario]} onPress={() => navigation.navigate('Auditoria')}>
            <Text style={styles.botonAccionTexto}>Auditoría</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.botonAccion, styles.botonSecundario]} onPress={() => navigation.navigate('Permisos')}>
            <Text style={styles.botonAccionTexto}>Permisos</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {usuarios.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={50} color={colors.gris} />
              <Text style={styles.emptyStateText}>No hay usuarios registrados</Text>
              <TouchableOpacity style={styles.emptyStateButton} onPress={handleAgregar}>
                <Text style={styles.emptyStateButtonText}>Crear primer usuario</Text>
              </TouchableOpacity>
            </View>
          ) : (
            usuarios.map((usuario) => (
              <View key={usuario.id} style={styles.usuarioCard}>
                <View style={styles.usuarioAvatar}>
                  <Ionicons name="person-circle" size={50} color={colors.azulClaro} />
                </View>
                <View style={styles.usuarioInfo}>
                  <Text style={styles.usuarioNombre}>{`${usuario.nombres} ${usuario.apellidos || ''}`}</Text>
                  <Text style={styles.usuarioRol}>{usuario.rol_nombre || 'Sin rol'}</Text>
                  <Text style={styles.usuarioEmail}>{usuario.email}</Text>
                </View>
                <View style={styles.usuarioAcciones}>
                  <TouchableOpacity style={[styles.botonAccionIcono, styles.botonEditar]} onPress={() => handleEditar(usuario)}>
                    <Ionicons name="pencil" size={18} color={colors.blanco} />
                  </TouchableOpacity>
                  {puedeCambiarEstado(usuario) && (
                    <TouchableOpacity
                      style={[
                        styles.botonAccionIcono,
                        usuario.estado === 1 ? styles.botonActivar : styles.botonDesactivar,
                      ]}
                      onPress={() => handleToggleActivo(usuario)}
                    >
                      <Ionicons name={usuario.estado === 1 ? 'lock-open' : 'lock-closed'} size={18} color={colors.blanco} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
      <BottomNavigation navigation={navigation} currentScreen="Usuarios" />
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
  usuarioCard: { flexDirection: 'row', backgroundColor: '#f5f5f5', borderRadius: 12, padding: 12, marginHorizontal: 16, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: '#e9ecef' },
  usuarioAvatar: { marginRight: 12 },
  usuarioInfo: { flex: 1 },
  usuarioNombre: { fontSize: 14, fontWeight: 'bold', color: colors.azulOscuro },
  usuarioRol: { fontSize: 12, color: colors.verdeEsmeralda, marginTop: 2, fontWeight: '600' },
  usuarioEmail: { fontSize: 11, color: colors.grisOscuro, marginTop: 2 },
  usuarioAcciones: { flexDirection: 'row', gap: 8 },
  botonAccionIcono: { width: 32, height: 32, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  botonEditar: { backgroundColor: '#ffc107' },
  botonActivar: { backgroundColor: colors.verdeEsmeralda },
  botonDesactivar: { backgroundColor: '#dc3545' },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyStateText: { color: colors.grisOscuro, marginTop: 10, marginBottom: 20 },
  emptyStateButton: { backgroundColor: colors.azulClaro, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  emptyStateButtonText: { color: colors.blanco, fontWeight: '500' },
});