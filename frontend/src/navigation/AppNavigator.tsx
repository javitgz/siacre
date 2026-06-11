import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
// Pantallas existentes
import DashboardScreen from '../screens/DashboardScreen';
import LoginScreen from '../screens/LoginScreen';
import ResultadoScreen from '../screens/ResultadoScreen';
import SplashScreen from '../screens/SplashScreen';
// Pantallas de administracion y gestión
import AuditoriaScreen from '../screens/AuditoriaScreen';
import FormularioNaturalezaScreen from '../screens/FormularioNaturalezaScreen';
import FormularioParametroScreen from '../screens/FormularioParametroScreen';
import FormularioPermisoScreen from '../screens/FormularioPermisoScreen';
import FormularioRolScreen from '../screens/FormularioRolScreen';
import FormularioUsuarioScreen from '../screens/FormularioUsuarioScreen';
import NaturalezasScreen from '../screens/NaturalezasScreen';
import ParametrosScreen from '../screens/ParametrosScreen';
import PermisosScreen from '../screens/PermisosScreen';
import RolesScreen from '../screens/RolesScreen';
import UsuariosScreen from '../screens/UsuariosScreen';
// Estilos generales
import { colors } from '../styles/globalStyles';

// Definicion estricta de los parametros de ruta de nuestro Stack principal
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Dashboard: undefined;
  Resultado: {
    tipo: 'positivo' | 'negativo';
    titulo: string;
    subtitulo: string;
    rutaDestino: keyof RootStackParamList; // Asegura que la ruta destino sea válida
    tiempoEspera: number;
    textoBotom?: string;
  };
  Usuarios: undefined;
  Roles: undefined;
  Auditoria: undefined;
  Parametros: undefined;
  FormularioUsuario: { usuarioExistente?: any } | undefined;
  FormularioRol: { rolExistente?: any } | undefined;
  FormularioParametro: { tipo_parametro: 'cualitativo' | 'cuantitativo'; parametro_existente?: any } | undefined;
  // Agregar mas pantallas
  Permisos: undefined;
  FormularioPermiso: { permisoExistente?: any } | undefined;
  Naturalezas: undefined;
  FormularioNaturaleza: { naturalezaExistente?: any } | undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName='Splash'
      screenOptions={{
        headerShown: false,
        // Aplicamos el color corpotativo de fondo por defecto para evitar parpadeos blancos entre transiciones
        cardStyle: { backgroundColor: colors.azulOscuro || '#0a1f44'},
      }}>
        <Stack.Screen name='Splash' component={SplashScreen}/>
        <Stack.Screen name='Login' component={LoginScreen}/>
        <Stack.Screen name='Dashboard' component={DashboardScreen}/>
        <Stack.Screen name='Resultado' component={ResultadoScreen}/>
        {/* Pantallas de gestión */}
        <Stack.Screen name='Usuarios' component={UsuariosScreen} />
        <Stack.Screen name='Roles' component={RolesScreen} />
        <Stack.Screen name='Auditoria' component={AuditoriaScreen} />
        <Stack.Screen name='Parametros' component={ParametrosScreen} />
        <Stack.Screen name='FormularioUsuario' component={FormularioUsuarioScreen} />
        <Stack.Screen name='FormularioRol' component={FormularioRolScreen} />
        <Stack.Screen name='FormularioParametro' component={FormularioParametroScreen} />
        <Stack.Screen name='Permisos' component={PermisosScreen}/>
        <Stack.Screen name='FormularioPermiso' component={FormularioPermisoScreen}/>
        <Stack.Screen name="Naturalezas" component={NaturalezasScreen} />
        <Stack.Screen name="FormularioNaturaleza" component={FormularioNaturalezaScreen} />
        {/* Agregar mas pantallas sgun el avance */}
    </Stack.Navigator>
  )
}