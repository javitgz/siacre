// frontend/src/screens/AuditoriaScreen.tsx
// Asegúrate de que use obtenerLogsAuditoria desde api.ts
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
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
import { AuditoriaLog } from '../types/auditoria.types';
import { obtenerLogsAuditoria, obtenerUsuarios, Usuario } from '../utils/api';

type Props = StackScreenProps<RootStackParamList, 'Auditoria'>;

export default function AuditoriaScreen({ navigation }: Props) {
  const [logs, setLogs] = useState<AuditoriaLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMensaje, setAlertMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  // Filtros
  const [usuarioId, setUsuarioId] = useState<string>('');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [accion, setAccion] = useState('');
  const [entidad, setEntidad] = useState('');
  const [fechaDesde, setFechaDesde] = useState<Date | null>(null);
  const [fechaHasta, setFechaHasta] = useState<Date | null>(null);
  const [showDateDesde, setShowDateDesde] = useState(false);
  const [showDateHasta, setShowDateHasta] = useState(false);

  const acciones = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN'];
  const entidades = ['usuario', 'rol', 'permiso', 'naturaleza', 'empresa', 'auth'];

  const cargarLogs = async () => {
    setLoading(true);
    try {
      const filtros: any = {};
      if (usuarioId) filtros.usuario_id = parseInt(usuarioId);
      if (accion) filtros.accion = accion;
      if (entidad) filtros.entidad = entidad;
      if (fechaDesde) filtros.fecha_desde = fechaDesde.toISOString();
      if (fechaHasta) filtros.fecha_hasta = fechaHasta.toISOString();
      const data = await obtenerLogsAuditoria(filtros);
      setLogs(data);
    } catch (error: any) {
      setAlertMensaje(error.message || 'Error al cargar logs');
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const cargarUsuarios = async () => {
    try {
      const users = await obtenerUsuarios();
      setUsuarios(users);
    } catch (error) {
      console.error('Error cargando usuarios para filtro');
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarUsuarios();
      cargarLogs();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarLogs();
    setRefreshing(false);
  };

  const aplicarFiltros = () => {
    cargarLogs();
  };

  const limpiarFiltros = () => {
    setUsuarioId('');
    setAccion('');
    setEntidad('');
    setFechaDesde(null);
    setFechaHasta(null);
    setTimeout(() => cargarLogs(), 100);
  };

  const renderLog = (log: AuditoriaLog) => {
    const fecha = new Date(log.creado).toLocaleString('es-CO');
    let colorAccion = colors.azulClaro;
    if (log.accion === 'CREATE') colorAccion = colors.verdeEsmeralda;
    if (log.accion === 'UPDATE') colorAccion = '#ffc107';
    if (log.accion === 'DELETE') colorAccion = '#dc3545';
    if (log.accion === 'LOGIN') colorAccion = colors.azulOscuro;

    return (
      <View key={log.id} style={styles.logCard}>
        <View style={styles.logHeader}>
          <View style={[styles.logBadge, { backgroundColor: colorAccion + '20' }]}>
            <Text style={[styles.logAccionTexto, { color: colorAccion }]}>{log.accion}</Text>
          </View>
          <Text style={styles.logEntidad}>{log.entidad}</Text>
          <Text style={styles.logFecha}>{fecha}</Text>
        </View>
        <Text style={styles.logDetalle}>{log.detalle || 'Sin detalles'}</Text>
        <Text style={styles.logUsuario}>Usuario ID: {log.usuario_id} | Empresa ID: {log.empresa_id}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Alert visible={alertVisible} tipo="negativo" mensaje={alertMensaje} onHide={() => setAlertVisible(false)} />
      <View style={styles.header}>
        <Text style={[styles.textoBlanco, styles.titulo]}>Auditoría</Text>
      </View>
      <View style={styles.fondoBlanco}>
        {/* Barra de navegación superior */}
        <View style={styles.botonesAccion}>
          <TouchableOpacity style={[styles.botonAccion, styles.botonSecundario]} onPress={() => navigation.navigate('Usuarios')}>
            <Text style={styles.botonAccionTexto}>Usuarios</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.botonAccion, styles.botonSecundario]} onPress={() => navigation.navigate('Roles')}>
            <Text style={styles.botonAccionTexto}>Roles</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.botonAccion, styles.botonPrimary]} disabled={true}>
            <Text style={styles.botonAccionTexto}>Auditoría</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.botonAccion, styles.botonSecundario]} onPress={() => navigation.navigate('Permisos')}>
            <Text style={styles.botonAccionTexto}>Permisos</Text>
          </TouchableOpacity>
        </View>

        {/* Filtros */}
        <View style={styles.filtrosContainer}>
          <Text style={styles.filtrosTitulo}>Filtros</Text>
          <View style={styles.filtroRow}>
            <Text style={styles.filtroLabel}>Usuario:</Text>
            <View style={styles.pickerContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[styles.filtroChip, !usuarioId && styles.filtroChipActive]}
                  onPress={() => setUsuarioId('')}
                >
                  <Text style={styles.filtroChipText}>Todos</Text>
                </TouchableOpacity>
                {usuarios.map(u => (
                  <TouchableOpacity
                    key={u.id}
                    style={[styles.filtroChip, usuarioId === u.id.toString() && styles.filtroChipActive]}
                    onPress={() => setUsuarioId(u.id.toString())}
                  >
                    <Text style={styles.filtroChipText}>{u.nombres} {u.apellidos}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          <View style={styles.filtroRow}>
            <Text style={styles.filtroLabel}>Acción:</Text>
            <View style={styles.pickerContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity style={[styles.filtroChip, !accion && styles.filtroChipActive]} onPress={() => setAccion('')}>
                  <Text style={styles.filtroChipText}>Todas</Text>
                </TouchableOpacity>
                {acciones.map(a => (
                  <TouchableOpacity key={a} style={[styles.filtroChip, accion === a && styles.filtroChipActive]} onPress={() => setAccion(a)}>
                    <Text style={styles.filtroChipText}>{a}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          <View style={styles.filtroRow}>
            <Text style={styles.filtroLabel}>Entidad:</Text>
            <View style={styles.pickerContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity style={[styles.filtroChip, !entidad && styles.filtroChipActive]} onPress={() => setEntidad('')}>
                  <Text style={styles.filtroChipText}>Todas</Text>
                </TouchableOpacity>
                {entidades.map(e => (
                  <TouchableOpacity key={e} style={[styles.filtroChip, entidad === e && styles.filtroChipActive]} onPress={() => setEntidad(e)}>
                    <Text style={styles.filtroChipText}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          <View style={styles.filtroRow}>
            <Text style={styles.filtroLabel}>Fecha desde:</Text>
            <TouchableOpacity onPress={() => setShowDateDesde(true)} style={styles.fechaInput}>
              <Text>{fechaDesde ? fechaDesde.toLocaleDateString('es-CO') : 'Seleccionar'}</Text>
            </TouchableOpacity>
            {showDateDesde && (
              <DateTimePicker
                value={fechaDesde || new Date()}
                mode="date"
                onChange={(event, selected) => {
                  setShowDateDesde(false);
                  if (selected) setFechaDesde(selected);
                }}
              />
            )}
            <Text style={styles.filtroLabel}>Fecha hasta:</Text>
            <TouchableOpacity onPress={() => setShowDateHasta(true)} style={styles.fechaInput}>
              <Text>{fechaHasta ? fechaHasta.toLocaleDateString('es-CO') : 'Seleccionar'}</Text>
            </TouchableOpacity>
            {showDateHasta && (
              <DateTimePicker
                value={fechaHasta || new Date()}
                mode="date"
                onChange={(event, selected) => {
                  setShowDateHasta(false);
                  if (selected) setFechaHasta(selected);
                }}
              />
            )}
          </View>
          <View style={styles.botonesFiltros}>
            <TouchableOpacity style={styles.botonFiltroAplicar} onPress={aplicarFiltros}>
              <Text style={styles.botonFiltroTexto}>Aplicar filtros</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.botonFiltroLimpiar} onPress={limpiarFiltros}>
              <Text style={styles.botonFiltroTexto}>Limpiar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Listado de logs */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {loading ? (
            <ActivityIndicator size="large" color={colors.azulClaro} style={{ marginTop: 20 }} />
          ) : logs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={50} color={colors.gris} />
              <Text style={styles.emptyStateText}>No hay registros de auditoría</Text>
            </View>
          ) : (
            logs.map(renderLog)
          )}
        </ScrollView>
      </View>
      <BottomNavigation navigation={navigation} currentScreen="Auditoria" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.azulOscuro },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 17 },
  textoBlanco: { color: colors.blanco },
  titulo: { fontSize: 18, fontWeight: 'bold' },
  fondoBlanco: { flex: 1, backgroundColor: colors.blanco, borderTopLeftRadius: 25, borderTopRightRadius: 25, marginTop: -8, paddingTop: 16 },
  botonesAccion: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, gap: 8 },
  botonAccion: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  botonPrimary: { backgroundColor: colors.azulClaro },
  botonSecundario: { backgroundColor: colors.grisAzulado },
  botonAccionTexto: { color: colors.blanco, fontSize: 12, fontWeight: '500' },
  filtrosContainer: { backgroundColor: '#f5f5f5', marginHorizontal: 16, marginBottom: 16, padding: 12, borderRadius: 12 },
  filtrosTitulo: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, color: colors.azulOscuro },
  filtroRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' },
  filtroLabel: { width: 90, fontSize: 12, fontWeight: '500', color: colors.grisOscuro },
  pickerContainer: { flex: 1, flexDirection: 'row' },
  filtroChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, backgroundColor: '#e0e0e0', marginRight: 6, marginBottom: 4 },
  filtroChipActive: { backgroundColor: colors.azulClaro },
  filtroChipText: { fontSize: 11, color: '#333' },
  fechaInput: { paddingHorizontal: 8, paddingVertical: 6, backgroundColor: '#e0e0e0', borderRadius: 8, marginRight: 10 },
  botonesFiltros: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, gap: 8 },
  botonFiltroAplicar: { backgroundColor: colors.azulClaro, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  botonFiltroLimpiar: { backgroundColor: colors.grisAzulado, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  botonFiltroTexto: { color: colors.blanco, fontSize: 12, fontWeight: '500' },
  logCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e9ecef', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  logHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' },
  logBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginRight: 8 },
  logAccionTexto: { fontSize: 10, fontWeight: 'bold' },
  logEntidad: { fontSize: 12, fontWeight: '600', color: colors.azulOscuro, marginRight: 8, textTransform: 'capitalize' },
  logFecha: { fontSize: 10, color: colors.grisOscuro, marginLeft: 'auto' },
  logDetalle: { fontSize: 12, color: colors.negro, marginBottom: 4 },
  logUsuario: { fontSize: 10, color: colors.gris },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyStateText: { color: colors.grisOscuro, marginTop: 10, textAlign: 'center' },
});