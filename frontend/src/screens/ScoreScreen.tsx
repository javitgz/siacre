import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Alert from '../components/Alert';
import BottomNavigation from '../components/BottomNavigation';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';
import { Score } from '../types/score.types';
import { actualizarScore, obtenerScore, recalcularDistribucion } from '../utils/api';

type Props = StackScreenProps<RootStackParamList, 'Score'>;

export default function ScoreScreen({ navigation }: Props) {
  const [score, setScore] = useState<Score | null>(null);
  const [loading, setLoading] = useState(false);
  const [puntajeInput, setPuntajeInput] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTipo, setAlertTipo] = useState<'positivo' | 'negativo'>('positivo');
  const [alertMensaje, setAlertMensaje] = useState('');

  const mostrarAlerta = (tipo: 'positivo' | 'negativo', mensaje: string) => {
    setAlertTipo(tipo);
    setAlertMensaje(mensaje);
    setAlertVisible(true);
  };

  const cargarScore = async () => {
    setLoading(true);
    try {
      const data = await obtenerScore();
      setScore(data);
      setPuntajeInput(data.puntaje_maximo.toString());
    } catch (error: any) {
      mostrarAlerta('negativo', error.message || 'Error al cargar score');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { cargarScore(); }, []));

  const handleGuardarPuntaje = async () => {
    const nuevoPuntaje = parseInt(puntajeInput, 10);
    if (isNaN(nuevoPuntaje) || nuevoPuntaje <= 0) {
      mostrarAlerta('negativo', 'Ingrese un puntaje máximo válido (mayor a 0)');
      return;
    }
    setLoading(true);
    try {
      await actualizarScore(score!.id, { puntaje_maximo: nuevoPuntaje });
      await recalcularDistribucion();
      await cargarScore();
      mostrarAlerta('positivo', 'Score actualizado y distribución recalculada');
    } catch (error: any) {
      mostrarAlerta('negativo', error.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalcular = async () => {
    setLoading(true);
    try {
      await recalcularDistribucion();
      await cargarScore();
      mostrarAlerta('positivo', 'Distribución recalculada según cargas del núcleo');
    } catch (error: any) {
      mostrarAlerta('negativo', error.message || 'Error al recalcular');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !score) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.azulClaro} style={{ marginTop: 50 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Alert visible={alertVisible} tipo={alertTipo} mensaje={alertMensaje} onHide={() => setAlertVisible(false)} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.blanco} />
        </TouchableOpacity>
        <Text style={[styles.textoBlanco, styles.titulo]}>Score Global</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.fondoBlanco}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.label}>Puntaje máximo del sistema</Text>
            <TextInput
              style={styles.input}
              value={puntajeInput}
              onChangeText={setPuntajeInput}
              keyboardType="numeric"
              placeholder="Ej: 1000"
            />
            <TouchableOpacity style={styles.boton} onPress={handleGuardarPuntaje} disabled={loading}>
              <Text style={styles.botonTexto}>Guardar puntaje</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Distribución actual</Text>
            {score?.distribucion && Object.entries(score.distribucion).map(([key, value]) => (
              <View key={key} style={styles.distribucionRow}>
                <Text style={styles.distribucionNombre}>{key}:</Text>
                <Text style={styles.distribucionValor}>{value} puntos</Text>
              </View>
            ))}
            <TouchableOpacity style={[styles.boton, styles.botonSecundario]} onPress={handleRecalcular} disabled={loading}>
              <Text style={styles.botonTexto}>Recalcular distribución</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
      <BottomNavigation navigation={navigation} currentScreen="Score" />
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
  scrollContent: { padding: 16 },
  card: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e9ecef' },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8, color: colors.azulOscuro },
  input: { borderWidth: 1, borderColor: '#dee2e6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, backgroundColor: colors.blanco },
  boton: { backgroundColor: colors.azulClaro, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  botonSecundario: { backgroundColor: colors.grisAzulado },
  botonTexto: { color: colors.blanco, fontWeight: 'bold', fontSize: 14 },
  distribucionRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6, paddingHorizontal: 8 },
  distribucionNombre: { fontSize: 14, color: colors.azulOscuro, textTransform: 'capitalize' },
  distribucionValor: { fontSize: 14, fontWeight: 'bold', color: colors.verdeEsmeralda },
});