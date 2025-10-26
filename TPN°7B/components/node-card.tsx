import { Node, NodeStatus } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, CheckCircle, AlertTriangle, XCircle, Zap } from 'lucide-react';

interface NodeCardProps {
  node: Node;
}

// Función para mapear el estado a colores y texto [cite: 50]
const getStatusInfo = (status: NodeStatus) => {
  switch (status) {
    case 'online':
      return { color: 'bg-green-500 hover:bg-green-600', text: 'Online', icon: CheckCircle };
    case 'degraded':
      return { color: 'bg-yellow-500 hover:bg-yellow-600', text: 'Degraded', icon: AlertTriangle };
    case 'offline':
      return { color: 'bg-red-500 hover:bg-red-600', text: 'Offline', icon: XCircle };
    default:
      return { color: 'bg-gray-500 hover:bg-gray-600', text: 'Unknown', icon: Zap };
  }
};

// Lógica de Tendencia: compara la latencia actual con la media de las últimas 5 [cite: 52]
const getTrendInfo = (history: { value: number }[], currentLatency: number) => {
  if (history.length < 5) return { text: 'Estable', icon: null, color: 'text-gray-500' };

  const recentValues = history.slice(-5);
  const averageRecent = recentValues.reduce((sum, item) => sum + item.value, 0) / recentValues.length;

  if (currentLatency > averageRecent * 1.2) {
    return { text: 'Empeorando', icon: ArrowUp, color: 'text-red-500' };
  } else if (currentLatency < averageRecent * 0.8) {
    return { text: 'Mejorando', icon: ArrowDown, color: 'text-green-500' };
  } else {
    return { text: 'Estable', icon: null, color: 'text-gray-500' };
  }
};


export default function NodeCard({ node }: NodeCardProps) {
  const { color, text, icon: StatusIcon } = getStatusInfo(node.status);
  const trend = getTrendInfo(node.latencyHistory, node.latencyMs);

  return (
    <Card className={`overflow-hidden border-t-4 ${node.status === 'online' ? 'border-green-500' : node.status === 'degraded' ? 'border-yellow-500' : 'border-red-500'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{node.name}</CardTitle>
          <Badge className={`px-2 py-0.5 ${color} text-white`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {text}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{node.id}</p>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Latencia:</span>
          <span className="text-md font-bold text-gray-800">{node.latencyMs}ms</span> {/* Latencia actual [cite: 50] */}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Conexiones:</span>
          <span className="text-md font-bold text-gray-800">{node.activeConnections}</span> {/* Conexiones activas [cite: 51] */}
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm text-muted-foreground">Tendencia:</span>
          <div className={`flex items-center text-sm font-medium ${trend.color}`}>
            {trend.icon && <trend.icon className="w-4 h-4 mr-1" />}
            {trend.text} {/* Indicador de tendencia [cite: 52] */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}