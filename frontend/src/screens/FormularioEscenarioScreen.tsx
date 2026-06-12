// frontend/src/screens/FormularioEscenarioScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Alert from '../components/Alert';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';
import { Escenario, TipoEscenario } from '../types/escenario.types';
import { actualizarEscenario, crearEscenario } from '../utils/api';

type Props = StackScreenProps<RootStackParamList, 'FormularioEscenario'>;

export default function FormularioEscenarioScreen({ navigation, route }: Props) {
  const { parametroId, parametroNombre, escenarioExistente } = route.params as {
    parametroId: number;
    parametroNombre: string;
    escenarioExistente?: Escenario;
  };
  const esEdicion = !!escenarioExistente;

  const [tipo, setTipo] = useState<TipoEscenario>(escenarioExistente?.tipo || 'selector');
  const [selectorValor, setSelectorValor] = useState(escenarioExistente?.selector_valor || '');
  const [rangoMin, setRangoMin] = useState(escenarioExistente?.rango_min?.toString() || '');
  const [rangoMax, setRangoMax] = useState(escenarioExistente?.rango_max?.toString() || '');
  const [porcentaje, setPorcentaje] = useState(escenarioExistente ? (escenarioExistente.porcentaje * 100).toString() : '');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTipo, setAlertTipo] = useState<'positivo' | 'negativo'>('positivo');
  const [alertMensaje, setAlertMensaje] = useState('');

  const mostrarAlerta = (tipo: 'positivo' | 'negativo', mensaje: string) => {
    setAlertTipo(tipo);
    setAlertMensaje(mensaje);
    setAlertVisible(true);
  };

  const handleGuardar = async () => {
    const porcentajeNum = parseFloat(porcentaje);
    if (isNaN(porcentajeNum) || porcentajeNum < 0 || porcentajeNum > 100) {
      mostrarAlerta('negativo', 'El porcentaje debe ser un número entre 0 y 100');
      return;
    }
    const payload: any = {
      parametro_id: parametroId,
      tipo,
      porcentaje: porcentajeNum / 100,
    };
    if (tipo === 'selector') {
      if (!selectorValor.trim()) {
        mostrarAlerta('negativo', 'El valor del selector es obligatorio');
        return;
      }
      payload.selector_valor = selectorValor.trim();
    } else {
      const min = parseFloat(rangoMin);
      const max = parseFloat(rangoMax);
      if (isNaN(min) || isNaN(max)) {
        mostrarAlerta('negativo', 'Los valores mínimo y máximo son obligatorios');
        return;
      }
      if (min > max) {
        mostrarAlerta('negativo', 'El valor mínimo no puede ser mayor que el máximo');
        return;
      }
      payload.rango_min = min;
      payload.rango_max = max;
    }

    setLoading(true);
    try {
      if (esEdicion) {
        await actualizarEscenario(escenarioExistente.id, payload);
        mostrarAlerta('positivo', 'Escenario actualizado');
      } else {
        await crearEscenario(payload);
        mostrarAlerta('positivo', 'Escenario creado');
      }
      setTimeout(() => navigation.goBack(), 1300);
    } catch (error: any) {
      mostrarAlerta('negativo', error.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Alert visible={alertVisible} tipo={alertTipo} mensaje={alertMensaje} onHide={() => setAlertVisible(false)} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.azulOscuro} />
          </TouchableOpacity>
          <Text style={styles.titulo}>{esEdicion ? 'Editar' : 'Nuevo'} escenario</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView style={styles.content}>
          <Text style={styles.label}>Tipo *</Text>
          <View style={styles.selectContainer}>
            <TouchableOpacity style={[styles.selectOption, tipo === 'selector' && styles.selectOptionActive]} onPress={() => setTipo('selector')}>
              <Text style={tipo === 'selector' ? styles.selectTextActive : styles.selectText}>Selector</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.selectOption, tipo === 'rango' && styles.selectOptionActive]} onPress={() => setTipo('rango')}>
              <Text style={tipo === 'rango' ? styles.selectTextActive : styles.selectText}>Rango</Text>
            </TouchableOpacity>
          </View>

          {tipo === 'selector' ? (
            <>
              <Text style={styles.label}>Valor *</Text>
              <TextInput style={styles.input} value={selectorValor} onChangeText={setSelectorValor} placeholder="Ej: Bueno, Regular, Malo" />
            </>
          ) : (
            <>
              <Text style={styles.label}>Valor mínimo *</Text>
              <TextInput style={styles.input} value={rangoMin} onChangeText={setRangoMin} placeholder="Ej: 0" keyboardType="numeric" />
              <Text style={styles.label}>Valor máximo *</Text>
              <TextInput style={styles.input} value={rangoMax} onChangeText={setRangoMax} placeholder="Ej: 100" keyboardType="numeric" />
            </>
          )}

          <Text style={styles.label}>Porcentaje (%) *</Text>
          <TextInput style={styles.input} value={porcentaje} onChangeText={setPorcentaje} placeholder="Ej: 20" keyboardType="numeric" />

          <TouchableOpacity style={styles.boton} onPress={handleGuardar} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.blanco} /> : <Text style={styles.botonTexto}>Guardar</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.blanco },
  flex: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16, backgroundColor: colors.blanco, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  backButton: { padding: 8 },
  titulo: { fontSize: 18, fontWeight: 'bold', color: colors.azulOscuro },
  content: { flex: 1, padding: 20 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 5, marginTop: 10, color: colors.grisOscuro },
  input: { borderWidth: 1, borderColor: '#dee2e6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, backgroundColor: colors.blanco },
  selectContainer: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  selectOption: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#dee2e6', alignItems: 'center' },
  selectOptionActive: { backgroundColor: colors.azulClaro, borderColor: colors.azulClaro },
  selectText: { fontSize: 12, color: colors.grisOscuro },
  selectTextActive: { fontSize: 12, color: colors.blanco, fontWeight: '500' },
  boton: { backgroundColor: colors.azulClaro, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 25, marginBottom: 40 },
  botonTexto: { color: colors.blanco, fontWeight: 'bold', fontSize: 16 },
});