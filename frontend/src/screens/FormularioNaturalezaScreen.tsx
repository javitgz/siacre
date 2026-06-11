// frontend/src/screens/FormularioNaturalezaScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Alert from '../components/Alert';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';
import { actualizarNaturaleza, crearNaturaleza, Naturaleza } from '../utils/api';

type Props = StackScreenProps<RootStackParamList, 'FormularioNaturaleza'>;

export default function FormularioNaturalezaScreen({ navigation, route }: Props) {
  const naturalezaExistente = route.params?.naturalezaExistente as Naturaleza | undefined;
  const esEdicion = !!naturalezaExistente;
  const [nombre, setNombre] = useState(naturalezaExistente?.nombre || 'natural');
  const [descripcion, setDescripcion] = useState(naturalezaExistente?.descripcion || '');
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
    if (!nombre) {
      mostrarAlerta('negativo', 'Seleccione un tipo de naturaleza');
      return;
    }
    setLoading(true);
    try {
      if (esEdicion) {
        await actualizarNaturaleza(naturalezaExistente.id, { nombre: nombre as 'natural' | 'juridica', descripcion: descripcion.trim() || undefined });
        mostrarAlerta('positivo', 'Naturaleza actualizada');
      } else {
        await crearNaturaleza({ nombre: nombre as 'natural' | 'juridica', descripcion: descripcion.trim() || undefined });
        mostrarAlerta('positivo', 'Naturaleza creada');
      }
      setTimeout(() => navigation.goBack(), 1500);
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
          <Text style={styles.titulo}>{esEdicion ? 'Editar' : 'Nueva'} naturaleza</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView style={styles.content}>
          <Text style={styles.label}>Tipo *</Text>
          <View style={styles.selectContainer}>
            <TouchableOpacity
              style={[styles.selectOption, nombre === 'natural' && styles.selectOptionActive]}
              onPress={() => setNombre('natural')}
              disabled={loading}
            >
              <Text style={[styles.selectText, nombre === 'natural' && styles.selectTextActive]}>Natural</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.selectOption, nombre === 'juridica' && styles.selectOptionActive]}
              onPress={() => setNombre('juridica')}
              disabled={loading}
            >
              <Text style={[styles.selectText, nombre === 'juridica' && styles.selectTextActive]}>Jurídica</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>Descripción (opcional)</Text>
          <TextInput style={[styles.input, styles.textArea]} value={descripcion} onChangeText={setDescripcion} placeholder="Descripción de la naturaleza" multiline numberOfLines={3} editable={!loading} />
          <TouchableOpacity style={styles.boton} onPress={handleGuardar} disabled={loading}>
            <Text style={styles.botonTexto}>Guardar</Text>
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
  selectContainer: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  selectOption: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#dee2e6', alignItems: 'center' },
  selectOptionActive: { backgroundColor: colors.azulClaro, borderColor: colors.azulClaro },
  selectText: { fontSize: 12, color: colors.grisOscuro },
  selectTextActive: { fontSize: 12, color: colors.blanco, fontWeight: '500' },
  boton: { backgroundColor: colors.azulClaro, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 20, marginBottom: 40 },
  botonTexto: { color: colors.blanco, fontWeight: 'bold', fontSize: 16 },
});