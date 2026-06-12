// frontend/src/screens/EmpresasScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import { RefreshControl, Alert as RNAlert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Alert from '../components/Alert';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';
import { eliminarEmpresa, Empresa, obtenerEmpresas } from '../utils/api';

type Props = StackScreenProps<RootStackParamList, 'Empresas'>;

export default function EmpresasScreen({ navigation }: Props) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTipo, setAlertTipo] = useState<'positivo' | 'negativo'>('positivo');
  const [alertMensaje, setAlertMensaje] = useState('');

  const mostrarAlerta = (tipo: 'positivo' | 'negativo', mensaje: string) => {
    setAlertTipo(tipo);
    setAlertMensaje(mensaje);
    setAlertVisible(true);
  };

  const cargarEmpresas = async () => {
    try {
      const data = await obtenerEmpresas();
      setEmpresas(data);
    } catch (error: any) {
      mostrarAlerta('negativo', error.message || 'Error al cargar empresas');
    }
  };

  useFocusEffect(useCallback(() => { cargarEmpresas(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarEmpresas();
    setRefreshing(false);
  };

  const handleAgregar = () => navigation.navigate('FormularioEmpresa');
  const handleEditar = (empresa: Empresa) => navigation.navigate('FormularioEmpresa', { empresaExistente: empresa });
  const handleEliminar = (empresa: Empresa) => {
    RNAlert.alert('Eliminar empresa', `¿Eliminar la empresa ${empresa.razon_social || empresa.nombres}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try {
            await eliminarEmpresa(empresa.id);
            setEmpresas(prev => prev.filter(e => e.id !== empresa.id));
            mostrarAlerta('positivo', 'Empresa eliminada');
          } catch (error: any) {
            mostrarAlerta('negativo', error.message || 'Error al eliminar');
          }
        }
      }
    ]);
  };

  const getNombreMostrar = (empresa: Empresa) => {
    if (empresa.naturaleza === 'natural') {
      return `${empresa.nombres} ${empresa.apellidos}`.trim();
    }
    return empresa.razon_social || '';
  };

  return (
    <View style={styles.container}>
      <Alert visible={alertVisible} tipo={alertTipo} mensaje={alertMensaje} onHide={() => setAlertVisible(false)} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.blanco} />
        </TouchableOpacity>
        <Text style={[styles.textoBlanco, styles.titulo]}>Empresas</Text>
        <TouchableOpacity onPress={handleAgregar} style={styles.addButton}>
          <Ionicons name="add-circle" size={28} color={colors.blanco} />
        </TouchableOpacity>
      </View>
      <View style={styles.fondoBlanco}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {empresas.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="business-outline" size={50} color={colors.gris} />
              <Text style={styles.emptyStateText}>No hay empresas registradas</Text>
              <TouchableOpacity style={styles.emptyStateButton} onPress={handleAgregar}>
                <Text style={styles.emptyStateButtonText}>Crear primera empresa</Text>
              </TouchableOpacity>
            </View>
          ) : (
            empresas.map(emp => (
              <View key={emp.id} style={styles.card}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardNombre}>{getNombreMostrar(emp)}</Text>
                  <Text style={styles.cardDocumento}>{emp.tipo_documento}: {emp.documento}{emp.dv ? `-${emp.dv}` : ''}</Text>
                  <Text style={styles.cardEmail}>{emp.email}</Text>
                </View>
                <View style={styles.cardAcciones}>
                  <TouchableOpacity onPress={() => handleEditar(emp)} style={styles.botonEditar}>
                    <Ionicons name="pencil" size={18} color={colors.blanco} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleEliminar(emp)} style={styles.botonEliminar}>
                    <Ionicons name="trash" size={18} color={colors.blanco} />
                  </TouchableOpacity>
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
  container: { flex: 1, backgroundColor: colors.azulOscuro },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 17 },
  backButton: { padding: 8 },
  textoBlanco: { color: colors.blanco },
  titulo: { fontSize: 18, fontWeight: 'bold' },
  addButton: { padding: 8 },
  fondoBlanco: { flex: 1, backgroundColor: colors.blanco, borderTopLeftRadius: 25, borderTopRightRadius: 25, marginTop: -8, paddingTop: 16 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 12, padding: 14, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e9ecef' },
  cardInfo: { flex: 1 },
  cardNombre: { fontSize: 16, fontWeight: 'bold', color: colors.azulOscuro },
  cardDocumento: { fontSize: 12, color: colors.grisOscuro, marginTop: 2 },
  cardEmail: { fontSize: 12, color: colors.grisOscuro, marginTop: 2 },
  cardAcciones: { flexDirection: 'row', gap: 8 },
  botonEditar: { backgroundColor: '#ffc107', width: 32, height: 32, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  botonEliminar: { backgroundColor: '#dc3545', width: 32, height: 32, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyStateText: { color: colors.grisOscuro, marginTop: 10, marginBottom: 20 },
  emptyStateButton: { backgroundColor: colors.azulClaro, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  emptyStateButtonText: { color: colors.blanco, fontWeight: '500' },
});