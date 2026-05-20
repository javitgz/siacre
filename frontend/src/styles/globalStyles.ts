import { StyleSheet } from 'react-native';

/**
 * Paleta de colores oficiales del ecosismeta SIACRE
 * Incluye transparencias y tonalidades para interfaces oscuras y claras
*/
export const colors = {
    azulOscuro: '#0a1f44',
    azulClaro: '#3a6ea5',
    azulVerdosoClaro: '#58c7da8a',
    verdeEsmeralda: '#28a37a',
    verdeEsmeraldaClaro: '#28a37a77',
    grisAzulado: '#5a6e7a',
    amarilloAlerta: '#caaf16',
    amarillo: '#ffff61',
    gris: '#b1b1b1',
    grisClaro: '#d6d6d617',
    grisClaroTono: '#d6d6d691',
    grisOscuro: '#4d4d4d',
    blanco: '#ffffff',
    negro: '#000000',
    rojoError: '#ff00007c',
    verdeExito: '#28a37a7c',
};

/**
 * stilos globales compartidos a lo largo de la aplicacion
 * Optimizacos para el renderizado eficiente en dispositivos moviles
*/
export const globalStyles = StyleSheet.create({
    // Contenedor principal que ocupa toda la pantalla (Fondo base oscuro)
    container: {
        flex: 1,
        backgroundColor: colors.azulOscuro,
    },
    // Fondo blanco para contenido scroll o formularios claros
    fondoBlanco: {
        flex: 1,
        backgroundColor: colors.blanco,
    },
    // Texto blanco base
    textoBlanco: {
        color: colors.blanco,
    },
    // Barra inferior decorativa o de arrastre personalizada
    barra: {
        position: 'absolute',
        bottom: 8,
        alignSelf: 'center',
        width: 120,
        height: 4,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 2,
    },
    // Cabecera de bienvenida superior
    bienvenida: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 17,
    },
    // Cabecera estándar para páginas secundarias
    tituloPaginas: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 25,
    },
    // Tarjetas contenedoras de datos financieros o métricas
    tarjeta: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: colors.grisClaro,
        marginHorizontal: 16,
        borderRadius: 12,
        paddingVertical: 16,
        marginBottom: 12,
    },
    // Ítem interno individual de cada tarjeta
    tarjetaItem: {
        alignItems: 'center',
        flex: 1,
    },
    // Título explicativo dentro de las tarjetas
    tituloTarjeta: {
        fontSize: 15,
        color: colors.blanco,
        marginBottom: 10,
    },
    // Valor o indicador numérico principal de la tarjeta (Verde Esmeralda)
    valorTarjeta: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.verdeEsmeralda,
    },
    // Contenedor flotante superior para notificaciones o alertas en tiempo real
    alerta: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
    },
});
