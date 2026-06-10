import { NavigationContainer, NavigationIndependentTree } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { LogBox, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import AppNavigator from "../navigation/AppNavigator";
import { colors } from "../styles/globalStyles";

// Silenciar advertencias especificas que geenren ruido visual innecesario en la consola
LogBox.ignoreLogs(['InteractionManager has been deprecated']);

export default function AppEntryPoint() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        { /* Configuramos la barra de estado superior nativa de manera translucida */ }
        <StatusBar style="light" translucent />
        {/* Se envuelve el flujo en el arbol independiente */}
        <NavigationIndependentTree>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </NavigationIndependentTree>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.azulOscuro || "#0a1f44", // colors.azulOscuro base
  },
});