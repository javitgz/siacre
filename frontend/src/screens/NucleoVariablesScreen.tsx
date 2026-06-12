import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Alert from '../components/Alert';
import BottomNavigation from '../components/BottomNavigation';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';
import { NucleoVariable } from '../types/nucleo.types';
import { actualizarNucleoVariable, obtenerNucleoVariables } from '../utils/api';

type Props = StackScreenProps<RootStackParamList, 'NucleoVariables'>;

export default function NucleoVariablesScreen({ navigation }: Props) {
  const [variables, setVariables] = useState<NucleoVariable[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTipo, setAlertTipo] = useState<'positivo' | 'negativo'>('positivo');
  const [alertMensaje, setAlertMensaje] = useState('');
  const [editando, setEditando] = useState<string | null>(null);
  const [cargaEdit, setCargaEdit] = useState<string>('');
  const [descEdit, setDescEdit] = useState<string>('');

  const mostrarAlerta = (tipo: 'positivo' | 'negativo', mensaje: string) => {
    setAlertTipo(tipo);
    setAlertMensaje(mensaje);
    setAlertVisible(true);
  };

  const cargarVariables = async () => {
    setLoading(true);
    try {
      const data = await obtenerNucleoVariables();
      setVariables(data);
    } catch (error: any) {
      mostrarAlerta('negativo', error.message || 'Error al cargar núcleo de variables');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { cargarVariables(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarVariables();
    setRefreshing(false);
  };

  const iniciarEdicion = (varItem: NucleoVariable) => {
    setEditando(varItem.nombre);
    setCargaEdit(varItem.carga.toString());
    setDescEdit(varItem.descripcion || '');
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setCargaEdit('');
    setDescEdit('');
  };

  const guardarCambios = async (nombre: string) => {
    const nuevaCarga = parseFloat(cargaEdit);
    if (isNaN(nuevaCarga) || nuevaCarga < 0 || nuevaCarga > 1) {
      mostrarAlerta('negativo', 'La carga debe ser un número entre 0 y 1');
      return;
    }
    try {
      await actualizarNucleoVariable(nombre, {
        carga: nuevaCarga,
        descripcion: descEdit.trim() || null,
      });
      mostrarAlerta('positivo', 'Variable actualizada correctamente');
      await cargarVariables();
      setEditando(null);
    } catch (error: any) {
      mostrarAlerta('negativo', error.message || 'Error al actualizar');
    }
  };

  const renderVariable = (item: NucleoVariable) => {
    const esEditando = editando === item.nombre;
    const nombreCapitalizado = item.nombre === 'cualitativa' ? 'Cualitativa' : 'Cuantitativa';

    return (
      <View key={item.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.nombre}>{nombreCapitalizado}</Text>
          {!esEditando && (
            <TouchableOpacity onPress={() => iniciarEdicion(item)} style={styles.editIcon}>
              <Ionicons name="pencil" size={20} color={colors.azulClaro} />
            </TouchableOpacity>
          )}
        </View>

        {esEditando ? (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>Carga (0-1):</Text>
              <TextInput
                style={styles.input}
                value={cargaEdit}
                onChangeText={setCargaEdit}
                keyboardType="numeric"
                placeholder="Ej: 0.3"
              />
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Descripción:</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={descEdit}
                onChangeText={setDescEdit}
                placeholder="Descripción de la variable"
                multiline
                numberOfLines={3}
              />
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, styles.buttonGuardar]} onPress={() => guardarCambios(item.nombre)}>
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonCancelar]} onPress={cancelarEdicion}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.detalle}>Carga actual: <Text style={styles.carga}>{item.carga}</Text></Text>
            <Text style={styles.detalle}>Descripción: {item.descripcion || 'Sin descripción'}</Text>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Alert visible={alertVisible} tipo={alertTipo} mensaje={alertMensaje} onHide={() => setAlertVisible(false)} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.blanco} />
        </TouchableOpacity>
        <Text style={[styles.textoBlanco, styles.titulo]}>Núcleo de variables</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.fondoBlanco}>
        <View style={styles.botonesAccion}>
          <TouchableOpacity style={[styles.botonAccion, styles.botonSecundario]} onPress={() => navigation.navigate('Usuarios')}>
            <Text style={styles.botonAccionTexto}>Usuarios</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.botonAccion, styles.botonSecundario]} onPress={() => navigation.navigate('Roles')}>
            <Text style={styles.botonAccionTexto}>Roles</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.botonAccion, styles.botonSecundario]} onPress={() => navigation.navigate('Auditoria')}>
            <Text style={styles.botonAccionTexto}>Auditoría</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.botonAccion, styles.botonSecundario]} onPress={() => navigation.navigate('Permisos')}>
            <Text style={styles.botonAccionTexto}>Permisos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.botonAccion, styles.botonPrimary]} disabled={true}>
            <Text style={styles.botonAccionTexto}>Núcleo</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {loading ? (
            <ActivityIndicator size="large" color={colors.azulClaro} style={{ marginTop: 20 }} />
          ) : variables.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="analytics-outline" size={50} color={colors.gris} />
              <Text style={styles.emptyStateText}>No hay variables configuradas</Text>
            </View>
          ) : (
            variables.map(renderVariable)
          )}
        </ScrollView>
      </View>
      <BottomNavigation navigation={navigation} currentScreen="NucleoVariables" />
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
  botonesAccion: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginBottom: 16, gap: 8 },
  botonAccion: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', minWidth: 80 },
  botonPrimary: { backgroundColor: colors.azulClaro },
  botonSecundario: { backgroundColor: colors.grisAzulado },
  botonAccionTexto: { color: colors.blanco, fontSize: 12, fontWeight: '500' },
  card: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 14, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e9ecef' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  nombre: { fontSize: 16, fontWeight: 'bold', color: colors.azulOscuro, textTransform: 'capitalize' },
  editIcon: { padding: 4 },
  detalle: { fontSize: 14, color: colors.grisOscuro, marginTop: 4 },
  carga: { fontWeight: 'bold', color: colors.verdeEsmeralda },
  row: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 4, color: colors.azulOscuro },
  input: { borderWidth: 1, borderColor: '#dee2e6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, backgroundColor: colors.blanco },
  textArea: { minHeight: 60, textAlignVertical: 'top' },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  button: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  buttonGuardar: { backgroundColor: colors.verdeEsmeralda },
  buttonCancelar: { backgroundColor: colors.grisAzulado },
  buttonText: { color: colors.blanco, fontWeight: '500' },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyStateText: { color: colors.grisOscuro, marginTop: 10, textAlign: 'center' },
});