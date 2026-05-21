import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/globalStyles';

// Definicion de tipos para las propiedades de la pantalla usando el Stack de navegacion
type Props = StackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({navigation}: Props){
    useEffect(()=>{
        const timer = setTimeout(()=>{
            navigation.replace('Login');
        }, 2000);

        // Limpieza del temporizador si el componente se desmonta antes de los 2 segundos
        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Image
            source={require('../../assets/images/logo-siacre-oscuro.png')}
            style={styles.logo}
            resizeMode='contain'
            />
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
    logo: {
        width: 200,
        height: 200,
    },
});