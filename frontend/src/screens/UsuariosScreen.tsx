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
import BottomNavigation from '../components/BottomNavigation';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';

// ─── INTERFAZ CORE DEL MODELO DE USUARIO ────────────────────────────
export interface Usuario {
  id: string;
  nombres: string;
  apellidos: string;
  documento: string;
  rol: string;
  correo: string;
  activo: boolean;
  tipo_documento?: string;
  telefono?: string;
  direccion?: string;
  municipio?: string;
  departamento?: string;
}

type Props = StackScreenProps<RootStackParamList, 'Usuarios'>;

export default function UsuariosScreen({ navigation }: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertTipo, setAlertTipo] = useState<'positivo' | 'negativo'>('positivo');
  const [alertMensaje, setAlertMensaje] = useState<string>('');

  const mostrarAlerta = (tipo: 'positivo' | 'negativo', mensaje: string) => {
    setAlertTipo(tipo);
    setAlertMensaje(mensaje);
    setAlertVisible(true);
  };

  const cargarUsuarios = async () => {
    try {
      const usuariosGuardados = await AsyncStorage.getItem('@usuarios');
      if (usuariosGuardados) {
        setUsuarios(JSON.parse(usuariosGuardados) as Usuario[]);
      } else {
        // Semilla inicial (Seed Data)
        const usuariosEjemplo: Usuario[] = [
          {
            id: '1',
            nombres: 'Javier',
            apellidos: 'Tamayo',
            documento: '123456789',
            rol: 'Administrador',
            correo: 'javier@siacre.com',
            activo: true,
          },
          {
            id: '2',
            nombres: 'Jesid',
            apellidos: 'Rojas',
            documento: '987654321',
            rol: 'Analista',
            correo: 'jesid@siacre.com',
            activo: true,
          },
        ];
        setUsuarios(usuariosEjemplo);
        await AsyncStorage.setItem('@usuarios', JSON.stringify(usuariosEjemplo));
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarUsuarios();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarUsuarios();
    setRefreshing(false);
  };

  // Rutas actualizadas con la nueva semántica corporativa
  const handleAgregar = () => {
    navigation.navigate('FormularioUsuario');
  };

  const handleEditar = (usuario: Usuario) => {
    navigation.navigate('FormularioUsuario', { usuarioExistente: usuario });
  };

  const handleEliminar = (usuario: Usuario) => {
    RNAlert.alert(
      'Eliminar usuario',
      `¿Está seguro de eliminar a ${usuario.nombres} ${usuario.apellidos}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const usuariosActualizados = usuarios.filter((u) => u.id !== usuario.id);
            setUsuarios(usuariosActualizados);
            await AsyncStorage.setItem('@usuarios', JSON.stringify(usuariosActualizados));
            mostrarAlerta('positivo', 'Usuario eliminado correctamente');
          },
        },
      ]
    );
  };

  const handleToggleActivo = async (usuario: Usuario) => {
    const usuariosActualizados = usuarios.map((u) =>
      u.id === usuario.id ? { ...u, activo: !u.activo } : u
    );
    setUsuarios(usuariosActualizados);
    await AsyncStorage.setItem('@usuarios', JSON.stringify(usuariosActualizados));
    mostrarAlerta(
      'positivo',
      `Usuario ${usuario.activo ? 'desactivado' : 'activado'} correctamente`
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

      {/* Cabecera Corporativa */}
      <View style={styles.headerAzul}>
        <View style={styles.bienvenida}>
          <View>
            <Text style={[styles.textoBlanco, styles.nombrePequeño]}>Bienvenido</Text>
            <Text style={[styles.textoBlanco, styles.nombre]}>Javier Tamayo</Text>
          </View>
          <TouchableOpacity onPress={handleAgregar} activeOpacity={0.7}>
            <Ionicons name="add-circle" size={28} color={colors.blanco} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Panel de Contenido */}
      <View style={styles.fondoBlanco}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Accesos directos / Módulos de control */}
          <View style={styles.botonesAccion}>
            <TouchableOpacity
              style={[styles.botonAccion, styles.botonPrimario]}
              onPress={handleAgregar}
              activeOpacity={0.8}
            >
              <Text style={styles.botonAccionTexto}>Crear usuario</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.botonAccion, styles.botonSecundario]}
              onPress={() => navigation.navigate('Roles')}
              activeOpacity={0.8}
            >
              <Text style={styles.botonAccionTexto}>Roles</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.botonAccion, styles.botonSecundario]}
              onPress={() => navigation.navigate('Auditoria')}
              activeOpacity={0.8}
            >
              <Text style={styles.botonAccionTexto}>Auditoría</Text>
            </TouchableOpacity>
          </View>

          {/* Renderizado Condicional del Listado */}
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
                  <Text style={styles.usuarioNombre}>
                    {usuario.nombres} {usuario.apellidos}
                  </Text>
                  <Text style={styles.usuarioRol}>{usuario.rol}</Text>
                  <Text style={styles.usuarioEmail}>{usuario.correo}</Text>
                </View>
                
                {/* Panel Quirúrgico de Acciones */}
                <View style={styles.usuarioAcciones}>
                  <TouchableOpacity
                    style={[styles.botonAccionIcono, styles.botonEditar]}
                    onPress={() => handleEditar(usuario)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="pencil" size={18} color={colors.blanco} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.botonAccionIcono,
                      usuario.activo ? styles.botonDesactivar : styles.botonActivar,
                    ]}
                    onPress={() => handleToggleActivo(usuario)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={usuario.activo ? 'lock-closed' : 'lock-open'}
                      size={18}
                      color={colors.blanco}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.botonAccionIcono, styles.botonEliminar]}
                    onPress={() => handleEliminar(usuario)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash" size={18} color={colors.blanco} />
                  </TouchableOpacity>
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
  headerAzul: { backgroundColor: colors.azulOscuro },
  bienvenida: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 17 },
  textoBlanco: { color: colors.blanco },
  nombrePequeño: { fontSize: 12 },
  nombre: { fontSize: 14, fontWeight: 'bold' },
  fondoBlanco: { flex: 1, backgroundColor: colors.blanco, borderTopLeftRadius: 25, borderTopRightRadius: 25, marginTop: -8, paddingTop: 16 },
  botonesAccion: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, gap: 8 },
  botonAccion: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  botonPrimario: { backgroundColor: colors.azulClaro },
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
  botonDesactivar: { backgroundColor: '#dc3545' },
  botonActivar: { backgroundColor: colors.verdeEsmeralda },
  botonEliminar: { backgroundColor: colors.grisOscuro },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyStateText: { color: colors.grisOscuro, marginTop: 10, marginBottom: 20 },
  emptyStateButton: { backgroundColor: colors.azulClaro, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  emptyStateButtonText: { color: colors.blanco, fontWeight: '500' },
});