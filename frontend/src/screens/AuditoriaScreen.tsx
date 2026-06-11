// frontend/src/screens/AuditoriaScreen.tsx
// Barra de navegación superior: Usuarios, Roles, Auditoría, Permisos
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
import BottomNavigation from '../components/BottomNavigation';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';

type Props = StackScreenProps<RootStackParamList, 'Auditoria'>;

export default function AuditoriaScreen({ navigation }: Props) {
  const [refreshing, setRefreshing] = useState(false);

  const cargarLogs = async () => {
    // TODO: Implementar HU07
  };

  useFocusEffect(useCallback(() => { cargarLogs(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarLogs();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.textoBlanco, styles.titulo]}>Auditoría</Text>
      </View>
      <View style={styles.fondoBlanco}>
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={50} color={colors.gris} />
            <Text style={styles.emptyStateText}>Módulo de auditoría en desarrollo (HU07)</Text>
          </View>
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
  emptyState: { alignItems: 'center', padding: 40 },
  emptyStateText: { color: colors.grisOscuro, marginTop: 10, textAlign: 'center' },
});