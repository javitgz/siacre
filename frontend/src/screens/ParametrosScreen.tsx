import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import Alert from '../components/Alert';
import BottomNavigation from '../components/BottomNavigation';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';
import { Parametro } from '../types/parametros';

type Props = StackScreenProps<RootStackParamList, 'Parametros'>;
type TipoParametro = 'cualitativo' | 'cuantitativo';

export default function ParametrosScreen({ navigation }: Props) {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [parametrosCualitativos, setParametrosCualitativos] = useState<Parametro[]>([]);
  const [parametrosCuantitativos, setParametrosCuantitativos] = useState<Parametro[]>([]);
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertTipo, setAlertTipo] = useState<'positivo' | 'negativo'>('positivo');
  const [alertMensaje, setAlertMensaje] = useState<string>('');

  const mostrarAlerta = (tipo: 'positivo' | 'negativo', mensaje: string) => {
    setAlertTipo(tipo);
    setAlertMensaje(mensaje);
    setAlertVisible(true);
  };

  const cargarParametros = async () => {
    try {
      const cualitativos = await AsyncStorage.getItem('@parametros_cualitativos');
      const cuantitativos = await AsyncStorage.getItem('@parametros_cuantitativos');
      
      if (cualitativos) setParametrosCualitativos(JSON.parse(cualitativos) as Parametro[]);
      if (cuantitativos) setParametrosCuantitativos(JSON.parse(cuantitativos) as Parametro[]);
    } catch (error) {
      console.error('Error cargando parámetros:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarParametros();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarParametros();
    setRefreshing(false);
  };

  const handleAgregar = (tipo: TipoParametro) => {
    // Estandarizado al nuevo patrón de arquitectura de formularios
    navigation.navigate('FormularioParametro', { tipo_parametro: tipo });
  };

  const handleEditar = (parametro: Parametro, tipo: TipoParametro) => {
    navigation.navigate('FormularioParametro', { 
      tipo_parametro: tipo, 
      parametro_existente: parametro 
    });
  };

  const handleEliminar = async (id: string, tipo: TipoParametro) => {
    let listaActualizada: Parametro[];
    if (tipo === 'cualitativo') {
      listaActualizada = parametrosCualitativos.filter(p => p.id !== id);
      setParametrosCualitativos(listaActualizada);
      await AsyncStorage.setItem('@parametros_cualitativos', JSON.stringify(listaActualizada));
    } else {
      listaActualizada = parametrosCuantitativos.filter(p => p.id !== id);
      setParametrosCuantitativos(listaActualizada);
      await AsyncStorage.setItem('@parametros_cuantitativos', JSON.stringify(listaActualizada));
    }
    mostrarAlerta('positivo', 'Parámetro eliminado correctamente');
  };

  const renderParametroItem = (parametro: Parametro, tipo: TipoParametro) => (
    <View key={parametro.id} style={styles.itemParametro}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemNombre}>{parametro.nombre}</Text>
        <Text style={styles.itemDescripcion}>{parametro.descripcion}</Text>
        {parametro.peso !== undefined && (
          <Text style={styles.itemPeso}>Peso: {parametro.peso}%</Text>
        )}
        {parametro.tipo_medicion === 'meta' && parametro.valor_meta && (
          <Text style={styles.itemValor}>Valor meta: {parametro.valor_meta}</Text>
        )}
        {parametro.tipo_medicion === 'rango' && parametro.rango_min && parametro.rango_max && (
          <Text style={styles.itemValor}>
            Rango: {parametro.rango_min} - {parametro.rango_max}
          </Text>
        )}
      </View>
      <View style={styles.itemAcciones}>
        <TouchableOpacity
          style={styles.botonEditar}
          onPress={() => handleEditar(parametro, tipo)}
          activeOpacity={0.7}
        >
          <Ionicons name="pencil" size={16} color={colors.blanco} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botonEliminar}
          onPress={() => handleEliminar(parametro.id, tipo)}
          activeOpacity={0.7}
        >
          <Ionicons name="trash" size={16} color={colors.blanco} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Alert
        visible={alertVisible}
        tipo={alertTipo}
        mensaje={alertMensaje}
        onHide={() => setAlertVisible(false)}
      />
      
      {/* Cabecera azul */}
      <View style={styles.headerAzul}>
        <View style={styles.bienvenida}>
          <View>
            <Text style={[styles.textoBlanco, styles.nombrePequeño]}>Bienvenido</Text>
            <Text style={[styles.textoBlanco, styles.nombre]}>Javier Tamayo</Text>
          </View>
          <TouchableOpacity onPress={() => handleAgregar('cualitativo')} activeOpacity={0.8}>
            <Ionicons name="add-circle" size={28} color={colors.blanco} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido blanco con scroll */}
      <View style={styles.fondoBlanco}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Datos Cualitativos */}
          <View style={styles.seccion}>
            <View style={styles.seccionHeader}>
              <Text style={styles.seccionTitulo}>Datos cualitativos</Text>
              <TouchableOpacity onPress={() => handleAgregar('cualitativo')}>
                <Ionicons name="add" size={20} color={colors.azulClaro} />
              </TouchableOpacity>
            </View>
            {parametrosCualitativos.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No hay parámetros cualitativos</Text>
                <TouchableOpacity onPress={() => handleAgregar('cualitativo')}>
                  <Text style={styles.emptyStateLink}>Agregar primero</Text>
                </TouchableOpacity>
              </View>
            ) : (
              parametrosCualitativos.map(p => renderParametroItem(p, 'cualitativo'))
            )}
          </View>

          {/* Datos Cuantitativos */}
          <View style={styles.seccion}>
            <View style={styles.seccionHeader}>
              <Text style={styles.seccionTitulo}>Datos cuantitativos</Text>
              <TouchableOpacity onPress={() => handleAgregar('cuantitativo')}>
                <Ionicons name="add" size={20} color={colors.azulClaro} />
              </TouchableOpacity>
            </View>
            {parametrosCuantitativos.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No hay parámetros cuantitativos</Text>
                <TouchableOpacity onPress={() => handleAgregar('cuantitativo')}>
                  <Text style={styles.emptyStateLink}>Agregar primero</Text>
                </TouchableOpacity>
              </View>
            ) : (
              parametrosCuantitativos.map(p => renderParametroItem(p, 'cuantitativo'))
            )}
          </View>
        </ScrollView>
      </View>

      <BottomNavigation navigation={navigation} currentScreen="Parametros" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.azulOscuro,
  },
  headerAzul: {
    backgroundColor: colors.azulOscuro,
  },
  bienvenida: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 17,
  },
  textoBlanco: {
    color: colors.blanco,
  },
  nombrePequeño: { fontSize: 12 },
  nombre: { fontSize: 14, fontWeight: 'bold' },
  fondoBlanco: {
    flex: 1,
    backgroundColor: colors.blanco,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -8,
    paddingTop: 16,
  },
  seccion: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  seccionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  seccionTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.azulOscuro,
  },
  itemParametro: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemNombre: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.azulOscuro,
  },
  itemDescripcion: {
    fontSize: 12,
    color: colors.grisOscuro,
    marginTop: 2,
  },
  itemPeso: {
    fontSize: 11,
    color: colors.verdeEsmeralda,
    marginTop: 2,
  },
  itemValor: {
    fontSize: 11,
    color: colors.azulClaro,
    marginTop: 2,
  },
  itemAcciones: {
    flexDirection: 'row',
    gap: 8,
  },
  botonEditar: {
    backgroundColor: '#ffc107',
    padding: 8,
    borderRadius: 6,
  },
  botonEliminar: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 6,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  emptyStateText: {
    color: colors.grisOscuro,
    fontSize: 12,
  },
  emptyStateLink: {
    color: colors.azulClaro,
    fontSize: 12,
    marginTop: 8,
    textDecorationLine: 'underline',
  },
});