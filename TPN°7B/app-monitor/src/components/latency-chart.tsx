'use client';

import React, { useEffect, useState } from 'react';
import { useNetworkState } from "@/lib/stats-overview";
import { EventPayload } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LatencyDataPoint {
  time: string; // Para el eje X
  [key: string]: string | number; // Latencia de cada nodo (e.g., 'node-1': 53)
}

const MAX_DATA_POINTS = 20; // Últimos 20 puntos de datos

/**
 * Componente principal para el gráfico de latencia.
 */
export const LatencyChart: React.FC = () => {
    const { nodes } = useNetworkState();
    const [chartData, setChartData] = useState<LatencyDataPoint[]>([]);
    const nodeIds = Object.keys(nodes);

    // Colores para las líneas (uno por nodo)
    const nodeColors: Record<string, string> = {
        'node-1': '#3b82f6', // Blue
        'node-2': '#10b981', // Emerald
        'node-3': '#f59e0b', // Amber
        'node-4': '#ef4444', // Red
        'node-5': '#8b5cf6', // Violet
    };

    // Efecto para actualizar el historial de datos cuando los nodos cambian
    useEffect(() => {
        const currentNodes = Object.values(nodes);
        
        // Crear el nuevo punto de datos con la latencia actual de todos los nodos
        const newPoint: LatencyDataPoint = {
            time: new Date().toLocaleTimeString('es-ES', { second: '2-digit', minute: '2-digit' }),
        };

        currentNodes.forEach(node => {
            newPoint[node.id] = node.latencyMs;
        });

        // Actualizar el estado del gráfico (mantener solo los últimos MAX_DATA_POINTS)
        setChartData(prevData => {
            const updatedData = [...prevData, newPoint];
            return updatedData.slice(-MAX_DATA_POINTS);
        });

    }, [nodes]); // Dependencia: Se ejecuta cada vez que el estado de 'nodes' cambia (cada evento de latencia)


    return (
        <div className="bg-white p-4 rounded-xl shadow-lg mt-6">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Gráfico de Latencia de Red</h2>
            <p className="text-sm text-gray-500 mb-4">Latencia en tiempo real (últimos {MAX_DATA_POINTS} puntos)</p>
            <div className='h-[350px] w-full'>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="time" stroke="#6b7280" />
                        <YAxis 
                            label={{ value: 'Latencia (ms)', angle: -90, position: 'insideLeft', fill: '#6b7280' }} 
                            stroke="#6b7280" 
                            domain={[0, 550]} 
                        />
                        <Tooltip 
                            formatter={(value: number, name: string) => [`${value}ms`, nodes[name]?.name || name]}
                        />
                        <Legend />
                        
                        {/* Generar una línea para cada nodo dinámicamente */}
                        {nodeIds.map(nodeId => (
                            <Line 
                                key={nodeId}
                                type="monotone" 
                                dataKey={nodeId} 
                                stroke={nodeColors[nodeId]} 
                                strokeWidth={2}
                                dot={false}
                                name={nodes[nodeId]?.name}
                                isAnimationActive={false} // Desactivar animación para mejor rendimiento en tiempo real
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};