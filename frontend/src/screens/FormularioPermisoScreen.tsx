// frontend/src/screens/FormularioPermisoScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Alert from '../components/Alert';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';
import { actualizarPermiso, crearPermiso, Permiso } from '../utils/api';

type Props = StackScreenProps<RootStackParamList, 'FormularioPermiso'>;

export default function FormularioPermisoScreen({ navigation, route }: Props) {
  const permisoExistente = route.params?.permisoExistente as Permiso | undefined;
  const esEdicion = !!permisoExistente;
  const [nombre, setNombre] = useState(permisoExistente?.nombre || '');
  const [descripcion, setDescripcion] = useState(permisoExistente?.descripcion || '');
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
    if (!nombre.trim()) {
      mostrarAlerta('negativo', 'El nombre del permiso es obligatorio');
      return;
    }
    setLoading(true);
    try {
      if (esEdicion) {
        await actualizarPermiso(permisoExistente.id, { nombre: nombre.trim(), descripcion: descripcion.trim() || undefined });
        mostrarAlerta('positivo', 'Permiso actualizado');
      } else {
        await crearPermiso({ nombre: nombre.trim(), descripcion: descripcion.trim() || undefined });
        mostrarAlerta('positivo', 'Permiso creado');
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
          <Text style={styles.titulo}>{esEdicion ? 'Editar' : 'Nuevo'} permiso</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView style={styles.content}>
          <Text style={styles.label}>Nombre *</Text>
          <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="ej: reportes_avanzados" autoCapitalize="none" editable={!loading} />
          <Text style={styles.label}>Descripción (opcional)</Text>
          <TextInput style={[styles.input, styles.textArea]} value={descripcion} onChangeText={setDescripcion} placeholder="Descripción del permiso" multiline numberOfLines={3} editable={!loading} />
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
  boton: { backgroundColor: colors.azulClaro, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 20, marginBottom: 40 },
  botonTexto: { color: colors.blanco, fontWeight: 'bold', fontSize: 16 },
});