// --- 1. Estado y Tipos del Nodo ---

export type NodeStatus = 'online' | 'offline' | 'degraded'; //

export interface NetworkNode {
  id: string; // ID único del nodo
  name: string; // Nombre descriptivo
  status: NodeStatus; // Estado actual
  connections: number; // Métricas de conexión activas
  latencyMs: number; // Latencia actual en milisegundos
  lastUpdate: number; // Timestamp de última actualización
}


// --- 2. Tipos de Eventos y Alarmas ---

export type EventType = 
  | 'NODE_STATUS_CHANGE' //
  | 'LATENCY_UPDATE' //
  | 'CONNECTION_CHANGE' //
  | 'ALARM'; //

export type AlarmLevel = 'critical' | 'warning' | 'info'; //

export interface AlarmData {
    level: AlarmLevel;
    message: string;
}

// Contrato general del evento (lo que se "publica" en Kafka)
export interface EventPayload {
  nodeId: string; // ID del nodo afectado
  type: EventType; // Tipo de evento
  timestamp: number;
  data: any; // Datos específicos del evento
}

export type SubscriberCallback = (event: EventPayload) => void;