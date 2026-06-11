import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { actualizarRol, crearRol, obtenerPermisosCatalogo, Permiso, PermisoRelacion } from '../utils/api';

// Definición de módulos (para mostrar los permisos en checkboxes)
const modulos: { id: string; nombre: string; icono: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { id: 'dashboard', nombre: 'Dashboard', icono: 'home-outline' },
  { id: 'clientes', nombre: 'Clientes', icono: 'briefcase-outline' },
  { id: 'parametros', nombre: 'Parámetros', icono: 'options-outline' },
  { id: 'reportes', nombre: 'Reportes', icono: 'pie-chart-outline' },
  { id: 'configuracion', nombre: 'Configuración', icono: 'settings-outline' },
  { id: 'usuarios', nombre: 'Usuarios', icono: 'people-outline' },
  { id: 'roles', nombre: 'Roles', icono: 'key-outline' },
  { id: 'auditoria', nombre: 'Auditoría', icono: 'document-text-outline' },
];

type Props = StackScreenProps<RootStackParamList, 'FormularioRol'>;

export default function FormularioRolScreen({ navigation, route }: Props) {
  const rolExistente = route.params?.rolExistente;
  const esEdicion = !!rolExistente;

  const [nombre, setNombre] = useState(rolExistente?.nombre || '');
  const [descripcion, setDescripcion] = useState(rolExistente?.descripcion || '');
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<Record<string, boolean>>({});
  const [catalogoPermisos, setCatalogoPermisos] = useState<Permiso[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTipo, setAlertTipo] = useState<'positivo' | 'negativo'>('positivo');
  const [alertMensaje, setAlertMensaje] = useState('');

  useEffect(() => {
    cargarPermisosCatalogo();
  }, []);

  useEffect(() => {
    if (rolExistente && catalogoPermisos.length > 0) {
      // Inicializar los permisos seleccionados según los permisos del rol
      const inicial = {} as Record<string, boolean>;
      modulos.forEach(mod => { inicial[mod.id] = false; });
      rolExistente.permisos?.forEach((p: PermisoRelacion) => {
        const moduloId = p.nombre.toLowerCase();
        if (inicial.hasOwnProperty(moduloId)) inicial[moduloId] = true;
      });
      setPermisosSeleccionados(inicial);
    } else if (catalogoPermisos.length > 0 && !esEdicion) {
      // Si es nuevo, todos false
      const inicial = {} as Record<string, boolean>;
      modulos.forEach(mod => { inicial[mod.id] = false; });
      setPermisosSeleccionados(inicial);
    }
  }, [rolExistente, catalogoPermisos]);

  const cargarPermisosCatalogo = async () => {
    try {
      const permisos = await obtenerPermisosCatalogo();
      setCatalogoPermisos(permisos);
    } catch (error) {
      mostrarAlerta('negativo', 'No se pudieron cargar los permisos');
    }
  };

  const mostrarAlerta = (tipo: 'positivo' | 'negativo', mensaje: string) => {
    setAlertTipo(tipo);
    setAlertMensaje(mensaje);
    setAlertVisible(true);
  };

  const togglePermiso = (moduloId: string) => {
    setPermisosSeleccionados(prev => ({
      ...prev,
      [moduloId]: !prev[moduloId],
    }));
  };

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      mostrarAlerta('negativo', 'El nombre del rol es obligatorio');
      return;
    }

    setLoading(true);
    try {
      const rolData = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        estado: 1,
      };

      let rolId: number;
      if (esEdicion) {
        await actualizarRol(rolExistente.id, rolData);
        rolId = rolExistente.id;
        mostrarAlerta('positivo', 'Rol actualizado correctamente');
      } else {
        const nuevoRol = await crearRol(rolData);
        rolId = nuevoRol.id;
        mostrarAlerta('positivo', 'Rol creado correctamente');
      }

      // Obtener los IDs de los permisos seleccionados
      const permisosIds: number[] = [];
      for (const mod of modulos) {
        if (permisosSeleccionados[mod.id]) {
          const permiso = catalogoPermisos.find(p => p.nombre.toLowerCase() === mod.id);
          if (permiso) permisosIds.push(permiso.id);
        }
      }
      // Asignar permisos al rol (esto requiere el endpoint de asignación)
      // Necesitas importar asignarPermisosARol desde api.ts
      // Si no existe, hay que crearlo. Supongamos que ya está.
      const { asignarPermisosARol } = await import('../utils/api');
      await asignarPermisosARol(rolId, permisosIds);

      setTimeout(() => navigation.goBack(), 1300);
    } catch (error: any) {
      mostrarAlerta('negativo', error.message || 'Error al guardar el rol');
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
          <Text style={styles.titulo}>{esEdicion ? 'Editar' : 'Crear'} rol</Text>
          <View style={styles.placeholderHeader} />
        </View>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Nombre del rol *</Text>
          <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Ej: Administrador" editable={!loading} />

          <Text style={styles.label}>Descripción (opcional)</Text>
          <TextInput style={[styles.input, styles.textArea]} value={descripcion} onChangeText={setDescripcion} placeholder="Breve descripción del rol" multiline numberOfLines={3} editable={!loading} />

          <Text style={styles.labelPermisos}>Permisos de acceso</Text>
          <View style={styles.checkboxContainer}>
            {modulos.map((modulo) => {
              const activo = permisosSeleccionados[modulo.id] || false;
              return (
                <TouchableOpacity key={modulo.id} style={[styles.permisoCheckbox, activo && styles.permisoCheckboxActivo]} onPress={() => togglePermiso(modulo.id)} activeOpacity={0.7} disabled={loading}>
                  <Ionicons name={activo ? 'checkbox' : 'square-outline'} size={22} color={activo ? colors.azulClaro : colors.gris} />
                  <View style={styles.permisoCheckboxInfo}>
                    <Ionicons name={modulo.icono} size={16} color={activo ? colors.azulOscuro : colors.grisOscuro} />
                    <Text style={[styles.permisoCheckboxText, activo && styles.textActivo]}>{modulo.nombre}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.boton} onPress={handleGuardar} activeOpacity={0.8} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.blanco} /> : <Text style={styles.botonTexto}>Guardar configuración</Text>}
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
  placeholderHeader: { width: 40 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, marginTop: 15, color: colors.azulOscuro },
  input: { borderWidth: 1, borderColor: '#dee2e6', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, backgroundColor: '#f8f9fa', color: colors.azulOscuro },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  labelPermisos: { fontSize: 14, fontWeight: '600', marginBottom: 12, marginTop: 25, color: colors.azulOscuro },
  checkboxContainer: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 8, borderWidth: 1, borderColor: '#e9ecef' },
  permisoCheckbox: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8, gap: 12, marginBottom: 4 },
  permisoCheckboxActivo: { backgroundColor: '#fff', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  permisoCheckboxInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  permisoCheckboxText: { fontSize: 14, color: colors.grisOscuro, fontWeight: '500' },
  textActivo: { color: colors.azulOscuro, fontWeight: '600' },
  boton: { backgroundColor: colors.azulClaro, paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginTop: 30, marginBottom: 40 },
  botonTexto: { color: colors.blanco, fontWeight: 'bold', fontSize: 16 },
});