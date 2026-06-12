// frontend/src/screens/FormularioParametroScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Alert from '../components/Alert';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';
import { NucleoVariable } from '../types/nucleo.types';
import { Parametro, ParametroCreate } from '../types/parametros.types';
import {
  actualizarParametro,
  crearParametro,
  Naturaleza,
  obtenerNaturalezas,
  obtenerNucleoVariables,
} from '../utils/api';

type Props = StackScreenProps<RootStackParamList, 'FormularioParametro'>;

export default function FormularioParametroScreen({ navigation, route }: Props) {
  const parametroExistente = route.params?.parametro_existente as Parametro | undefined;
  const esEdicion = !!parametroExistente;

  const [formData, setFormData] = useState({
    codigo: parametroExistente?.codigo || '',
    nombre: parametroExistente?.nombre || '',
    caracteristica_medida: parametroExistente?.caracteristica_medida || '',
    tipo: parametroExistente?.tipo || 'selector',
    puntos_maximos: parametroExistente?.puntos_maximos?.toString() || '',
    interpretacion: parametroExistente?.interpretacion || '',
    nucleo_id: parametroExistente?.nucleo_id || 0,
    naturaleza_id: parametroExistente?.naturaleza_id || 0,
  });

  const [nucleos, setNucleos] = useState<NucleoVariable[]>([]);
  const [naturalezas, setNaturalezas] = useState<Naturaleza[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTipo, setAlertTipo] = useState<'positivo' | 'negativo'>('positivo');
  const [alertMensaje, setAlertMensaje] = useState('');

  useEffect(() => {
    cargarCatalogos();
  }, []);

  const cargarCatalogos = async () => {
    try {
      const [nucleosData, naturalezasData] = await Promise.all([
        obtenerNucleoVariables(),
        obtenerNaturalezas(),
      ]);
      setNucleos(nucleosData);
      setNaturalezas(naturalezasData);
      if (!esEdicion && nucleosData.length > 0 && formData.nucleo_id === 0) {
        setFormData(prev => ({ ...prev, nucleo_id: nucleosData[0].id }));
      }
      if (!esEdicion && naturalezasData.length > 0 && formData.naturaleza_id === 0) {
        setFormData(prev => ({ ...prev, naturaleza_id: naturalezasData[0].id }));
      }
    } catch (error) {
      mostrarAlerta('negativo', 'Error cargando datos iniciales');
    }
  };

  const mostrarAlerta = (tipo: 'positivo' | 'negativo', mensaje: string) => {
    setAlertTipo(tipo);
    setAlertMensaje(mensaje);
    setAlertVisible(true);
  };

  const handleGuardar = async () => {
    if (!formData.codigo.trim() || !formData.nombre.trim() || !formData.puntos_maximos) {
      mostrarAlerta('negativo', 'Código, nombre y puntos máximos son obligatorios');
      return;
    }
    if (formData.nucleo_id === 0 || formData.naturaleza_id === 0) {
      mostrarAlerta('negativo', 'Debe seleccionar núcleo y naturaleza');
      return;
    }
    setLoading(true);
    try {
      const payload: ParametroCreate = {
        codigo: formData.codigo.trim(),
        nombre: formData.nombre.trim(),
        caracteristica_medida: formData.caracteristica_medida.trim() || undefined,
        tipo: formData.tipo as 'selector' | 'rango',
        puntos_maximos: parseFloat(formData.puntos_maximos),
        interpretacion: formData.interpretacion.trim() || undefined,
        nucleo_id: formData.nucleo_id,
        naturaleza_id: formData.naturaleza_id,
      };
      if (esEdicion) {
        await actualizarParametro(parametroExistente.id, payload);
        mostrarAlerta('positivo', 'Parámetro actualizado');
      } else {
        await crearParametro(payload);
        mostrarAlerta('positivo', 'Parámetro creado');
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
          <Text style={styles.titulo}>{esEdicion ? 'Editar' : 'Nuevo'} parámetro</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView style={styles.content}>
          <Text style={styles.label}>Código *</Text>
          <TextInput style={styles.input} value={formData.codigo} onChangeText={t => setFormData({ ...formData, codigo: t })} placeholder="Ej: CAP_PAGO" editable={!loading} />

          <Text style={styles.label}>Nombre *</Text>
          <TextInput style={styles.input} value={formData.nombre} onChangeText={t => setFormData({ ...formData, nombre: t })} placeholder="Ej: Capacidad de pago" editable={!loading} />

          <Text style={styles.label}>Característica medida</Text>
          <TextInput style={styles.input} value={formData.caracteristica_medida} onChangeText={t => setFormData({ ...formData, caracteristica_medida: t })} placeholder="Ej: Porcentaje de ingresos" editable={!loading} />

          <Text style={styles.label}>Tipo *</Text>
          <View style={styles.selectContainer}>
            <TouchableOpacity style={[styles.selectOption, formData.tipo === 'selector' && styles.selectOptionActive]} onPress={() => setFormData({ ...formData, tipo: 'selector' })}>
              <Text style={formData.tipo === 'selector' ? styles.selectTextActive : styles.selectText}>Selector</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.selectOption, formData.tipo === 'rango' && styles.selectOptionActive]} onPress={() => setFormData({ ...formData, tipo: 'rango' })}>
              <Text style={formData.tipo === 'rango' ? styles.selectTextActive : styles.selectText}>Rango</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Puntos máximos *</Text>
          <TextInput style={styles.input} value={formData.puntos_maximos} onChangeText={t => setFormData({ ...formData, puntos_maximos: t })} placeholder="0 - 1000" keyboardType="numeric" editable={!loading} />

          <Text style={styles.label}>Interpretación</Text>
          <TextInput style={[styles.input, styles.textArea]} value={formData.interpretacion} onChangeText={t => setFormData({ ...formData, interpretacion: t })} placeholder="Explicación del parámetro" multiline numberOfLines={3} editable={!loading} />

          <Text style={styles.label}>Núcleo *</Text>
          <View style={styles.selectContainer}>
            {nucleos.map(n => (
              <TouchableOpacity key={n.id} style={[styles.selectOption, formData.nucleo_id === n.id && styles.selectOptionActive]} onPress={() => setFormData({ ...formData, nucleo_id: n.id })}>
                <Text style={formData.nucleo_id === n.id ? styles.selectTextActive : styles.selectText}>{n.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Naturaleza *</Text>
          <View style={styles.selectContainer}>
            {naturalezas.map(n => (
              <TouchableOpacity key={n.id} style={[styles.selectOption, formData.naturaleza_id === n.id && styles.selectOptionActive]} onPress={() => setFormData({ ...formData, naturaleza_id: n.id })}>
                <Text style={formData.naturaleza_id === n.id ? styles.selectTextActive : styles.selectText}>{n.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>

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
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  selectContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10, marginTop: 4 },
  selectOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#dee2e6' },
  selectOptionActive: { backgroundColor: colors.azulClaro, borderColor: colors.azulClaro },
  selectText: { fontSize: 12, color: colors.grisOscuro },
  selectTextActive: { fontSize: 12, color: colors.blanco, fontWeight: '500' },
  boton: { backgroundColor: colors.azulClaro, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 25, marginBottom: 40 },
  botonTexto: { color: colors.blanco, fontWeight: 'bold', fontSize: 16 },
});