import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator'; // Ajusta la ruta si tu carpeta src varía

// Silenciar advertencias especificas que generen ruido visual en la consola
LogBox.ignoreLogs(['InteractionManager has been deprecated']);

export default function App() {
  return (
    <SafeAreaProvider>
      {/* NavigationContainer es el encargado de gestionar el estado del historial de rutas globales */}
      <NavigationContainer>
        {/* Configuramos la barra de estado superior nativa */}
        <StatusBar style="light" translucent />
        
        {/* Renderiza el enrutador central de SIACRE que ya dejamos configurado con TypeScript */}
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}