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

// Interfaz estricta para el estado del formulario
interface UsuarioFormData {
  nombres: string;
  apellidos: string;
  tipo_documento: string;
  documento: string;
  rol: string;
  correo: string;
  telefono: string;
  direccion: string;
  municipio: string;
  departamento: string;
  activo: boolean;
}

type Props = StackScreenProps<RootStackParamList, 'FormularioUsuario'>;

export default function FormularioUsuarioScreen({ navigation, route }: Props) {
  // Extraemos de forma segura el usuario en caso de que sea flujo de edición
  const usuarioExistente = route.params?.usuarioExistente;
  const esEdicion = !!usuarioExistente;

  const [formData, setFormData] = useState<UsuarioFormData>({
    nombres: usuarioExistente?.nombres || '',
    apellidos: usuarioExistente?.apellidos || '',
    tipo_documento: usuarioExistente?.tipo_documento || 'Cedula de ciudadania',
    documento: usuarioExistente?.documento || '',
    rol: usuarioExistente?.rol || 'Analista',
    correo: usuarioExistente?.correo || '',
    telefono: usuarioExistente?.telefono || '',
    direccion: usuarioExistente?.direccion || '',
    municipio: usuarioExistente?.municipio || '',
    departamento: usuarioExistente?.departamento || '',
    activo: usuarioExistente?.activo !== false,
  });

  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertTipo, setAlertTipo] = useState<'positivo' | 'negativo'>('positivo');
  const [alertMensaje, setAlertMensaje] = useState<string>('');

  const roles: string[] = ['Administrador', 'Analista', 'Consultor'];
  const tiposDocumento: string[] = ['Cedula de ciudadania', 'Cedula de extranjeria', 'Pasaporte'];

  const mostrarAlerta = (tipo: 'positivo' | 'negativo', mensaje: string) => {
    setAlertTipo(tipo);
    setAlertMensaje(mensaje);
    setAlertVisible(true);
  };

  const handleGuardar = async () => {
    // Validaciones quirúrgicas de campos obligatorios
    if (!formData.nombres.trim() || !formData.apellidos.trim() || !formData.documento.trim() || !formData.correo.trim()) {
      mostrarAlerta('negativo', 'Complete los campos obligatorios');
      return;
    }

    const usuarioFinal = {
      id: usuarioExistente?.id || Date.now().toString(),
      ...formData,
      // Si existía una fecha previa se conserva, de lo contrario se genera la actual
      fechaCreacion: (usuarioExistente as any)?.fechaCreacion || new Date().toISOString(),
    };

    try {
      const usuariosGuardados = await AsyncStorage.getItem('@usuarios');
      let lista: any[] = usuariosGuardados ? JSON.parse(usuariosGuardados) : [];
      
      if (esEdicion) {
        lista = lista.map((u) => (u.id === usuarioExistente.id ? usuarioFinal : u));
      } else {
        lista.push(usuarioFinal);
      }
      
      await AsyncStorage.setItem('@usuarios', JSON.stringify(lista));
      
      mostrarAlerta('positivo', `Usuario ${esEdicion ? 'actualizado' : 'creado'} correctamente`);
      
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.error('Error guardando usuario:', error);
      mostrarAlerta('negativo', 'Error al guardar el usuario');
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
        {/* Cabecera del Formulario */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={colors.azulOscuro} />
          </TouchableOpacity>
          <Text style={styles.titulo}>
            {esEdicion ? 'Editar' : 'Crear'} usuario
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Nombres *</Text>
          <TextInput
            style={styles.input}
            value={formData.nombres}
            onChangeText={(text) => setFormData({ ...formData, nombres: text })}
            placeholder="Nombres"
          />

          <Text style={styles.label}>Apellidos *</Text>
          <TextInput
            style={styles.input}
            value={formData.apellidos}
            onChangeText={(text) => setFormData({ ...formData, apellidos: text })}
            placeholder="Apellidos"
          />

          <Text style={styles.label}>Tipo de documento</Text>
          <View style={styles.selectContainer}>
            {tiposDocumento.map((tipo) => (
              <TouchableOpacity
                key={tipo}
                style={[
                  styles.selectOption,
                  formData.tipo_documento === tipo && styles.selectOptionActive,
                ]}
                onPress={() => setFormData({ ...formData, tipo_documento: tipo })}
                activeOpacity={0.9}
              >
                <Text style={formData.tipo_documento === tipo ? styles.selectTextActive : styles.selectText}>
                  {tipo}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Documento *</Text>
          <TextInput
            style={styles.input}
            value={formData.documento}
            onChangeText={(text) => setFormData({ ...formData, documento: text })}
            placeholder="0000000000"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Rol</Text>
          <View style={styles.selectContainer}>
            {roles.map((rol) => (
              <TouchableOpacity
                key={rol}
                style={[
                  styles.selectOption,
                  formData.rol === rol && styles.selectOptionActive,
                ]}
                onPress={() => setFormData({ ...formData, rol: rol })}
                activeOpacity={0.9}
              >
                <Text style={formData.rol === rol ? styles.selectTextActive : styles.selectText}>
                  {rol}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Correo electrónico *</Text>
          <TextInput
            style={styles.input}
            value={formData.correo}
            onChangeText={(text) => setFormData({ ...formData, correo: text })}
            placeholder="nombre@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            value={formData.telefono}
            onChangeText={(text) => setFormData({ ...formData, telefono: text })}
            placeholder="Teléfono"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Dirección</Text>
          <TextInput
            style={styles.input}
            value={formData.direccion}
            onChangeText={(text) => setFormData({ ...formData, direccion: text })}
            placeholder="Dirección"
          />

          <Text style={styles.label}>Municipio</Text>
          <TextInput
            style={styles.input}
            value={formData.municipio}
            onChangeText={(text) => setFormData({ ...formData, municipio: text })}
            placeholder="Municipio"
          />

          <Text style={styles.label}>Departamento</Text>
          <TextInput
            style={styles.input}
            value={formData.departamento}
            onChangeText={(text) => setFormData({ ...formData, departamento: text })}
            placeholder="Departamento"
          />

          <TouchableOpacity style={styles.boton} onPress={handleGuardar} activeOpacity={0.8}>
            <Text style={styles.botonTexto}>Guardar Cambios</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.blanco },
  flex: { flex: 1 },
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
  backButton: { padding: 8 },
  titulo: { fontSize: 18, fontWeight: 'bold', color: colors.azulOscuro },
  content: { flex: 1, padding: 20 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 5, marginTop: 10, color: colors.grisOscuro },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: colors.blanco,
  },
  selectContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10, marginTop: 4 },
  selectOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#dee2e6' },
  selectOptionActive: { backgroundColor: colors.azulClaro, borderColor: colors.azulClaro },
  selectText: { fontSize: 12, color: colors.grisOscuro },
  selectTextActive: { fontSize: 12, color: colors.blanco, fontWeight: '500' },
  boton: { backgroundColor: colors.azulClaro, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 25, marginBottom: 40 },
  botonTexto: { color: colors.blanco, fontWeight: 'bold', fontSize: 16 },
});