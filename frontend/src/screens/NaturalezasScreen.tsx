// frontend/src/screens/NaturalezasScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import { RefreshControl, Alert as RNAlert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Alert from '../components/Alert';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';
import { eliminarNaturaleza, Naturaleza, obtenerNaturalezas } from '../utils/api';

type Props = StackScreenProps<RootStackParamList, 'Naturalezas'>;

export default function NaturalezasScreen({ navigation }: Props) {
  const [naturalezas, setNaturalezas] = useState<Naturaleza[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTipo, setAlertTipo] = useState<'positivo' | 'negativo'>('positivo');
  const [alertMensaje, setAlertMensaje] = useState('');

  const mostrarAlerta = (tipo: 'positivo' | 'negativo', mensaje: string) => {
    setAlertTipo(tipo);
    setAlertMensaje(mensaje);
    setAlertVisible(true);
  };

  const cargarNaturalezas = async () => {
    try {
      const data = await obtenerNaturalezas();
      setNaturalezas(data);
    } catch (error: any) {
      mostrarAlerta('negativo', error.message || 'Error al cargar naturalezas');
    }
  };

  useFocusEffect(useCallback(() => { cargarNaturalezas(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarNaturalezas();
    setRefreshing(false);
  };

  const handleAgregar = () => navigation.navigate('FormularioNaturaleza');
  const handleEditar = (item: Naturaleza) => navigation.navigate('FormularioNaturaleza', { naturalezaExistente: item });
  const handleEliminar = (item: Naturaleza) => {
    RNAlert.alert('Eliminar naturaleza', `¿Eliminar la naturaleza "${item.nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try {
            await eliminarNaturaleza(item.id);
            setNaturalezas(prev => prev.filter(p => p.id !== item.id));
            mostrarAlerta('positivo', 'Naturaleza eliminada');
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.blanco} />
        </TouchableOpacity>
        <Text style={[styles.textoBlanco, styles.titulo]}>Naturalezas</Text>
        <TouchableOpacity onPress={handleAgregar} style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.blanco} />
        </TouchableOpacity>
      </View>
      <View style={styles.fondoBlanco}>
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          {naturalezas.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={50} color={colors.gris} />
              <Text style={styles.emptyStateText}>No hay naturalezas registradas</Text>
              <TouchableOpacity style={styles.emptyStateButton} onPress={handleAgregar}>
                <Text style={styles.emptyStateButtonText}>Crear primera naturaleza</Text>
              </TouchableOpacity>
            </View>
          ) : (
            naturalezas.map(item => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemNombre}>{item.nombre}</Text>
                  {item.descripcion ? <Text style={styles.itemDescripcion}>{item.descripcion}</Text> : null}
                </View>
                <View style={styles.itemAcciones}>
                  <TouchableOpacity style={[styles.botonIcono, styles.botonEditar]} onPress={() => handleEditar(item)}>
                    <Ionicons name="pencil" size={16} color={colors.blanco} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.botonIcono, styles.botonEliminar]} onPress={() => handleEliminar(item)}>
                    <Ionicons name="trash" size={16} color={colors.blanco} />
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
  itemCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 12, padding: 14, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e9ecef' },
  itemInfo: { flex: 1 },
  itemNombre: { fontSize: 16, fontWeight: 'bold', color: colors.azulOscuro, textTransform: 'capitalize' },
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