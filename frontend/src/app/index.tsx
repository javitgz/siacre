// src/app/index.tsx
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { UserResponse } from "../types/auth.types";
import { loginUser } from "../utils/api";
import { deleteUserSession, getUserSession, saveUserSession } from "../utils/storage";

export default function AppEntryPoint() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);

  // Verificar si ya hay una sesión persistida al abrir la app
  useEffect(() => {
    const checkSession = async () => {
      const sessionActiva = await getUserSession();
      if (sessionActiva) {
        setUser(sessionActiva);
      }
    };
    checkSession();
  }, []);

  const handleLoginSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Campos requeridos", "Por favor, completa ambos campos.");
      return;
    }

    setLoading(true);
    try {
      // 1. Petición al Backend
      const usuarioData = await loginUser({ email: email.trim(), password });
      
      // 2. Persistencia Cifrada en el Pixel 6
      await saveUserSession(usuarioData);
      
      // 3. Modificar el estado local
      setUser(usuarioData);
      
      Alert.alert("🎉 ¡Sesión Iniciada y Cifrada!", `Hola de nuevo, ${usuarioData.nombre}`);
    } catch (error: any) {
      Alert.alert("Fallo en la autenticación", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await deleteUserSession();
    setUser(null);
    setEmail("");
    setPassword("");
    Alert.alert("Sesión cerrada", "La sesión segura ha sido destruida del dispositivo.");
  };

  // SI YA ESTÁ LOGUEADO: Muestra estado de sesión persistida
  if (user) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <View style={styles.card}>
          <Text style={styles.icon}>👤</Text>
          <Text style={styles.title}>Sesión Activa Segura</Text>
          <Text style={styles.subtitle}>Datos persistidos en el dispositivo</Text>
          
          <View style={styles.sessionBox}>
            <Text style={styles.sessionText}><Text style={{fontWeight: 'bold'}}>Usuario:</Text> {user.nombre}</Text>
            <Text style={styles.sessionText}><Text style={{fontWeight: 'bold'}}>Email:</Text> {user.email}</Text>
            <Text style={styles.sessionText}><Text style={{fontWeight: 'bold'}}>Rol ID:</Text> {user.rol_id}</Text>
          </View>

          <TouchableOpacity style={[styles.button, { backgroundColor: '#d32f2f' }]} onPress={handleLogout}>
            <Text style={styles.buttonText}>Cerrar Sesión (Borrar Almacenamiento)</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // SI NO ESTÁ LOGUEADO: Muestra el formulario normal
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      <View style={styles.card}>
        <Text style={styles.icon}>🔐</Text>
        <Text style={styles.title}>SIACRE - Secure Login</Text>
        <Text style={styles.subtitle}>Conexión Cifrada Local</Text>

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#70707a"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#70707a"
          secureTextEntry
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLoginSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Ingresar y Persistir</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f11", alignItems: "center", justifyContent: "center", padding: 24 },
  card: { backgroundColor: "#1a1a1e", borderRadius: 16, padding: 24, alignItems: "center", width: "100%", borderWidth: 1, borderColor: "#2a2a30" },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#ffffff", marginBottom: 4, textAlign: "center" },
  subtitle: { fontSize: 14, color: "#9bc5ff", marginBottom: 24, textAlign: "center" },
  input: { width: "100%", backgroundColor: "#0f0f11", borderWidth: 1, borderColor: "#2a2a30", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, color: "#ffffff", fontSize: 15, marginBottom: 16 },
  button: { width: "100%", backgroundColor: "#2f80ed", borderRadius: 8, paddingVertical: 14, alignItems: "center", justifyContent: "center", marginTop: 8, marginBottom: 10 },
  buttonDisabled: { backgroundColor: "#1c4a85" },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
  sessionBox: { width: '100%', backgroundColor: '#0f0f11', padding: 16, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#2a2a30' },
  sessionText: { color: '#ffffff', fontSize: 14, marginBottom: 6 }
});