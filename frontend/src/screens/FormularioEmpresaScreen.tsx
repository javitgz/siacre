// frontend/src/screens/FormularioEmpresaScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Alert from '../components/Alert';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';
import { Empresa, TipoDocumento, TIPOS_DOCUMENTO } from '../types/empresa.types';
import { actualizarEmpresa, crearEmpresa, Naturaleza, obtenerNaturalezas } from '../utils/api';

type Props = StackScreenProps<RootStackParamList, 'FormularioEmpresa'>;

export default function FormularioEmpresaScreen({ navigation, route }: Props) {
  const empresaExistente = route.params?.empresaExistente as Empresa | undefined;
  const esEdicion = !!empresaExistente;

  const [naturaleza, setNaturaleza] = useState(empresaExistente?.naturaleza || 'juridica');
  const [nombres, setNombres] = useState(empresaExistente?.nombres || '');
  const [apellidos, setApellidos] = useState(empresaExistente?.apellidos || '');
  const [razonSocial, setRazonSocial] = useState(empresaExistente?.razon_social || '');
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>(empresaExistente?.tipo_documento || 'NIT');
  const [documento, setDocumento] = useState(empresaExistente?.documento || '');
  const [dv, setDv] = useState(empresaExistente?.dv?.toString() || '');
  const [direccion, setDireccion] = useState(empresaExistente?.direccion || '');
  const [municipio, setMunicipio] = useState(empresaExistente?.municipio || '');
  const [departamento, setDepartamento] = useState(empresaExistente?.departamento || '');
  const [email, setEmail] = useState(empresaExistente?.email || '');
  const [telefono, setTelefono] = useState(empresaExistente?.telefono || '');
  const [rutaLogo, setRutaLogo] = useState(empresaExistente?.ruta_logo || '');

  const [naturalezasList, setNaturalezasList] = useState<Naturaleza[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTipo, setAlertTipo] = useState<'positivo' | 'negativo'>('positivo');
  const [alertMensaje, setAlertMensaje] = useState('');

  useEffect(() => {
    cargarNaturalezas();
  }, []);

  const cargarNaturalezas = async () => {
    try {
      const data = await obtenerNaturalezas();
      setNaturalezasList(data);
    } catch (error) {
      console.error('Error cargando naturalezas');
    }
  };

  const mostrarAlerta = (tipo: 'positivo' | 'negativo', mensaje: string) => {
    setAlertTipo(tipo);
    setAlertMensaje(mensaje);
    setAlertVisible(true);
  };

  const handleGuardar = async () => {
    if (!documento.trim() || !direccion.trim() || !municipio.trim() || !departamento.trim() || !email.trim() || !telefono.trim()) {
      mostrarAlerta('negativo', 'Por favor complete los campos obligatorios');
      return;
    }
    if (naturaleza === 'natural' && (!nombres.trim() || !apellidos.trim())) {
      mostrarAlerta('negativo', 'Para persona natural, nombres y apellidos son obligatorios');
      return;
    }
    if (naturaleza === 'juridica' && !razonSocial.trim()) {
      mostrarAlerta('negativo', 'Para persona jurídica, la razón social es obligatoria');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        naturaleza,
        tipo_documento: tipoDocumento,
        documento: documento.trim(),
        dv: dv ? parseInt(dv) : undefined,
        direccion: direccion.trim(),
        municipio: municipio.trim(),
        departamento: departamento.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        ruta_logo: rutaLogo.trim() || undefined,
      };
      if (naturaleza === 'natural') {
        payload.nombres = nombres.trim();
        payload.apellidos = apellidos.trim();
      } else {
        payload.razon_social = razonSocial.trim();
      }
      if (esEdicion) {
        await actualizarEmpresa(empresaExistente.id, payload);
        mostrarAlerta('positivo', 'Empresa actualizada');
      } else {
        await crearEmpresa(payload);
        mostrarAlerta('positivo', 'Empresa creada');
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
          <Text style={styles.titulo}>{esEdicion ? 'Editar' : 'Nueva'} empresa</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView style={styles.content}>
          <Text style={styles.label}>Naturaleza *</Text>
          <View style={styles.selectContainer}>
            {naturalezasList.map(n => (
              <TouchableOpacity key={n.id} style={[styles.selectOption, naturaleza === n.nombre && styles.selectOptionActive]} onPress={() => setNaturaleza(n.nombre as 'natural' | 'juridica')}>
                <Text style={naturaleza === n.nombre ? styles.selectTextActive : styles.selectText}>{n.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {naturaleza === 'natural' ? (
            <>
              <Text style={styles.label}>Nombres *</Text>
              <TextInput style={styles.input} value={nombres} onChangeText={setNombres} placeholder="Nombres" />
              <Text style={styles.label}>Apellidos *</Text>
              <TextInput style={styles.input} value={apellidos} onChangeText={setApellidos} placeholder="Apellidos" />
            </>
          ) : (
            <>
              <Text style={styles.label}>Razón social *</Text>
              <TextInput style={styles.input} value={razonSocial} onChangeText={setRazonSocial} placeholder="Razón social" />
            </>
          )}

          <Text style={styles.label}>Tipo de documento *</Text>
          <View style={styles.selectContainer}>
            {TIPOS_DOCUMENTO.map(t => (
              <TouchableOpacity key={t} style={[styles.selectOption, tipoDocumento === t && styles.selectOptionActive]} onPress={() => setTipoDocumento(t)}>
                <Text style={tipoDocumento === t ? styles.selectTextActive : styles.selectText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Documento *</Text>
          <TextInput style={styles.input} value={documento} onChangeText={setDocumento} placeholder="Número de documento" />

          <Text style={styles.label}>Dígito de verificación (solo NIT)</Text>
          <TextInput style={styles.input} value={dv} onChangeText={setDv} placeholder="Dígito" keyboardType="numeric" />

          <Text style={styles.label}>Dirección *</Text>
          <TextInput style={styles.input} value={direccion} onChangeText={setDireccion} placeholder="Dirección" />

          <Text style={styles.label}>Municipio *</Text>
          <TextInput style={styles.input} value={municipio} onChangeText={setMunicipio} placeholder="Municipio" />

          <Text style={styles.label}>Departamento *</Text>
          <TextInput style={styles.input} value={departamento} onChangeText={setDepartamento} placeholder="Departamento" />

          <Text style={styles.label}>Email *</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="correo@ejemplo.com" keyboardType="email-address" />

          <Text style={styles.label}>Teléfono *</Text>
          <TextInput style={styles.input} value={telefono} onChangeText={setTelefono} placeholder="Teléfono" keyboardType="phone-pad" />

          <Text style={styles.label}>Ruta del logo (opcional)</Text>
          <TextInput style={styles.input} value={rutaLogo} onChangeText={setRutaLogo} placeholder="URL o ruta del logo" />

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
  selectContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10, marginTop: 4 },
  selectOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#dee2e6' },
  selectOptionActive: { backgroundColor: colors.azulClaro, borderColor: colors.azulClaro },
  selectText: { fontSize: 12, color: colors.grisOscuro },
  selectTextActive: { fontSize: 12, color: colors.blanco, fontWeight: '500' },
  boton: { backgroundColor: colors.azulClaro, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 25, marginBottom: 40 },
  botonTexto: { color: colors.blanco, fontWeight: 'bold', fontSize: 16 },
});