import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
// Pantallas de carga
import DashboardScreen from '../screens/DashboardScreen';
import LoginScreen from '../screens/LoginScreen';
import ResultadoScreen from '../screens/ResultadoScreen';
import SplashScreen from '../screens/SplashScreen';
// Pantallas de administracion y gestión
import AuditoriaScreen from '../screens/AuditoriaScreen';
import ConfigMotorScreen from '../screens/ConfigMotorScreen';
import ConfigScreen from '../screens/ConfigScreen';
import EmpresasScreen from '../screens/EmpresasScreen';
import EscenariosScreen from '../screens/EscenariosScreen';
import FormularioEmpresaScreen from '../screens/FormularioEmpresaScreen';
import FormularioEscenarioScreen from '../screens/FormularioEscenarioScreen';
import FormularioNaturalezaScreen from '../screens/FormularioNaturalezaScreen';
import FormularioParametroScreen from '../screens/FormularioParametroScreen';
import FormularioPermisoScreen from '../screens/FormularioPermisoScreen';
import FormularioRolScreen from '../screens/FormularioRolScreen';
import FormularioUsuarioScreen from '../screens/FormularioUsuarioScreen';
import NaturalezasScreen from '../screens/NaturalezasScreen';
import NucleoVariablesScreen from '../screens/NucleoVariablesScreen';
import ParametrosScreen from '../screens/ParametrosScreen';
import PermisosScreen from '../screens/PermisosScreen';
import RolesScreen from '../screens/RolesScreen';
import ScoreScreen from '../screens/ScoreScreen';
import UsuariosScreen from '../screens/UsuariosScreen';
// Tipos
import { colors } from '../styles/globalStyles';
import type { Empresa } from '../types/empresa.types';
import type { Escenario } from '../types/escenario.types';

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
    textoBoton?: string;
  };
  Usuarios: undefined;
  Roles: undefined;
  Auditoria: undefined;
  Parametros: undefined;
  FormularioUsuario: { usuarioExistente?: any } | undefined;
  FormularioRol: { rolExistente?: any } | undefined;
  FormularioParametro: { tipo_parametro: 'cualitativo' | 'cuantitativo'; parametro_existente?: any } | undefined;
  Permisos: undefined;
  FormularioPermiso: { permisoExistente?: any } | undefined;
  Naturalezas: undefined;
  FormularioNaturaleza: { naturalezaExistente?: any } | undefined;
  Empresas: undefined;
  FormularioEmpresa: { empresaExistente?: Empresa } | undefined;
  NucleoVariables: undefined;
  Configuracion: undefined; // Portafolio de configuraciones (naturaleza, empresa, nucleo, score, etc)
  Score: undefined;
  Escenarios: { parametroId: number; parametroNombre: string };
  FormularioEscenario: { parametroId: number; parametroNombre: string; escenarioExistente?: Escenario } | undefined;
  MotorConfig: undefined; // Configuracion de motor de scoring
  // Agregar mas pantallas
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
        <Stack.Screen name="NucleoVariables" component={NucleoVariablesScreen} />
        <Stack.Screen name="Configuracion" component={ConfigScreen} /> 
        <Stack.Screen name="Score" component={ScoreScreen} />
        <Stack.Screen name="Empresas" component={EmpresasScreen} />
        <Stack.Screen name="FormularioEmpresa" component={FormularioEmpresaScreen} />
        <Stack.Screen name="Escenarios" component={EscenariosScreen} />
        <Stack.Screen name="FormularioEscenario" component={FormularioEscenarioScreen} />
        <Stack.Screen name="MotorConfig" component={ConfigMotorScreen} />
        {/* Agregar mas pantallas sgun el avance */}
    </Stack.Navigator>
  )
}