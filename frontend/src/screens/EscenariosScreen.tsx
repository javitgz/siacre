// frontend/src/screens/EscenariosScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import { RefreshControl, Alert as RNAlert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Alert from '../components/Alert';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';
import { eliminarEscenario, Escenario, obtenerEscenariosPorParametro } from '../utils/api';

type Props = StackScreenProps<RootStackParamList, 'Escenarios'>;

export default function EscenariosScreen({ navigation, route }: Props) {
  const { parametroId, parametroNombre } = route.params as { parametroId: number; parametroNombre: string };
  const [escenarios, setEscenarios] = useState<Escenario[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTipo, setAlertTipo] = useState<'positivo' | 'negativo'>('positivo');
  const [alertMensaje, setAlertMensaje] = useState('');

  const mostrarAlerta = (tipo: 'positivo' | 'negativo', mensaje: string) => {
    setAlertTipo(tipo);
    setAlertMensaje(mensaje);
    setAlertVisible(true);
  };

  const cargarEscenarios = async () => {
    try {
      const data = await obtenerEscenariosPorParametro(parametroId);
      setEscenarios(data);
    } catch (error: any) {
      mostrarAlerta('negativo', error.message || 'Error al cargar escenarios');
    }
  };

  useFocusEffect(useCallback(() => { cargarEscenarios(); }, [parametroId]));

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarEscenarios();
    setRefreshing(false);
  };

  const handleAgregar = () => navigation.navigate('FormularioEscenario', { parametroId, parametroNombre });
  const handleEditar = (escenario: Escenario) => navigation.navigate('FormularioEscenario', { escenarioExistente: escenario, parametroNombre });
  const handleEliminar = (escenario: Escenario) => {
    RNAlert.alert('Eliminar escenario', `¿Eliminar este escenario?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try {
            await eliminarEscenario(escenario.id);
            setEscenarios(prev => prev.filter(e => e.id !== escenario.id));
            mostrarAlerta('positivo', 'Escenario eliminado');
          } catch (error: any) {
            mostrarAlerta('negativo', error.message || 'Error al eliminar');
          }
        }
      }
    ]);
  };

  const renderDescripcion = (esc: Escenario) => {
    if (esc.tipo === 'selector') {
      return `${esc.selector_valor} → ${(esc.porcentaje * 100).toFixed(0)}%`;
    } else {
      return `${esc.rango_min} - ${esc.rango_max} → ${(esc.porcentaje * 100).toFixed(0)}%`;
    }
  };

  return (
    <View style={styles.container}>
      <Alert visible={alertVisible} tipo={alertTipo} mensaje={alertMensaje} onHide={() => setAlertVisible(false)} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.blanco} />
        </TouchableOpacity>
        <Text style={[styles.textoBlanco, styles.titulo]}>Escenarios de {parametroNombre}</Text>
        <TouchableOpacity onPress={handleAgregar} style={styles.addButton}>
          <Ionicons name="add-circle" size={28} color={colors.blanco} />
        </TouchableOpacity>
      </View>
      <View style={styles.fondoBlanco}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {escenarios.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="options-outline" size={50} color={colors.gris} />
              <Text style={styles.emptyStateText}>No hay escenarios para este parámetro</Text>
              <TouchableOpacity style={styles.emptyStateButton} onPress={handleAgregar}>
                <Text style={styles.emptyStateButtonText}>Crear primer escenario</Text>
              </TouchableOpacity>
            </View>
          ) : (
            escenarios.map(esc => (
              <View key={esc.id} style={styles.card}>
                <View style={styles.cardInfo}>
                  <Text style={styles.descripcion}>{renderDescripcion(esc)}</Text>
                </View>
                <View style={styles.cardAcciones}>
                  <TouchableOpacity onPress={() => handleEditar(esc)} style={styles.botonEditar}>
                    <Ionicons name="pencil" size={18} color={colors.blanco} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleEliminar(esc)} style={styles.botonEliminar}>
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
  titulo: { fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  addButton: { padding: 8 },
  fondoBlanco: { flex: 1, backgroundColor: colors.blanco, borderTopLeftRadius: 25, borderTopRightRadius: 25, marginTop: -8, paddingTop: 16 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 12, padding: 14, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e9ecef' },
  cardInfo: { flex: 1 },
  descripcion: { fontSize: 14, color: colors.azulOscuro },
  cardAcciones: { flexDirection: 'row', gap: 8 },
  botonEditar: { backgroundColor: '#ffc107', width: 32, height: 32, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  botonEliminar: { backgroundColor: '#dc3545', width: 32, height: 32, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyStateText: { color: colors.grisOscuro, marginTop: 10, marginBottom: 20 },
  emptyStateButton: { backgroundColor: colors.azulClaro, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  emptyStateButtonText: { color: colors.blanco, fontWeight: '500' },
});