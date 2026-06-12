import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Alert from '../components/Alert';
import BottomNavigation from '../components/BottomNavigation';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';
import { NucleoVariable } from '../types/nucleo.types';
import { Parametro } from '../types/parametros.types';
import { obtenerNucleoVariables, obtenerParametros } from '../utils/api';

type Props = StackScreenProps<RootStackParamList, 'Parametros'>;

export default function ParametrosScreen({ navigation }: Props) {
  const [nucleo, setNucleo] = useState<NucleoVariable[]>([]);
  const [parametros, setParametros] = useState<Parametro[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // Estados para alerta personalizada
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTipo, setAlertTipo] = useState<'positivo' | 'negativo'>('positivo');
  const [alertMensaje, setAlertMensaje] = useState('');

  const mostrarAlerta = (tipo: 'positivo' | 'negativo', mensaje: string) => {
    setAlertTipo(tipo);
    setAlertMensaje(mensaje);
    setAlertVisible(true);
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [nucleoData, paramsData] = await Promise.all([
        obtenerNucleoVariables(),
        obtenerParametros(),
      ]);
      setNucleo(nucleoData);
      setParametros(paramsData);
    } catch (error: any) {
      mostrarAlerta('negativo', error.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { cargarDatos(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarDatos();
    setRefreshing(false);
  };

  // Obtener carga cualitativa y cuantitativa
  const cualitativa = nucleo.find(v => v.nombre === 'cualitativa');
  const cuantitativa = nucleo.find(v => v.nombre === 'cuantitativa');
  const cargaCuali = cualitativa ? cualitativa.carga * 100 : 0;
  const cargaCuanti = cuantitativa ? cuantitativa.carga * 100 : 0;

  // Parámetros cualitativos y cuantitativos (suponiendo que tienen campo `tipo`)
  const paramsCuali = parametros.filter(p => p.tipo === 'cualitativa');
  const paramsCuanti = parametros.filter(p => p.tipo === 'cuantitativa');

  // Calcular porcentaje de cada parámetro respecto a la carga de su núcleo
  // (asumiendo que cada parámetro tiene `puntos_maximos` que ya está en base al score total, pero aquí mostramos porcentaje)
  // Para simplificar, mostraremos el porcentaje como (puntos_maximos / puntaje_maximo_del_nucleo) * 100
  // El puntaje máximo del núcleo se calcula como carga * puntaje_maximo_total (aún no implementado).
  // Por ahora, mostramos solo los nombres y un placeholder.

  return (
    <View style={styles.container}>
      <Alert visible={alertVisible} tipo="negativo" mensaje={alertMensaje} onHide={() => setAlertVisible(false)} />
      <View style={styles.header}>
        <Text style={[styles.textoBlanco, styles.titulo]}>Motor Scoring</Text>
      </View>
      <View style={styles.fondoBlanco}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {loading ? (
            <ActivityIndicator size="large" color={colors.azulClaro} style={{ marginTop: 20 }} />
          ) : (
            <>
              {/* Núcleo del scoring */}
              <View style={styles.card}>
                <Text style={styles.cardTitulo}>Núcleo del scoring</Text>
                <View style={styles.progressContainer}>
                  <Text style={styles.progressLabel}>Cualitativo</Text>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${cargaCuali}%`, backgroundColor: colors.azulClaro }]} />
                  </View>
                  <Text style={styles.progressValue}>{cargaCuali.toFixed(0)}%</Text>
                </View>
                <View style={styles.progressContainer}>
                  <Text style={styles.progressLabel}>Cuantitativo</Text>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${cargaCuanti}%`, backgroundColor: colors.verdeEsmeralda }]} />
                  </View>
                  <Text style={styles.progressValue}>{cargaCuanti.toFixed(0)}%</Text>
                </View>
              </View>

              {/* Variables cualitativas */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitulo}>Variables cualitativas</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('FormularioParametro', { tipo_parametro: 'cualitativo' })}>
                    <Ionicons name="add-circle" size={24} color={colors.azulClaro} />
                  </TouchableOpacity>
                </View>
                {paramsCuali.length === 0 ? (
                  <Text style={styles.emptyText}>No hay parámetros cualitativos</Text>
                ) : (
                  paramsCuali.map(p => (
                    <View key={p.id} style={styles.parametroRow}>
                      <Text style={styles.parametroNombre}>{p.nombre}</Text>
                      <Text style={styles.parametroPorcentaje}>{(p.puntos_maximos || 0)}%</Text>
                      <TouchableOpacity onPress={() => navigation.navigate('FormularioParametro', { tipo_parametro: 'cualitativo', parametro_existente: p })}>
                        <Ionicons name="pencil" size={18} color={colors.grisOscuro} />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>

              {/* Variables cuantitativas */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitulo}>Variables cuantitativas</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('FormularioParametro', { tipo_parametro: 'cuantitativo' })}>
                    <Ionicons name="add-circle" size={24} color={colors.azulClaro} />
                  </TouchableOpacity>
                </View>
                {paramsCuanti.length === 0 ? (
                  <Text style={styles.emptyText}>No hay parámetros cuantitativos</Text>
                ) : (
                  paramsCuanti.map(p => (
                    <View key={p.id} style={styles.parametroRow}>
                      <Text style={styles.parametroNombre}>{p.nombre}</Text>
                      <Text style={styles.parametroPorcentaje}>{(p.puntos_maximos || 0)}%</Text>
                      <TouchableOpacity onPress={() => navigation.navigate('FormularioParametro', { tipo_parametro: 'cuantitativo', parametro_existente: p })}>
                        <Ionicons name="pencil" size={18} color={colors.grisOscuro} />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>

              <TouchableOpacity style={styles.botonGuardar} onPress={() => mostrarAlerta('positivo', 'Configuración guardada (simulación)')}>
                <Text style={styles.botonTexto}>Guardar configuración</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
      <BottomNavigation navigation={navigation} currentScreen="Parametros" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.azulOscuro },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 17 },
  textoBlanco: { color: colors.blanco },
  titulo: { fontSize: 18, fontWeight: 'bold' },
  fondoBlanco: { flex: 1, backgroundColor: colors.blanco, borderTopLeftRadius: 25, borderTopRightRadius: 25, marginTop: -8, paddingTop: 16 },
  card: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 14, marginHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e9ecef' },
  cardTitulo: { fontSize: 16, fontWeight: 'bold', color: colors.azulOscuro, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressContainer: { marginBottom: 12 },
  progressLabel: { fontSize: 12, color: colors.grisOscuro, marginBottom: 4 },
  progressBarBg: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressValue: { fontSize: 12, fontWeight: 'bold', color: colors.azulOscuro, marginTop: 4, textAlign: 'right' },
  parametroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e9ecef' },
  parametroNombre: { fontSize: 14, color: colors.azulOscuro, flex: 1 },
  parametroPorcentaje: { fontSize: 14, fontWeight: '500', marginRight: 12, color: colors.verdeEsmeralda },
  emptyText: { fontSize: 12, color: colors.grisOscuro, textAlign: 'center', marginTop: 10 },
  botonGuardar: { backgroundColor: colors.azulClaro, marginHorizontal: 16, marginTop: 8, marginBottom: 30, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  botonTexto: { color: colors.blanco, fontWeight: 'bold', fontSize: 16 },
});