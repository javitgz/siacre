import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';

// Tipado de propiedades para la pantalla de respuesta positiva
type Props = StackScreenProps<RootStackParamList, 'RespuestaPositiva'>;

export default function RespuestaPositivaScreen({ navigation }: Props) {
    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace('Dashboard');
        }, 1500);

        // Limpieza automática del temporizador si el componente se desmonta antes de tiempo
        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Ionicons name="checkmark-circle" size={100} color={colors.verdeEsmeralda} />
            <Text style={styles.mensaje}>Bienvenido</Text>
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