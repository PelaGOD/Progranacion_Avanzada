import { Event, AlarmSeverity } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Zap, Shield, Info, Radio } from 'lucide-react';

interface EventLogProps {
  log: Event[];
}

// Mapeo de severidad/tipo de evento a iconos y colores [cite: 75, 78]
const getEventVisuals = (event: Event) => {
  const isAlarm = event.type === 'ALARM';
  let Icon = Radio;
  let color = 'text-gray-500';

  if (isAlarm) {
    switch (event.severity) {
      case 'CRITICAL':
        Icon = AlertCircle;
        color = 'text-red-600';
        break;
      case 'WARNING':
        Icon = AlertCircle;
        color = 'text-yellow-600';
        break;
      case 'INFO':
        Icon = Info;
        color = 'text-blue-600';
        break;
      default:
        Icon = Zap;
        color = 'text-orange-600';
    }
  } else {
    // Para otros tipos de eventos (status, latency, connection)
    Icon = Shield;
  }
  
  return { Icon, color };
};

const getBadgeColor = (severity: AlarmSeverity | undefined) => {
    switch(severity) {
        case 'CRITICAL': return 'bg-red-600';
        case 'WARNING': return 'bg-yellow-600';
        case 'INFO': return 'bg-blue-600';
        default: return 'bg-gray-400';
    }
}

export default function EventLog({ log }: EventLogProps) {
  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {log.map((event, index) => {
          const { Icon, color } = getEventVisuals(event);
          const timeString = new Date(event.timestamp).toLocaleTimeString('es-AR'); // Timestamp del evento [cite: 74]

          return (
            <div key={index} className="border-b pb-4 last:border-b-0 flex space-x-3">
              <Icon className={`w-5 h-5 flex-shrink-0 ${color}`} /> {/* Tipo de evento con icono distintivo [cite: 75] */}
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">
                    {event.nodeId} <span className="text-xs text-muted-foreground ml-2">({event.type})</span>
                  </p>
                  {event.severity && (
                     <span className={`px-2 py-0.5 text-xs font-semibold text-white rounded-full ${getBadgeColor(event.severity)}`}>
                        {event.severity} {/* Nivel de severidad con código de colores [cite: 78] */}
                     </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mt-1">{event.description}</p> {/* Descripción del evento [cite: 77] */}
                <p className="text-xs text-muted-foreground mt-1">{timeString}</p>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}