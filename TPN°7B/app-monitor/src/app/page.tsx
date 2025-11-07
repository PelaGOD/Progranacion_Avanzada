'use client';

import { useNetworkState } from "@/lib/stats-overview.tsx"; // Agregado .tsx
import { NodeCard } from "@/components/node-card.tsx";       // Agregado .tsx
import { LatencyChart } from "@/components/latency-chart.tsx"; // Agregado .tsx
import { EventLog } from "@/components/event-log.tsx";     // Agregado .tsx
import { Users, Zap, Wifi, Clock } from 'lucide-react';

/**
 * Componente que muestra las estadísticas generales de la red.
 */
const StatsOverview: React.FC = () => {
    const { stats } = useNetworkState();
    
    // Tarjetas de estadísticas generales
    const statCards = [
        {
            title: "Nodos Online",
            value: `${stats.onlineNodes} / ${Object.keys(stats.totalConnections).length}`, // Total de nodos activos
            icon: <Users className="w-6 h-6 text-blue-500" />,
            color: "border-blue-500",
        },
        {
            title: "Latencia Promedio",
            value: `${stats.avgLatency.toFixed(2)}ms`, // Promedio de latencia
            icon: <Clock className="w-6 h-6 text-green-500" />,
            color: "border-green-500",
        },
        {
            title: "Conexiones Totales",
            value: stats.totalConnections.toLocaleString(), // Total de conexiones
            icon: <Wifi className="w-6 h-6 text-yellow-500" />,
            color: "border-yellow-500",
        },
        {
            title: "Alarmas Críticas",
            value: stats.criticalAlarms, // Número de alarmas activas
            icon: <Zap className="w-6 h-6 text-red-500" />,
            color: "border-red-500",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {statCards.map((card) => (
                <div key={card.title} className={`bg-white p-4 rounded-xl shadow-lg border-l-4 ${card.color}`}>
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-500">{card.title}</p>
                        {card.icon}
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
            ))}
        </div>
    );
};


/**
 * Dashboard Principal
 */
export default function DashboardPage() {
    const { nodes } = useNetworkState();

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-extrabold mb-2 text-gray-900">Centro de Operaciones de Red</h1>
            <p className="text-gray-600 mb-6">Monitoreo en tiempo real de nodos de red con Simulador Kafka.</p>
            
            <StatsOverview />

            {/* Gráfico de Latencia */}
            <LatencyChart />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {/* Visualización de Nodos */}
                <div className="md:col-span-2">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2">Estado de Nodos de Red</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Object.values(nodes).map((node) => (
                            <NodeCard key={node.id} node={node} />
                        ))}
                    </div>
                </div>

                {/* Log de Eventos */}
                <div className="md:col-span-1">
                    <EventLog />
                </div>
            </div>
        </main>
    );
}