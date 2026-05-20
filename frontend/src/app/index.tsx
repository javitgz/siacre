import React from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";

/**
 * AppEntryPoint - punto de entrada de la aplicación
 * Temporalmente muestra el estado del puente de migración
 * En la fase 5, este archivo importará y renderizará el <AppNavigator />
 */
export default function AppEntryPoint() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      <View style={styles.card}>
        <Text style={styles.icon}>🚀</Text>
        <Text style={styles.title}>SIACRE - Frontend</Text>
        <Text style={styles.subtitle}>Puente TypeScript</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>Fase 4: Éxito</Text>
        </View>

        <Text style={styles.description}>
          El motor de Expo 55 y el entorno .tsx están listos y estables. No
          avances hasta verificar esta pantalla en tu Pixel 6.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f11",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#1a1a1e",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#2a2a30",
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#9bc5ff",
    marginBottom: 16,
    textAlign: "center",
  },
  badge: {
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4caf50",
    marginBottom: 20,
  },
  badgeText: {
    color: "#4caf50",
    fontSize: 12,
    fontWeight: "600",
  },
  description: {
    fontSize: 13,
    color: "#a0a0ab",
    textAlign: "center",
    lineHeight: 20,
  },
});
