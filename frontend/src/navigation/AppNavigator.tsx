import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { Parametro } from '../types/parametros';
import { Usuario } from '../utils/api';

// IMPORTACION DE PANTALLAS
// ====================================================================
// PANTALLAS MIGRADAS Y ACTIVAS
// ====================================================================
import AuditoriaScreen from '../screens/AuditoriaScreen';
import DashboardScreen from '../screens/DashboardScreen';
import FormularioParametroScreen from '../screens/FormularioParametroScreen';
import FormularioRolScreen from '../screens/FormularioRolScreen';
import FormularioUsuarioScreen from '../screens/FormularioUsuarioScreen';
import LoginScreen from '../screens/LoginScreen';
import ParametrosScreen from '../screens/ParametrosScreen';
import ResultadoScreen from '../screens/ResultadoScreen';
import RolesScreen from '../screens/RolesScreen';
import SplashScreen from '../screens/SplashScreen';
import UsuariosScreen from '../screens/UsuariosScreen';

// ====================================================================
// PANTALLAS PENDIENTES Y COMENTADAS PARA QUE METRO NO FALLE
// ====================================================================
// import AgregarERPScreen from '../screens/AgregarERPScreen';
// import AgregarSegmentoScreen from '../screens/AgregarSegmentoScreen';
// import AnalizandoCreditoScreen from '../screens/AnalizandoCreditoScreen';
// import AutenticarClienteScreen from '../screens/AutenticarClienteScreen';
// import ClientesScreen from '../screens/ClientesScreen';
// import ConectarERPScreen from '../screens/ConectarERPScreen';
// import ConfiguracionScreen from '../screens/ConfiguracionScreen';
// import CrearClienteScreen from '../screens/CrearClienteScreen';
// import CreditosAprobadosScreen from '../screens/CreditosAprobadosScreen';
// import DetalleClienteScreen from '../screens/DetalleClienteScreen';
// import EditarEmpresaScreen from '../screens/EditarEmpresaScreen';
// import EditarSegmentoScreen from '../screens/EditarSegmentoScreen';
// import EmpresaPerfilScreen from '../screens/EmpresaPerfilScreen';
// import IntegracionERPScreen from '../screens/IntegracionERPScreen';
// import MiPerfilScreen from '../screens/MiPerfilScreen';
// import ModificarClienteScreen from '../screens/ModificarClienteScreen';
// import NotificacionesScreen from '../screens/NotificacionesScreen';
// import RechazadosScreen from '../screens/RechazadosScreen';
// import ReenviarTokenScreen from '../screens/ReenviarTokenScreen';
// import ReportesScreen from '../screens/ReportesScreen';
// import ResultadosScoringScreen from '../screens/ResultadosScoringScreen';
// import ScoringConfigScreen from '../screens/ScoringConfigScreen';
// import SegmentosClientesScreen from '../screens/SegmentosClientesScreen';
// import SolicitudesPendientesScreen from '../screens/SolicitudesPendientesScreen';
// import SolicitudNivelCuatroScreen from '../screens/SolicitudNivelCuatroScreen';
// import SolicitudNivelDosScreen from '../screens/SolicitudNivelDosScreen';
// import SolicitudNivelTresScreen from '../screens/SolicitudNivelTresScreen';
// import SolicitudNivelUnoScreen from '../screens/SolicitudNivelUnoScreen';


/**
 * Definicion de tipos para los parametros de navegacion de SIACRE
 * Registra formalmente todas las rutas del sistema para habilitar el autocompletado
 * y tipado fuerte al usar navigation.navigate()
*/

export type RootStackParamList = {
    Splash: undefined;
    Login: undefined;
    Resultado: {
      tipo: 'positivo' | 'negativo';
      titulo: string;
      subtitulo?: string;
      rutaDestino: keyof RootStackParamList; // Cualquier screen validado o incluido en el stack
      tiempoEspera?: number; // Opcional (1500ms por defecto)
      textoBoton?: string; // Opcional (por si el caso negativo requiere un boton "Reintentar")
    };
    Dashboard: undefined;
    Roles: undefined;
    FormularioRol: undefined | { rolExistente: any };
    Usuarios: undefined;
    FormularioUsuario: undefined | { usuarioExistente: Usuario };
    Auditoria: undefined;
    Parametros: undefined;
    FormularioParametro: {
      tipo_parametro: 'cualitativo' | 'cuantitativo';
      parametro_existente?: Parametro
    };
    ScoringConfig: undefined;

    Clientes: undefined;
    CrearCliente: undefined;
    ModificarCliente: undefined;
    Notificaciones: undefined;
    AutenticarCliente: undefined;
    ReenviarToken: undefined;
    SolicitudNivelUno: undefined;
    SolicitudNivelDos: undefined;
    SolicitudNivelTres: undefined;
    SolicitudNivelCuatro: undefined;
    CreditosAprobados: undefined;
    Rechazados: undefined;
    ResultadosScoring: undefined;
    EmpresaPerfil: undefined;
    Reportes: undefined;
    Configuracion: undefined;
    EditarEmpresa: undefined;
    SolicitudesPendientes: undefined;
    IntegracionERP: undefined;
    ConectarERP: undefined;
    AgregarERP: undefined;
    SegmentosClientes: undefined;
    AnalizandoCredito: undefined;
    MiPerfil: undefined;
    AgregarSegmento: undefined;
    EditarSegmento: undefined;
    DetalleCliente: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

/**
 * AppNavigator - Enrutador central de la aplicacion
 * Administra el historial de navegacion (Stack) manteniendo la configuracion original
 * de pantallas trasnparentes y ocultacion de cabeceras nativas
*/

export default function AppNavigator() {
  return (
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Resultado" component={ResultadoScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Roles" component={RolesScreen} />
        <Stack.Screen name="FormularioRol" component={FormularioRolScreen} />
        <Stack.Screen name="Usuarios" component={UsuariosScreen} />
        <Stack.Screen name="FormularioUsuario" component={FormularioUsuarioScreen} />
        <Stack.Screen name="Auditoria" component={AuditoriaScreen} />
        <Stack.Screen name="Parametros" component={ParametrosScreen} />
        <Stack.Screen name="FormularioParametro" component={FormularioParametroScreen} />

        {/* <Stack.Screen name="Clientes" component={ClientesScreen} />
        <Stack.Screen name="CrearCliente" component={CrearClienteScreen} />
        <Stack.Screen name="ModificarCliente" component={ModificarClienteScreen} />
        <Stack.Screen name="Notificaciones" component={NotificacionesScreen} />
        <Stack.Screen name="AutenticarCliente" component={AutenticarClienteScreen} />
        <Stack.Screen name="ReenviarToken" component={ReenviarTokenScreen} />
        <Stack.Screen name="SolicitudNivelUno" component={SolicitudNivelUnoScreen} />
        <Stack.Screen name="SolicitudNivelDos" component={SolicitudNivelDosScreen} />
        <Stack.Screen name="SolicitudNivelTres" component={SolicitudNivelTresScreen} />
        <Stack.Screen name="SolicitudNivelCuatro" component={SolicitudNivelCuatroScreen} />
        <Stack.Screen name="CreditosAprobados" component={CreditosAprobadosScreen} />
        <Stack.Screen name="Rechazados" component={RechazadosScreen} />
        <Stack.Screen name="ResultadosScoring" component={ResultadosScoringScreen} />
        <Stack.Screen name="ScoringConfig" component={ScoringConfigScreen} />
        <Stack.Screen name="EmpresaPerfil" component={EmpresaPerfilScreen} />
        <Stack.Screen name="Reportes" component={ReportesScreen} />
        <Stack.Screen name="Configuracion" component={ConfiguracionScreen} />
        <Stack.Screen name="EditarEmpresa" component={EditarEmpresaScreen} />
        <Stack.Screen name="SolicitudesPendientes" component={SolicitudesPendientesScreen} />
        <Stack.Screen name="IntegracionERP" component={IntegracionERPScreen} />
        <Stack.Screen name="ConectarERP" component={ConectarERPScreen} />
        <Stack.Screen name="AgregarERP" component={AgregarERPScreen} />
        <Stack.Screen name="SegmentosClientes" component={SegmentosClientesScreen} />
        <Stack.Screen name="AnalizandoCredito" component={AnalizandoCreditoScreen} />
        <Stack.Screen name="MiPerfil" component={MiPerfilScreen} />
        <Stack.Screen name="AgregarSegmento" component={AgregarSegmentoScreen} />
        <Stack.Screen name="EditarSegmento" component={EditarSegmentoScreen} />
        <Stack.Screen name="DetalleCliente" component={DetalleClienteScreen} /> */}
      </Stack.Navigator>
  );
}