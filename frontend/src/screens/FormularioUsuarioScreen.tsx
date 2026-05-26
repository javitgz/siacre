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
import { actualizarUsuario, crearUsuario, obtenerRoles, Rol } from '../utils/api';

type Props = StackScreenProps<RootStackParamList, 'FormularioUsuario'>;

export default function FormularioUsuarioScreen({ navigation, route }: Props) {
    const usuarioExistente = route.params?.usuarioExistente;
    const esEdicion = !!usuarioExistente;

    const [formData, setFormData] = useState({
        nombre: usuarioExistente?.nombre || '',
        apellidos: usuarioExistente?.apellidos || '',
        tipo_documento: usuarioExistente?.tipo_documento || 'Cédula de ciudadanía',
        documento: usuarioExistente?.documento || '',
        telefono: usuarioExistente?.telefono || '',
        direccion: usuarioExistente?.direccion || '',
        municipio: usuarioExistente?.municipio || '',
        departamento: usuarioExistente?.departamento || '',
        email: usuarioExistente?.email || '',
        password: '',  // siempre presente, en edición puede ir vacío
        activo: usuarioExistente?.activo !== false,
        rol_id: usuarioExistente?.rol_id || 0,
    });

    const [roles, setRoles] = useState<Rol[]>([]);
    const [loading, setLoading] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTipo, setAlertTipo] = useState<'positivo' | 'negativo'>('positivo');
    const [alertMensaje, setAlertMensaje] = useState('');

    useEffect(() => {
        cargarRoles();
    }, []);

    const cargarRoles = async () => {
        try {
            const listaRoles = await obtenerRoles();
            setRoles(listaRoles);
            if (!esEdicion && listaRoles.length > 0 && formData.rol_id === 0) {
                setFormData(prev => ({ ...prev, rol_id: parseInt(listaRoles[0].id) }));
            }
        } catch (error) {
            mostrarAlerta('negativo', 'No se pudieron cargar los roles');
        }
    };

    const mostrarAlerta = (tipo: 'positivo' | 'negativo', mensaje: string) => {
        setAlertTipo(tipo);
        setAlertMensaje(mensaje);
        setAlertVisible(true);
    };

    const handleGuardar = async () => {
        // Validaciones
        if (!formData.nombre.trim() || !formData.email.trim()) {
            mostrarAlerta('negativo', 'Nombre y correo son obligatorios');
            return;
        }
        if (!esEdicion && !formData.password.trim()) {
            mostrarAlerta('negativo', 'La contraseña es obligatoria para nuevos usuarios');
            return;
        }
        if (formData.rol_id === 0) {
            mostrarAlerta('negativo', 'Debe seleccionar un rol');
            return;
        }

        setLoading(true);
        try {
            const usuarioData = {
                nombre: formData.nombre.trim(),
                apellidos: formData.apellidos.trim() || undefined,
                tipo_documento: formData.tipo_documento,
                documento: formData.documento.trim() || undefined,
                telefono: formData.telefono.trim() || undefined,
                direccion: formData.direccion.trim() || undefined,
                municipio: formData.municipio.trim() || undefined,
                departamento: formData.departamento.trim() || undefined,
                email: formData.email.trim(),
                password: formData.password,  // en edición puede ser '' (backend lo ignora)
                activo: formData.activo,
                rol_id: formData.rol_id,
            };

            if (esEdicion) {
                await actualizarUsuario(usuarioExistente.id, usuarioData);
                mostrarAlerta('positivo', 'Usuario actualizado correctamente');
            } else {
                await crearUsuario(usuarioData);
                mostrarAlerta('positivo', 'Usuario creado correctamente');
            }

            setTimeout(() => navigation.goBack(), 1300);
        } catch (error: any) {
            mostrarAlerta('negativo', error.message || 'Error al guardar el usuario');
        } finally {
            setLoading(false);
        }
    };

    const tiposDocumento = ['Cédula de ciudadanía', 'Cédula de extranjería', 'Pasaporte'];

    return (
        <View style={styles.container}>
            <Alert visible={alertVisible} tipo={alertTipo} mensaje={alertMensaje} onHide={() => setAlertVisible(false)} />
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.azulOscuro} />
                    </TouchableOpacity>
                    <Text style={styles.titulo}>{esEdicion ? 'Editar' : 'Crear'} usuario</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <Text style={styles.label}>Nombres *</Text>
                    <TextInput style={styles.input} value={formData.nombre} onChangeText={text => setFormData({ ...formData, nombre: text })} placeholder="Nombres" editable={!loading} />

                    <Text style={styles.label}>Apellidos</Text>
                    <TextInput style={styles.input} value={formData.apellidos} onChangeText={text => setFormData({ ...formData, apellidos: text })} placeholder="Apellidos" editable={!loading} />

                    <Text style={styles.label}>Tipo de documento</Text>
                    <View style={styles.selectContainer}>
                        {tiposDocumento.map(tipo => (
                            <TouchableOpacity key={tipo} style={[styles.selectOption, formData.tipo_documento === tipo && styles.selectOptionActive]} onPress={() => setFormData({ ...formData, tipo_documento: tipo })}>
                                <Text style={formData.tipo_documento === tipo ? styles.selectTextActive : styles.selectText}>{tipo}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Número de documento</Text>
                    <TextInput style={styles.input} value={formData.documento} onChangeText={text => setFormData({ ...formData, documento: text })} placeholder="Documento" keyboardType="numeric" editable={!loading} />

                    <Text style={styles.label}>Correo electrónico *</Text>
                    <TextInput style={styles.input} value={formData.email} onChangeText={text => setFormData({ ...formData, email: text })} placeholder="ejemplo@correo.com" keyboardType="email-address" autoCapitalize="none" editable={!loading} />

                    {/* Campo contraseña: siempre visible */}
                    <Text style={styles.label}>Contraseña {!esEdicion && '*'}</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.password}
                        onChangeText={text => setFormData({ ...formData, password: text })}
                        placeholder={esEdicion ? "Dejar vacío para no cambiar" : "******"}
                        secureTextEntry
                        editable={!loading}
                    />

                    <Text style={styles.label}>Teléfono</Text>
                    <TextInput style={styles.input} value={formData.telefono} onChangeText={text => setFormData({ ...formData, telefono: text })} placeholder="Teléfono" keyboardType="phone-pad" editable={!loading} />

                    <Text style={styles.label}>Dirección</Text>
                    <TextInput style={styles.input} value={formData.direccion} onChangeText={text => setFormData({ ...formData, direccion: text })} placeholder="Dirección" editable={!loading} />

                    <Text style={styles.label}>Municipio</Text>
                    <TextInput style={styles.input} value={formData.municipio} onChangeText={text => setFormData({ ...formData, municipio: text })} placeholder="Municipio" editable={!loading} />

                    <Text style={styles.label}>Departamento</Text>
                    <TextInput style={styles.input} value={formData.departamento} onChangeText={text => setFormData({ ...formData, departamento: text })} placeholder="Departamento" editable={!loading} />

                    <Text style={styles.label}>Rol *</Text>
                    <View style={styles.selectContainer}>
                        {roles.map(rol => (
                            <TouchableOpacity key={rol.id} style={[styles.selectOption, formData.rol_id === parseInt(rol.id) && styles.selectOptionActive]} onPress={() => setFormData({ ...formData, rol_id: parseInt(rol.id) })}>
                                <Text style={formData.rol_id === parseInt(rol.id) ? styles.selectTextActive : styles.selectText}>{rol.nombre}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.boton} onPress={handleGuardar} disabled={loading}>
                        {loading ? <ActivityIndicator color={colors.blanco} /> : <Text style={styles.botonTexto}>Guardar Cambios</Text>}
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