import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import Alert from '../components/Alert';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';
import { Parametro } from '../types/parametros.types';

type Props = StackScreenProps<RootStackParamList, 'FormularioParametro'>;

export default function FormularioParametroScreen({ navigation, route }: Props) {
  const { tipo_parametro, parametro_existente } = route.params || {};

  // Mapeo directo en snake_case para sincronía total con la base de datos de SIACRE
  const [formData, setFormData] = useState({
    nombre: { ...parametro_existente }.nombre || '',
    descripcion: { ...parametro_existente }.descripcion || '',
    peso: { ...parametro_existente }.peso?.toString() || '',
    tipo_medicion: { ...parametro_existente }.tipo_medicion || 'meta',
    valor_meta: { ...parametro_existente }.valor_meta?.toString() || '',
    rango_min: { ...parametro_existente }.rango_min?.toString() || '',
    rango_max: { ...parametro_existente }.rango_max?.toString() || '',
  });

  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertTipo, setAlertTipo] = useState<'positivo' | 'negativo'>('positivo');
  const [alertMensaje, setAlertMensaje] = useState<string>('');

  const mostrarAlerta = (tipo: 'positivo' | 'negativo', mensaje: string) => {
    setAlertTipo(tipo);
    setAlertMensaje(mensaje);
    setAlertVisible(true);
  };

  const esEdicion = !!parametro_existente;
  const esCuantitativo = tipo_parametro === 'cuantitativo';

  const handleGuardar = async () => {
    if (!formData.nombre || !formData.descripcion) {
      mostrarAlerta('negativo', 'Complete los campos obligatorios');
      return;
    }

    // Estructura estricta basada en la interfaz Parametro
    const nuevoParametro: Parametro = {
      id: parametro_existente?.id || Date.now().toString(),
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      peso: esCuantitativo ? (formData.peso ? parseFloat(formData.peso) : undefined) : undefined,
      tipo_medicion: formData.tipo_medicion,
      valor_meta: formData.tipo_medicion === 'meta' ? formData.valor_meta : undefined,
      rango_min: formData.tipo_medicion === 'rango' ? formData.rango_min : undefined,
      rango_max: formData.tipo_medicion === 'rango' ? formData.rango_max : undefined,
    };

    const storageKey = tipo_parametro === 'cualitativo' 
      ? '@parametros_cualitativos' 
      : '@parametros_cuantitativos';

    try {
      const guardados = await AsyncStorage.getItem(storageKey);
      let lista: Parametro[] = guardados ? JSON.parse(guardados) : [];
      
      if (esEdicion) {
        lista = lista.map(p => p.id === parametro_existente.id ? nuevoParametro : p);
      } else {
        lista.push(nuevoParametro);
      }
      
      await AsyncStorage.setItem(storageKey, JSON.stringify(lista));
      
      mostrarAlerta('positivo', `Parámetro ${esEdicion ? 'actualizado' : 'agregado'} correctamente`);
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.error('Error guardando parámetro:', error);
      mostrarAlerta('negativo', 'Error al guardar el parámetro');
    }
  };

  return (
    <View style={styles.container}>
      <Alert
        visible={alertVisible}
        tipo={alertTipo}
        mensaje={alertMensaje}
        onHide={() => setAlertVisible(false)}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={colors.azulOscuro} />
          </TouchableOpacity>
          <Text style={styles.titulo}>
            {esEdicion ? 'Editar' : 'Agregar'} parámetro
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Nombre *</Text>
          <TextInput
            style={styles.input}
            value={formData.nombre}
            onChangeText={(text) => setFormData({ ...formData, nombre: text })}
            placeholder="Ej: Conocimiento del negocio"
          />

          <Text style={styles.label}>Descripción *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.descripcion}
            onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
            placeholder="Descripción del parámetro"
            multiline
            numberOfLines={3}
          />

          {esCuantitativo && (
            <>
              <Text style={styles.label}>Peso (%)</Text>
              <TextInput
                style={styles.input}
                value={formData.peso}
                onChangeText={(text) => setFormData({ ...formData, peso: text })}
                placeholder="0-100"
                keyboardType="numeric"
              />
            </>
          )}

          <Text style={styles.label}>Tipo de medición</Text>
          <View style={styles.selectContainer}>
            <TouchableOpacity
              style={[
                styles.selectOption,
                formData.tipo_medicion === 'meta' && styles.selectOptionActive,
              ]}
              onPress={() => setFormData({ ...formData, tipo_medicion: 'meta' })}
              activeOpacity={0.8}
            >
              <Text style={formData.tipo_medicion === 'meta' ? styles.selectTextActive : styles.selectText}>
                Valor meta
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.selectOption,
                formData.tipo_medicion === 'rango' && styles.selectOptionActive,
              ]}
              onPress={() => setFormData({ ...formData, tipo_medicion: 'rango' })}
              activeOpacity={0.8}
            >
              <Text style={formData.tipo_medicion === 'rango' ? styles.selectTextActive : styles.selectText}>
                Rango
              </Text>
            </TouchableOpacity>
          </View>

          {formData.tipo_medicion === 'meta' && (
            <>
              <Text style={styles.label}>Valor meta</Text>
              <TextInput
                style={styles.input}
                value={formData.valor_meta}
                onChangeText={(text) => setFormData({ ...formData, valor_meta: text })}
                placeholder="Ej: 100"
              />
            </>
          )}

          {formData.tipo_medicion === 'rango' && (
            <>
              <Text style={styles.label}>Valor mínimo</Text>
              <TextInput
                style={styles.input}
                value={formData.rango_min}
                onChangeText={(text) => setFormData({ ...formData, rango_min: text })}
                placeholder="0"
                keyboardType="numeric"
              />
              <Text style={styles.label}>Valor máximo</Text>
              <TextInput
                style={styles.input}
                value={formData.rango_max}
                onChangeText={(text) => setFormData({ ...formData, rango_max: text })}
                placeholder="100"
                keyboardType="numeric"
              />
            </>
          )}

          <TouchableOpacity style={styles.boton} onPress={handleGuardar} activeOpacity={0.8}>
            <Text style={styles.botonTexto}>Guardar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.blanco,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.blanco,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.azulOscuro,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    marginTop: 10,
    color: colors.grisOscuro,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: colors.blanco,
    color: colors.azulOscuro,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  selectContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  selectOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    alignItems: 'center',
  },
  selectOptionActive: {
    backgroundColor: colors.azulClaro,
    borderColor: colors.azulClaro,
  },
  selectText: {
    fontSize: 12,
    color: colors.grisOscuro,
  },
  selectTextActive: {
    fontSize: 12,
    color: colors.blanco,
  },
  boton: {
    backgroundColor: colors.azulClaro,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  botonTexto: {
    color: colors.blanco,
    fontWeight: 'bold',
    fontSize: 16,
  },
});