import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';

// Tipado de propiedades para la pantalla de respuesta negativa
type Props = StackScreenProps<RootStackParamList, 'RespuestaNegativa'>;

export default function RespuestaNegativaScreen({ navigation }: Props) {
    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace('Login');
        }, 2000);

        // Limpieza del temporizador para evitar fugas de memoria en segundo plano
        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Ionicons name="close-circle" size={100} color="#ff0000" />
            <Text style={styles.mensaje}>Ha ocurrido un error</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.azulOscuro,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mensaje: {
        color: colors.blanco,
        fontSize: 20,
        marginTop: 20,
    },
});