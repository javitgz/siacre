import { Slot } from "expo-router";
import React from "react";
/**
 * RootLayout - Punto de montaje principal de Expo Router 
 * Utiliza <Slot/> para actuar como un puente transparente
 * 
permitiendo que nuestra navegacion clasica tome el control total 
*/
export default function RootLayout() {
  return <Slot />;
}
