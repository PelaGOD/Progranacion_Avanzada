import { Node, NodeStatus, Event, EventType, AlarmSeverity } from './types';

// Almacena el estado actual de los nodos
let nodesState: Node[] = [
  { id: 'node-1', name: 'Node-US-East', status: 'online', activeConnections: 80, latencyMs: 60, lastUpdate: Date.now(), latencyHistory: [] },
  { id: 'node-2', name: 'Node-EU-West', status: 'online', activeConnections: 120, latencyMs: 45, lastUpdate: Date.now(), latencyHistory: [] },
  { id: 'node-3', name: 'Node-Asia-Pacific', status: 'degraded', activeConnections: 55, latencyMs: 250, lastUpdate: Date.now(), latencyHistory: [] },
  { id: 'node-4', name: 'Node-SA-Brazil', status: 'online', activeConnections: 90, latencyMs: 70, lastUpdate: Date.now(), latencyHistory: [] },
  { id: 'node-5', name: 'Node-AU-Sydney', status: 'online', activeConnections: 100, latencyMs: 30, lastUpdate: Date.now(), latencyHistory: [] },
];

// Arreglo de suscriptores (Callbacks) [cite: 44]
const subscribers: ((event: Event) => void)[] = [];

// Función de publicación (Simulador de Kafka)
const publish = (event: Event) => {
  // Asegura el orden cronológico al notificar a los suscriptores [cite: 45]
  subscribers.forEach(callback => callback(event));
};

// Función de suscripción [cite: 36]
export const subscribe = (callback: (event: Event) => void) => {
  subscribers.push(callback);
  // Retorna una función para desuscribirse
  return () => {
    const index = subscribers.indexOf(callback);
    if (index > -1) {
      subscribers.splice(index, 1);
    }
  };
};

// Lógica de simulación para un solo nodo [cite: 20]
const updateNode = (node: Node): Node => {
  const newTimestamp = Date.now();
  const newNode = { ...node, lastUpdate: newTimestamp };

  // 1. Simulación de Cambio de Estado (10% de probabilidad) [cite: 21, 25, 27]
  if (Math.random() < 0.1) {
    const nextStatuses: NodeStatus[] = ['online', 'degraded', 'offline'];
    let newStatus = nextStatuses[Math.floor(Math.random() * nextStatuses.length)];
    
    if (newNode.status !== newStatus) {
      newNode.status = newStatus;
      publish({
        type: 'NODE_STATUS_CHANGE',
        timestamp: newTimestamp,
        nodeId: newNode.id,
        description: `Estado cambiado a ${newStatus.toUpperCase()}`,
        data: { status: newStatus }
      });
    }
  }

  // 2. Variación de Latencia (50ms - 500ms) [cite: 22, 26]
  const newLatency = Math.round(Math.random() * (500 - 50) + 50);
  newNode.latencyMs = newLatency;
  newNode.latencyHistory = [...newNode.latencyHistory.slice(-19), { timestamp: newTimestamp, value: newLatency }]; // Máx 20 puntos [cite: 64]

  publish({
    type: 'LATENCY_UPDATE',
    timestamp: newTimestamp,
    nodeId: newNode.id,
    description: `Latencia actualizada a ${newLatency}ms`,
    data: { latencyMs: newLatency }
  });

  // 3. Fluctuación de Conexiones [cite: 23, 26]
  const newConnections = Math.round(newNode.activeConnections + (Math.random() * 20 - 10));
  newNode.activeConnections = Math.max(0, newConnections); // Asegurar que no sea negativo

  publish({
    type: 'CONNECTION_CHANGE',
    timestamp: newTimestamp,
    nodeId: newNode.id,
    description: `Conexiones actualizadas a ${newNode.activeConnections}`,
    data: { connections: newNode.activeConnections }
  });
  
  // 4. Generación de Alarmas [cite: 67, 69]
  checkAlarms(newNode, newTimestamp);

  return newNode;
};

// Lógica de Alarmas [cite: 69]
const checkAlarms = (node: Node, timestamp: number) => {
  let severity: AlarmSeverity | null = null;
  let description: string = '';

  if (node.status === 'offline') { // Nodo caído Crítico [cite: 71]
    severity = 'CRITICAL';
    description = `Nodo ${node.name} caído. Servicio interrumpido.`;
  } else if (node.latencyMs > 300) { // Latencia alta (> 300ms) → Advertencia [cite: 70]
    severity = 'WARNING';
    description = `Latencia alta detectada: ${node.latencyMs}ms.`;
  } else if (node.activeConnections < 50) { // Conexiones bajas (< 50) → Info [cite: 72]
    severity = 'INFO';
    description = `Conexiones bajas: ${node.activeConnections}. Revisar capacidad.`;
  }

  if (severity) {
    publish({
      type: 'ALARM', // [cite: 35]
      timestamp,
      nodeId: node.id,
      description: description,
      data: { severity, status: node.status, latency: node.latencyMs, connections: node.activeConnections },
      severity: severity
    });
  }
};


// Bucle principal de simulación (Eventos generados cada 1-3 segundos) [cite: 43]
let simulationInterval: NodeJS.Timeout | null = null;

export const startSimulation = () => {
  if (simulationInterval) return; // Evitar duplicados

  simulationInterval = setInterval(() => {
    nodesState = nodesState.map(updateNode); // Actualiza los 5 nodos
  }, Math.random() * (3000 - 1000) + 1000); // 1-3 segundos
};

export const stopSimulation = () => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
};

export const getInitialNodes = () => nodesState;