import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import {
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { AbstractChartConfig } from 'react-native-chart-kit/dist/AbstractChart';
import BottomNavigation from '../components/BottomNavigation';
import MenuPerfil from '../components/MenuPerfil';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, globalStyles } from '../styles/globalStyles';
import { obtenerClientes, obtenerSolicitudes } from '../utils/asyncStorage';

// Definición de Interfaces para el Control de Tipos
interface Estadisticas {
    totalCartera: number;
    limiteOperativo: number;
    carteraRetraso: number;
    porcentajeRetraso: number;
    clientesAtendidos: number;
    solicitudesPendientes: number;
    creditosAprobados: number;
}

interface PieChartDataItem {
    name: string;
    population: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
}

// Tipado estricto para los Props de Navegación del Dashboard
type Props = StackScreenProps<RootStackParamList, 'Dashboard'>;

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 60;

export default function DashboardScreen({ navigation }: Props) {
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [menuVisible, setMenuVisible] = useState<boolean>(false);

    const [estadisticas, setEstadisticas] = useState<Estadisticas>({
        totalCartera: 120000000,
        limiteOperativo: 150000000,
        carteraRetraso: 6000000,
        porcentajeRetraso: 5,
        clientesAtendidos: 0,
        solicitudesPendientes: 0,
        creditosAprobados: 0,
    });

    const [datosGraficaBarras] = useState({
        labels: ['1S', '2S', '3S', '4S'],
        datasets: [
            { data: [12000, 15000, 10000, 13000] },
            { data: [8000, 11000, 7000, 9000] },
        ],
    });

    const [datosPieChart] = useState<PieChartDataItem[]>([
        { name: 'Óptima', population: 10, color: colors.azulClaro, legendFontColor: colors.grisOscuro, legendFontSize: 10 },
        { name: 'Buena', population: 79, color: colors.verdeEsmeralda, legendFontColor: colors.grisOscuro, legendFontSize: 10 },
        { name: 'Mala', population: 11, color: colors.amarilloAlerta, legendFontColor: colors.grisOscuro, legendFontSize: 10 },
    ]);

    const [datosLinea] = useState({
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        datasets: [{ data: [100000, 120000, 115000, 130000, 125000, 140000, 135000, 150000, 145000, 160000, 155000, 170000] }],
    });

    const cargarEstadisticas = async () => {
        try {
            setRefreshing(true);
            const clientes = await obtenerClientes() || [];
            const solicitudes = await obtenerSolicitudes() || [];

            const aprobados = clientes.filter((c: any) => c.estado === 'aprobado').length;
            const pendientes = solicitudes.filter((s: any) => s.estado === 'en_progreso').length;

            setEstadisticas(prev => ({
                ...prev,
                clientesAtendidos: clientes.length,
                solicitudesPendientes: pendientes,
                creditosAprobados: aprobados,
            }));
        } catch (error) {
            console.error("Error cargando estadísticas en Dashboard:", error);
        } finally {
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            cargarEstadisticas();
        }, [])
    );

    const chartConfig: AbstractChartConfig = {
        backgroundColor: colors.blanco,
        backgroundGradientFrom: colors.blanco,
        backgroundGradientTo: colors.blanco,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(58, 110, 165, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(77, 77, 77, ${opacity})`,
        style: { borderRadius: 16 },
    };

    const barChartConfig = {
        ...chartConfig,
        color: (opacity = 1, index?: number) => index === 0
            ? `rgba(58, 110, 165, ${opacity})`
            : `rgba(40, 163, 122, ${opacity})`,
    };

    return (
        <View style={globalStyles.container}>
            {/* Parte superior AZUL */}
            <View style={styles.headerAzul}>
                <View style={globalStyles.bienvenida}>
                    <View>
                        <Text style={[globalStyles.textoBlanco, styles.nombrePequeño]}>Bienvenido</Text>
                        <TouchableOpacity onPress={() => setMenuVisible(true)}>
                            <Text style={[globalStyles.textoBlanco, styles.nombre]}>Javier Tamayo</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={styles.notificaciones}
                        onPress={() => navigation.navigate('Notificaciones')}
                    >
                        <Ionicons name="notifications-outline" size={20} color={colors.blanco} />
                    </TouchableOpacity>
                </View>

                {/* Tarjeta de cartera */}
                <View style={globalStyles.tarjeta}>
                    <View style={globalStyles.tarjetaItem}>
                        <Text style={globalStyles.tituloTarjeta}>Total cartera</Text>
                        <Text style={globalStyles.valorTarjeta}>${estadisticas.totalCartera.toLocaleString()}</Text>
                    </View>
                    <View style={styles.divisor} />
                    <View style={globalStyles.tarjetaItem}>
                        <Text style={globalStyles.tituloTarjeta}>Límite operativo</Text>
                        <Text style={globalStyles.valorTarjeta}>${estadisticas.limiteOperativo.toLocaleString()}</Text>
                    </View>
                </View>

                {/* Progreso */}
                <View style={styles.progresoContainer}>
                    <View style={styles.progressWrapper}>
                        <View style={[styles.progressBar, { width: '80%', backgroundColor: colors.azulClaro }]}>
                            <Text style={styles.progressText}>80%</Text>
                        </View>
                        <View style={[styles.progressBar, { width: '20%', backgroundColor: colors.grisAzulado }]}>
                            <Text style={styles.progressText}>20%</Text>
                        </View>
                    </View>
                    <Text style={styles.alertaCartera}>
                        Cartera con retraso: ${estadisticas.carteraRetraso.toLocaleString()} ({estadisticas.porcentajeRetraso}%)
                    </Text>
                </View>
            </View>

            {/* Parte inferior BLANCA con scroll */}
            <View style={styles.fondoBlanco}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={cargarEstadisticas} />}
                >
                    {/* Tarjetas de resumen */}
                    <View style={styles.resumenContainer}>
                        <TouchableOpacity
                            style={styles.resumenCard}
                            onPress={() => navigation.navigate('Clientes')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.resumenNumero}>{estadisticas.clientesAtendidos}</Text>
                            <Text style={styles.resumenLabel}>Clientes</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.resumenCard}
                            onPress={() => navigation.navigate('SolicitudesPendientes')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.resumenNumero}>{estadisticas.solicitudesPendientes}</Text>
                            <Text style={styles.resumenLabel}>Pendientes</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.resumenCard}
                            onPress={() => navigation.navigate('CreditosAprobados')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.resumenNumero}>{estadisticas.creditosAprobados}</Text>
                            <Text style={styles.resumenLabel}>Aprobados</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Gráfica de Barras */}
                    <View style={styles.graficaContainer}>
                        <View style={styles.graficaHeader}>
                            <Text style={styles.graficaTitulo}>Febrero 2026</Text>
                            <Ionicons name="calendar-outline" size={16} color={colors.grisOscuro} />
                        </View>
                        <BarChart
                            data={datosGraficaBarras}
                            width={chartWidth}
                            height={220}
                            yAxisLabel="$"
                            yAxisSuffix="k"
                            chartConfig={barChartConfig}
                            verticalLabelRotation={30}
                            showValuesOnTopOfBars
                            fromZero
                            style={styles.chart}
                        />
                        <View style={styles.legendas}>
                            <View style={styles.legenda}><View style={[styles.legendaColor, { backgroundColor: colors.azulClaro }]} /><Text style={styles.legendaText}>Total cartera</Text></View>
                            <View style={styles.legenda}><View style={[styles.legendaColor, { backgroundColor: colors.verdeEsmeralda }]} /><Text style={styles.legendaText}>Recaudo</Text></View>
                        </View>
                    </View>

                    {/* Gráfica de Anillos */}
                    <View style={styles.graficaContainer}>
                        <Text style={styles.graficaTitulo}>Calidad de cartera</Text>
                        <PieChart
                            data={datosPieChart}
                            width={chartWidth}
                            height={220}
                            chartConfig={chartConfig}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            absolute
                            style={styles.chart}
                        />
                    </View>

                    {/* Gráfica de Línea */}
                    <View style={styles.graficaContainer}>
                        <Text style={styles.graficaTitulo}>Evolución mensual</Text>
                        <LineChart
                            data={datosLinea}
                            width={chartWidth}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                            formatYLabel={(value) => `$${parseInt(value) / 1000}k`}
                        />
                    </View>
                </ScrollView>
            </View>

            {/* Barra de navegación flotante */}
            <BottomNavigation navigation={navigation} currentScreen="Dashboard" />

            {/* Componente para menú perfil */}
            <MenuPerfil
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                navigation={navigation}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    headerAzul: {
        backgroundColor: colors.azulOscuro,
        paddingBottom: 16,
    },
    nombrePequeño: { fontSize: 12 },
    nombre: { fontSize: 14, fontWeight: 'bold' },
    notificaciones: {
        width: 32,
        height: 32,
        borderRadius: 25,
        borderWidth: 0.5,
        borderColor: colors.blanco,
        justifyContent: 'center',
        alignItems: 'center',
    },
    divisor: {
        width: 1,
        height: 40,
        backgroundColor: colors.blanco,
    },
    progresoContainer: {
        paddingHorizontal: 16,
        marginTop: 12,
    },
    progressWrapper: {
        flexDirection: 'row',
        height: 20,
        borderRadius: 10,
        overflow: 'hidden',
    },
    progressBar: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressText: {
        color: colors.blanco,
        fontSize: 10,
        fontWeight: 'bold',
    },
    alertaCartera: {
        color: colors.amarillo,
        fontSize: 11,
        textAlign: 'center',
        marginTop: 8,
    },
    fondoBlanco: {
        flex: 1,
        backgroundColor: colors.blanco,
        borderRadius: 25,
        paddingTop: 12,
        paddingBottom: 80,
    },
    resumenContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 16,
        gap: 12,
    },
    resumenCard: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        position: 'relative',
    },
    resumenNumero: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.verdeEsmeralda,
        marginTop: 4,
    },
    resumenLabel: {
        fontSize: 10,
        color: colors.grisOscuro,
        marginTop: 2,
    },
    graficaContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: 15,
        padding: 12,
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
    },
    graficaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    graficaTitulo: {
        fontSize: 12,
        fontWeight: '500',
        color: colors.grisOscuro,
        marginBottom: 10,
    },
    chart: {
        borderRadius: 10,
    },
    legendas: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginTop: 8,
    },
    legenda: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendaColor: {
        width: 12,
        height: 12,
        borderRadius: 2,
    },
    legendaText: {
        fontSize: 10,
        color: colors.grisOscuro,
    },
});