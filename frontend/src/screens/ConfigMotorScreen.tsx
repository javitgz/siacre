import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Alert from '../components/Alert';
import BottomNavigation from '../components/BottomNavigation';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';
import { NucleoVariable } from '../types/nucleo.types';
import { Parametro } from '../types/parametros.types';
import { Score } from '../types/score.types';
import {
    actualizarNucleoVariable,
    actualizarParametro,
    obtenerNucleoVariables,
    obtenerParametros,
    obtenerScore
} from '../utils/api';

type Props = StackScreenProps<RootStackParamList, 'Configuracion'>;

export default function ConfigMotorScreen({ navigation }: Props) {
  const [score, setScore] = useState<Score | null>(null);
  const [nucleo, setNucleo] = useState<NucleoVariable[]>([]);
  const [parametros, setParametros] = useState<Parametro[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTipo, setAlertTipo] = useState<'positivo' | 'negativo'>('positivo');
  const [alertMensaje, setAlertMensaje] = useState('');

  // Estados para edición de núcleo (porcentajes)
  const [cargaCuali, setCargaCuali] = useState('0');
  const [cargaCuanti, setCargaCuanti] = useState('0');

  // Estados para edición de puntos de parámetros
  const [parametrosCuali, setParametrosCuali] = useState<Parametro[]>([]);
  const [parametrosCuanti, setParametrosCuanti] = useState<Parametro[]>([]);
  const [puntosEdit, setPuntosEdit] = useState<Record<number, string>>({});

  const mostrarAlerta = (tipo: 'positivo' | 'negativo', mensaje: string) => {
    setAlertTipo(tipo);
    setAlertMensaje(mensaje);
    setAlertVisible(true);
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [scoreData, nucleoData, paramsData] = await Promise.all([
        obtenerScore(),
        obtenerNucleoVariables(),
        obtenerParametros(),
      ]);
      setScore(scoreData);
      setNucleo(nucleoData);
      setParametros(paramsData);

      // Separar parámetros por núcleo
      const cualiId = nucleoData.find(n => n.nombre === 'cualitativa')?.id;
      const cuantiId = nucleoData.find(n => n.nombre === 'cuantitativa')?.id;
      const cuali = paramsData.filter(p => p.nucleo_id === cualiId);
      const cuanti = paramsData.filter(p => p.nucleo_id === cuantiId);
      setParametrosCuali(cuali);
      setParametrosCuanti(cuanti);

      // Inicializar estados de edición
      const puntosMap: Record<number, string> = {};
      [...cuali, ...cuanti].forEach(p => {
        puntosMap[p.id] = p.puntos_maximos.toString();
      });
      setPuntosEdit(puntosMap);

      // Inicializar cargas del núcleo (como porcentajes)
      const cualiVar = nucleoData.find(n => n.nombre === 'cualitativa');
      const cuantiVar = nucleoData.find(n => n.nombre === 'cuantitativa');
      if (cualiVar) setCargaCuali((cualiVar.carga * 100).toString());
      if (cuantiVar) setCargaCuanti((cuantiVar.carga * 100).toString());
    } catch (error: any) {
      mostrarAlerta('negativo', error.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { cargarDatos(); }, []));

  // Validar que la suma de puntos de parámetros no supere el puntaje asignado al núcleo
  const validarPuntos = (tipo: 'cualitativa' | 'cuantitativa') => {
    const nucleoVar = nucleo.find(n => n.nombre === tipo);
    if (!nucleoVar) return true;
    const puntosAsignados = (tipo === 'cualitativa' ? parametrosCuali : parametrosCuanti).reduce((sum, p) => {
      const val = parseFloat(puntosEdit[p.id] || '0');
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
    const maximoPermitido = (nucleoVar.carga * (score?.puntaje_maximo || 1000));
    return puntosAsignados <= maximoPermitido;
  };

  const handleGuardar = async () => {
    // Validar cargas del núcleo
    const cargaCualiNum = parseFloat(cargaCuali);
    const cargaCuantiNum = parseFloat(cargaCuanti);
    if (isNaN(cargaCualiNum) || isNaN(cargaCuantiNum) || cargaCualiNum < 0 || cargaCuantiNum < 0 || (cargaCualiNum + cargaCuantiNum) > 100) {
      mostrarAlerta('negativo', 'Las cargas del núcleo deben ser números entre 0 y 100, y sumar máximo 100%');
      return;
    }

    // Validar puntos de parámetros
    if (!validarPuntos('cualitativa')) {
      mostrarAlerta('negativo', 'La suma de puntos de los parámetros cualitativos supera el puntaje asignado al núcleo cualitativo');
      return;
    }
    if (!validarPuntos('cuantitativa')) {
      mostrarAlerta('negativo', 'La suma de puntos de los parámetros cuantitativos supera el puntaje asignado al núcleo cuantitativo');
      return;
    }

    setSaving(true);
    try {
      // Actualizar núcleo
      const cualiVar = nucleo.find(n => n.nombre === 'cualitativa');
      const cuantiVar = nucleo.find(n => n.nombre === 'cuantitativa');
      if (cualiVar) {
        await actualizarNucleoVariable('cualitativa', { carga: cargaCualiNum / 100 });
      }
      if (cuantiVar) {
        await actualizarNucleoVariable('cuantitativa', { carga: cargaCuantiNum / 100 });
      }

      // Actualizar puntos de parámetros
      const allParams = [...parametrosCuali, ...parametrosCuanti];
      for (const p of allParams) {
        const nuevosPuntos = parseFloat(puntosEdit[p.id] || '0');
        if (!isNaN(nuevosPuntos) && nuevosPuntos !== p.puntos_maximos) {
          await actualizarParametro(p.id, { puntos_maximos: nuevosPuntos });
        }
      }

      // Recargar datos actualizados
      await cargarDatos();
      mostrarAlerta('positivo', 'Configuración guardada correctamente');
    } catch (error: any) {
      mostrarAlerta('negativo', error.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const renderParametroItem = (param: Parametro) => (
    <View key={param.id} style={styles.paramRow}>
      <Text style={styles.paramNombre}>{param.nombre}</Text>
      <TextInput
        style={styles.puntosInput}
        value={puntosEdit[param.id] || ''}
        onChangeText={(text) => setPuntosEdit(prev => ({ ...prev, [param.id]: text }))}
        keyboardType="numeric"
        placeholder="0"
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.azulClaro} />
      </View>
    );
  }

  const cualiPoints = parametrosCuali.reduce((sum, p) => sum + (parseFloat(puntosEdit[p.id] || '0') || 0), 0);
  const cuantiPoints = parametrosCuanti.reduce((sum, p) => sum + (parseFloat(puntosEdit[p.id] || '0') || 0), 0);
  const cualiMax = score ? (nucleo.find(n => n.nombre === 'cualitativa')?.carga || 0) * score.puntaje_maximo : 0;
  const cuantiMax = score ? (nucleo.find(n => n.nombre === 'cuantitativa')?.carga || 0) * score.puntaje_maximo : 0;

  return (
    <View style={styles.container}>
      <Alert visible={alertVisible} tipo={alertTipo} mensaje={alertMensaje} onHide={() => setAlertVisible(false)} />
      <View style={styles.header}>
        <Text style={[styles.textoBlanco, styles.titulo]}>Motor Scoring</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MotorConfig')} style={styles.adminButton}>
          <Ionicons name="settings-outline" size={24} color={colors.blanco} />
        </TouchableOpacity>
      </View>
      <View style={styles.fondoBlanco}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Núcleo del scoring */}
          <View style={styles.card}>
            <Text style={styles.cardTitulo}>Núcleo del scoring</Text>
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Cualitativo</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${parseFloat(cargaCuali) || 0}%`, backgroundColor: colors.azulClaro }]} />
              </View>
              <TextInput
                style={styles.percentInput}
                value={cargaCuali}
                onChangeText={setCargaCuali}
                keyboardType="numeric"
                placeholder="%"
              />
            </View>
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Cuantitativo</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${parseFloat(cargaCuanti) || 0}%`, backgroundColor: colors.verdeEsmeralda }]} />
              </View>
              <TextInput
                style={styles.percentInput}
                value={cargaCuanti}
                onChangeText={setCargaCuanti}
                keyboardType="numeric"
                placeholder="%"
              />
            </View>
          </View>

          {/* Parámetros cualitativos */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitulo}>Parámetros cualitativos</Text>
              <Text style={styles.sumPoints}>Total: {cualiPoints} / {cualiMax.toFixed(0)} pts</Text>
            </View>
            {parametrosCuali.length === 0 ? (
              <Text style={styles.emptyText}>No hay parámetros cualitativos</Text>
            ) : (
              parametrosCuali.map(renderParametroItem)
            )}
          </View>

          {/* Parámetros cuantitativos */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitulo}>Parámetros cuantitativos</Text>
              <Text style={styles.sumPoints}>Total: {cuantiPoints} / {cuantiMax.toFixed(0)} pts</Text>
            </View>
            {parametrosCuanti.length === 0 ? (
              <Text style={styles.emptyText}>No hay parámetros cuantitativos</Text>
            ) : (
              parametrosCuanti.map(renderParametroItem)
            )}
          </View>

          <TouchableOpacity style={styles.botonGuardar} onPress={handleGuardar} disabled={saving}>
            {saving ? <ActivityIndicator color={colors.blanco} /> : <Text style={styles.botonTexto}>Guardar configuración</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>
      <BottomNavigation navigation={navigation} currentScreen="Configuracion" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.azulOscuro },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.azulOscuro },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 17 },
  textoBlanco: { color: colors.blanco },
  titulo: { fontSize: 18, fontWeight: 'bold' },
  adminButton: { padding: 8 },
  fondoBlanco: { flex: 1, backgroundColor: colors.blanco, borderTopLeftRadius: 25, borderTopRightRadius: 25, marginTop: -8, paddingTop: 16 },
  card: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 14, marginHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e9ecef' },
  cardTitulo: { fontSize: 16, fontWeight: 'bold', color: colors.azulOscuro, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sumPoints: { fontSize: 12, fontWeight: '500', color: colors.verdeEsmeralda },
  progressContainer: { marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  progressLabel: { width: 90, fontSize: 12, color: colors.grisOscuro },
  progressBarBg: { flex: 1, height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden', marginHorizontal: 8 },
  progressBarFill: { height: '100%', borderRadius: 4 },
  percentInput: { width: 50, borderWidth: 1, borderColor: '#dee2e6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, fontSize: 12, textAlign: 'center' },
  paramRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e9ecef' },
  paramNombre: { fontSize: 14, color: colors.azulOscuro, flex: 1 },
  puntosInput: { width: 80, borderWidth: 1, borderColor: '#dee2e6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, fontSize: 14, textAlign: 'right' },
  emptyText: { fontSize: 12, color: colors.grisOscuro, textAlign: 'center', marginTop: 10 },
  botonGuardar: { backgroundColor: colors.azulClaro, marginHorizontal: 16, marginTop: 8, marginBottom: 30, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  botonTexto: { color: colors.blanco, fontWeight: 'bold', fontSize: 16 },
});