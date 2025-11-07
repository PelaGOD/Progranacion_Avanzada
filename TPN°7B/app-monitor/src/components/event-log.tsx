'use client';

import { useNetworkState } from "@/lib/stats-overview";
import { EventPayload, AlarmLevel } from "@/lib/types";
import { AlertTriangle, Clock, ServerCrash, Zap } from "lucide-react";

/**
 * Helper para obtener clases de color basadas en el tipo de evento o alarma.
 */
const getEventClasses = (event: EventPayload) => {
    switch (event.type) {
        case 'ALARM':
            const level: AlarmLevel = event.data.level;
            if (level === 'critical') return { icon: <ServerCrash className="w-4 h-4 text-red-500" />, border: 'border-red-500 bg-red-50' }; // Crítico
            if (level === 'warning') return { icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />, border: 'border-yellow-500 bg-yellow-50' }; // Advertencia
            if (level === 'info') return { icon: <Clock className="w-4 h-4 text-blue-500" />, border: 'border-blue-500 bg-blue-50' }; // Info
            break;
        case 'NODE_STATUS_CHANGE':
             return { icon: <ServerCrash className="w-4 h-4 text-gray-500" />, border: 'border-gray-300' };
        default:
            return { icon: <Zap className="w-4 h-4 text-gray-500" />, border: 'border-gray-300' };
    }
};

/**
 * Componente para mostrar un solo ítem del log.
 */
const EventItem: React.FC<{ event: EventPayload }> = ({ event }) => {
    const { icon, border } = getEventClasses(event);
    const time = new Date(event.timestamp).toLocaleTimeString(); // Timestamp del evento

    let description = `${event.type} en ${event.nodeId}`;
    if (event.type === 'ALARM') {
        description = `[${event.data.level.toUpperCase()}] ${event.data.message}`; // Descripción del evento
    } else if (event.type === 'NODE_STATUS_CHANGE') {
        description = `El nodo ${event.nodeId} cambió a estado: ${event.data.newStatus.toUpperCase()}`;
    }

    return (
        <li className={`p-3 border-l-4 rounded-md text-sm mb-2 ${border}`}>
            <div className="flex justify-between items-center text-gray-700">
                <span className="flex items-center gap-2 font-medium">
                    {icon}
                    {description}
                </span>
                <span className="text-xs text-gray-500">{time}</span>
            </div>
            {event.type === 'ALARM' && (
                <div className="mt-1 text-xs text-gray-600">
                    Nodo afectado: {event.nodeId}
                </div>
            )}
        </li>
    );
};

/**
 * Componente principal del Log de Eventos.
 */
export const EventLog: React.FC = () => {
    const { eventLog } = useNetworkState();

    return (
        <div className="bg-white p-4 rounded-xl shadow-lg h-[400px] overflow-y-scroll">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Event Stream (Kafka Simulator)</h2>
            <ul className="list-none p-0">
                {eventLog.length === 0 ? (
                    <p className="text-gray-500 italic">Esperando eventos...</p>
                ) : (
                    eventLog.map((event, index) => (
                        <EventItem key={index} event={event} />
                    ))
                )}
            </ul>
        </div>
    );
};