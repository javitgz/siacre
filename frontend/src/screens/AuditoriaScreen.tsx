// src/screens/AuditoriaScreen.tsx
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
  View,
} from 'react-native';

import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';
import { LogAuditoria, obtenerLogsAuditoria } from '../utils/api';

type Props = StackScreenProps<RootStackParamList, 'Auditoria'>;
type IconoIonicons = React.ComponentProps<typeof Ionicons>['name'];

export default function AuditoriaScreen({ navigation }: Props) {
  const [logs, setLogs] = useState<LogAuditoria[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filtro, setFiltro] = useState<string>('todos');

  const cargarLogs = async () => {
    try {
      const logsServer = await obtenerLogsAuditoria();
      setLogs(logsServer);
    } catch (error) {
      console.error('Error cargando logs de auditoría real:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarLogs();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarLogs();
    setRefreshing(false);
  };

  const getIconoAccion = (accion: string): IconoIonicons => {
    if (!accion) return 'document-text-outline';
    if (accion.includes('Inicio')) return 'log-in-outline';
    if (accion.includes('Creación')) return 'add-circle-outline';
    if (accion.includes('Modificación')) return 'create-outline';
    if (accion.includes('Eliminación')) return 'trash-outline';
    return 'document-text-outline';
  };

  const getColorAccion = (accion: string): string => {
    if (!accion) return colors.grisOscuro;
    if (accion.includes('Inicio')) return colors.verdeEsmeralda;
    if (accion.includes('Creación')) return colors.azulClaro;
    if (accion.includes('Modificación')) return '#ffc107';
    if (accion.includes('Eliminación')) return '#dc3545';
    return colors.grisOscuro;
  };

  const logsFiltrados = logs.filter((log) => {
    if (filtro === 'todos') return true;
    return log.modulo && log.modulo.toLowerCase() === filtro.toLowerCase();
  });

  const modulos: string[] = ['todos', 'Login', 'Clientes', 'Parámetros', 'Scoring', 'Usuarios', 'Roles'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={colors.blanco} />
        </TouchableOpacity>
        <Text style={[styles.textoBlanco, styles.titulo]}>Auditoría</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.fondoBlanco}>
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtrosContainer}>
            {modulos.map((mod) => (
              <TouchableOpacity
                key={mod}
                style={[styles.filtroButton, filtro === mod && styles.filtroButtonActive]}
                onPress={() => setFiltro(mod)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filtroTexto, filtro === mod && styles.filtroTextoActive]}>
                  {mod.charAt(0).toUpperCase() + mod.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {logsFiltrados.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={50} color={colors.gris} />
              <Text style={styles.emptyStateText}>No hay registros de auditoría</Text>
            </View>
          ) : (
            logsFiltrados.map((log) => (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logHeader}>
                  <View style={[styles.logIcono, { backgroundColor: getColorAccion(log.accion || '') + '20' }]}>
                    <Ionicons name={getIconoAccion(log.accion || '')} size={20} color={getColorAccion(log.accion || '')} />
                  </View>
                  <View style={styles.logInfo}>
                    <Text style={styles.logUsuario}>{log.usuario}</Text>
                    <Text style={styles.logFecha}>
                      {log.fecha ? new Date(log.fecha).toLocaleString('es-CO') : ''}
                    </Text>
                  </View>
                  <View style={[styles.logModulo, { backgroundColor: colors.grisAzulado + '20' }]}>
                    <Text style={styles.logModuloTexto}>{log.modulo}</Text>
                  </View>
                </View>
                <Text style={styles.logAccion}>{log.accion}</Text>
                <Text style={styles.logDetalles}>{log.detalles}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.azulOscuro },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 17 },
  backButton: { padding: 8 },
  textoBlanco: { color: colors.blanco },
  titulo: { fontSize: 18, fontWeight: 'bold' },
  fondoBlanco: { flex: 1, backgroundColor: colors.blanco, borderTopLeftRadius: 25, borderTopRightRadius: 25, marginTop: -8, paddingTop: 16 },
  filtrosContainer: { paddingHorizontal: 16, marginBottom: 16, flexDirection: 'row' },
  filtroButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f5f5f5', marginRight: 8, height: 35 },
  filtroButtonActive: { backgroundColor: colors.azulClaro },
  filtroTexto: { fontSize: 12, color: colors.grisOscuro },
  filtroTextoActive: { color: colors.blanco },
  logCard: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 12, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e9ecef' },
  logHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  logIcono: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  logInfo: { flex: 1 },
  logUsuario: { fontSize: 14, fontWeight: '500', color: colors.azulOscuro },
  logFecha: { fontSize: 10, color: colors.grisOscuro, marginTop: 2 },
  logModulo: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  logModuloTexto: { fontSize: 10, color: colors.azulOscuro, fontWeight: '500' },
  logAccion: { fontSize: 14, fontWeight: 'bold', color: colors.azulOscuro, marginBottom: 4 },
  logDetalles: { fontSize: 12, color: colors.grisOscuro },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyStateText: { color: colors.grisOscuro, marginTop: 10 },
});