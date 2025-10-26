import { Node } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // Integrar Recharts [cite: 61]

interface LatencyChartProps {
  nodes: Node[];
}

// Colores consistentes para las líneas del gráfico
const NODE_COLORS: { [key: string]: string } = {
  'node-1': '#3b82f6', // Blue
  'node-2': '#10b981', // Green
  'node-3': '#f59e0b', // Amber
  'node-4': '#ef4444', // Red
  'node-5': '#8b5cf6', // Violet
};

export default function LatencyChart({ nodes }: LatencyChartProps) {
  // Combinar el historial de latencia de todos los nodos en un solo array para Recharts
  const data = nodes.reduce((acc, node) => {
    // Si el historial está vacío, no se hace nada
    if (node.latencyHistory.length === 0) return acc;

    node.latencyHistory.forEach(historyPoint => {
      // Buscar el punto de tiempo en el array combinado
      let existingPoint = acc.find(p => p.timestamp === historyPoint.timestamp);

      if (!existingPoint) {
        // Crear un nuevo punto si no existe
        existingPoint = { timestamp: historyPoint.timestamp };
        acc.push(existingPoint);
      }
      // Añadir la latencia del nodo actual al punto de tiempo
      existingPoint[node.id] = historyPoint.value;
    });

    return acc;
  }, [] as any[])
  .sort((a, b) => a.timestamp - b.timestamp) // Asegurar el orden cronológico [cite: 45]
  .slice(-20); // Mostrar solo los últimos 20 puntos de datos [cite: 64]

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(value) => new Date(value).toLocaleTimeString('es-AR')} // Tiempo en eje X [cite: 64]
            label={{ value: 'Tiempo', position: 'insideBottom', offset: 0 }}
          />
          <YAxis 
            label={{ value: 'Latencia (ms)', angle: -90, position: 'insideLeft' }} // Latencia en eje Y [cite: 63]
          />
          <Tooltip 
             labelFormatter={(value) => new Date(value).toLocaleTimeString('es-AR')}
             formatter={(value, name) => [`${value}ms`, nodes.find(n => n.id === name)?.name || name]}
          />
          <Legend />
          {nodes.map((node) => (
            // Línea diferente por cada nodo con código de colores [cite: 64]
            <Line 
              key={node.id}
              type="monotone" 
              dataKey={node.id} 
              stroke={NODE_COLORS[node.id] || '#8884d8'} 
              dot={false}
              name={node.name}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}