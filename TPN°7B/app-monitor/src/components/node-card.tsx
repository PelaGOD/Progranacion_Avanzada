import { NetworkNode, NodeStatus } from "@/lib/types"; // Debe ser .ts (si no da error)
import { ArrowUp, ArrowDown, Wifi, Clock, ServerOff } from "lucide-react"; // Esto falla si no instalaste
// ...

interface NodeCardProps {
  node: NetworkNode;
}

/**
 * Función helper para mapear el estado a clases de color de Tailwind.
 */
const getStatusColor = (status: NodeStatus) => {
  switch (status) {
    case 'online':
      return 'border-green-500 bg-green-50'; // Verde
    case 'degraded':
      return 'border-yellow-500 bg-yellow-50'; // Amarillo
    case 'offline':
      return 'border-red-500 bg-red-50'; // Rojo
    default:
      return 'border-gray-500 bg-gray-50';
  }
};

export const NodeCard: React.FC<NodeCardProps> = ({ node }) => {
  const colorClasses = getStatusColor(node.status);
  
  // Lógica de tendencia simulada (simple)
  const isLatencyImproving = node.latencyMs < 100;
  const TrendIcon = isLatencyImproving ? ArrowDown : ArrowUp; // Latencia baja es mejor (flecha abajo)

  return (
    <div className={`p-4 border-l-4 rounded-lg shadow-md ${colorClasses} transition-all duration-300`}>
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-800">{node.name}</h3>
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${node.status === 'online' ? 'bg-green-200 text-green-800' : node.status === 'degraded' ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'}`}>
          {node.status.toUpperCase()}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" /> Latencia:
          </span>
          <span className="font-bold text-gray-900">
            {node.latencyMs}ms 
            <TrendIcon className={`w-4 h-4 inline ml-1 ${isLatencyImproving ? 'text-green-600' : 'text-red-600'}`} />
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Wifi className="w-4 h-4" /> Conexiones Activas:
          </span>
          <span className="font-bold text-gray-900">
            {node.connections.toLocaleString()}
          </span>
        </div>

        {node.status === 'offline' && (
             <div className="flex items-center gap-1 text-red-600 pt-2 border-t border-red-200">
                 <ServerOff className="w-4 h-4" /> Sin comunicación
             </div>
        )}
      </div>
    </div>
  );
};