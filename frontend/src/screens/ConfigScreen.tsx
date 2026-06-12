import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomNavigation from '../components/BottomNavigation';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';

type Props = StackScreenProps<RootStackParamList, 'Configuracion'>;

export default function ConfigScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.textoBlanco, styles.titulo]}>Configuración</Text>
      </View>
      <View style={styles.fondoBlanco}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.opcion} onPress={() => navigation.navigate('Naturalezas')}>
            <Ionicons name="leaf-outline" size={28} color={colors.azulClaro} />
            <View style={styles.opcionTexto}>
              <Text style={styles.opcionTitulo}>Naturalezas</Text>
              <Text style={styles.opcionDescripcion}>Gestionar tipos de persona (natural/jurídica)</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.grisOscuro} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.opcion} onPress={() => navigation.navigate('Empresas')}>
            <Ionicons name="business-outline" size={28} color={colors.azulClaro} />
            <View style={styles.opcionTexto}>
              <Text style={styles.opcionTitulo}>Empresas</Text>
              <Text style={styles.opcionDescripcion}>Administrar empresas del sistema</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.grisOscuro} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.opcion} onPress={() => navigation.navigate('NucleoVariables')}>
            <Ionicons name="stats-chart-outline" size={28} color={colors.azulClaro} />
            <View style={styles.opcionTexto}>
              <Text style={styles.opcionTitulo}>Núcleo de variables</Text>
              <Text style={styles.opcionDescripcion}>Configurar pesos cualitativo / cuantitativo</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.grisOscuro} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.opcion} onPress={() => navigation.navigate('Score')}>
            <Ionicons name="trophy-outline" size={28} color={colors.azulClaro} />
            <View style={styles.opcionTexto}>
              <Text style={styles.opcionTitulo}>Score Global</Text>
              <Text style={styles.opcionDescripcion}>Configurar puntaje máximo y distribución</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.grisOscuro} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.opcion} onPress={() => navigation.navigate('Parametros')}>
            <Ionicons name="list-outline" size={28} color={colors.azulClaro} />
            <View style={styles.opcionTexto}>
              <Text style={styles.opcionTitulo}>Parámetros</Text>
              <Text style={styles.opcionDescripcion}>Crear/editar parámetros del scoring</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.grisOscuro} />
          </TouchableOpacity>
        </ScrollView>
      </View>
      <BottomNavigation navigation={navigation} currentScreen="Config" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.azulOscuro },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 17 },
  textoBlanco: { color: colors.blanco },
  titulo: { fontSize: 18, fontWeight: 'bold' },
  fondoBlanco: { flex: 1, backgroundColor: colors.blanco, borderTopLeftRadius: 25, borderTopRightRadius: 25, marginTop: -8, paddingTop: 16 },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    gap: 12,
  },
  opcionTexto: { flex: 1 },
  opcionTitulo: { fontSize: 16, fontWeight: '500', color: colors.azulOscuro },
  opcionDescripcion: { fontSize: 12, color: colors.grisOscuro, marginTop: 2 },
});