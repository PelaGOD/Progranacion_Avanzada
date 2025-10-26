// --- 1. Tipos de Nodos ---
export type NodeStatus = 'online' | 'offline' | 'degraded'; // [cite: 16]

export interface Node {
  id: string; // ID único del nodo [cite: 14]
  name: string; // Nombre descriptivo [cite: 15]
  status: NodeStatus; // Estado actual [cite: 16]
  activeConnections: number; // Métricas de conexión activas [cite: 17]
  latencyMs: number; // Latencia actual en milisegundos [cite: 18]
  lastUpdate: number; // Timestamp de última actualización [cite: 19]
  // Historial de latencia para el gráfico
  latencyHistory: { timestamp: number; value: number }[];
}

// --- 2. Tipos de Eventos ---
export type EventType =
  | 'NODE_STATUS_CHANGE' // Cambio de estado de un nodo [cite: 32]
  | 'LATENCY_UPDATE' // Actualización de latencia [cite: 33]
  | 'CONNECTION_CHANGE' // Cambio en número de conexiones [cite: 34]
  | 'ALARM'; // Generación de alarmas [cite: 35]

export type AlarmSeverity = 'INFO' | 'WARNING' | 'CRITICAL'; // [cite: 78]

export interface Event {
  type: EventType; // Tipo de evento [cite: 37]
  timestamp: number; // Timestamp [cite: 38]
  nodeId: string; // ID del nodo afectado [cite: 39]
  description: string; // Descripción del evento [cite: 77]
  data: any; // Datos específicos del evento [cite: 40]
  severity?: AlarmSeverity; // Nivel de severidad para ALARM [cite: 78]
}