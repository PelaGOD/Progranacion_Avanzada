import { NetworkNode, EventPayload, EventType, NodeStatus, AlarmLevel, AlarmData, SubscriberCallback } from './types';

// --- Estado Inicial de los Nodos (5 nodos de red) ---
const NODES_DATA: NetworkNode[] = [
    { id: 'node-1', name: 'Node-US-East', status: 'online', connections: 1147, latencyMs: 53, lastUpdate: Date.now() },
    { id: 'node-2', name: 'Node-EU-West', status: 'online', connections: 718, latencyMs: 79, lastUpdate: Date.now() },
    { id: 'node-3', name: 'Node-Asia-Pacific', status: 'online', connections: 271, latencyMs: 77, lastUpdate: Date.now() },
    { id: 'node-4', name: 'Node-SA-Brazil', status: 'online', connections: 90, latencyMs: 53, lastUpdate: Date.now() },
    { id: 'node-5', name: 'Node-AU-Sydney', status: 'online', connections: 21, latencyMs: 41, lastUpdate: Date.now() },
];

const nodesMap = new Map<string, NetworkNode>(NODES_DATA.map(node => [node.id, node]));
const subscribers: SubscriberCallback[] = [];


// --- Generación de Eventos ---

/**
 * Simula la publicación de un evento y notifica a todos los suscriptores.
 */
function publishEvent(node: NetworkNode, type: EventType, data: any): void {
    const event: EventPayload = {
        nodeId: node.id,
        type: type,
        timestamp: Date.now(),
        data: data,
    };
    
    // Notificar a todos los suscriptores (simulación de 'Push' a Gateway WS)
    subscribers.forEach(callback => callback(event));
}

// --- Lógica de Simulación Dinámica ---

function simulateLatency(node: NetworkNode): void {
    const minLat = 50;
    const maxLat = 500; // Latencia varía entre 50ms - 500ms
    
    // Variación aleatoria
    let newLatency = node.latencyMs + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 20);
    newLatency = Math.min(Math.max(newLatency, minLat), maxLat);

    if (node.status === 'degraded') {
        newLatency += Math.floor(Math.random() * 30); 
    } else if (node.status === 'offline') {
        newLatency = maxLat;
    }

    node.latencyMs = Math.floor(newLatency);

    publishEvent(node, 'LATENCY_UPDATE', { newLatency: node.latencyMs });
    
    // ALARMA por latencia alta (> 300ms)
    if (node.latencyMs > 300 && node.status !== 'offline') {
        const alarm: AlarmData = { level: 'warning', message: `Latencia alta detectada (${node.latencyMs}ms)` };
        publishEvent(node, 'ALARM', alarm);
    }
}

function simulateStatusChange(node: NetworkNode): void {
    // 5% de probabilidad de cambiar de estado cada ciclo
    if (Math.random() < 0.05) {
        let newStatus: NodeStatus = node.status;
        
        switch (node.status) {
            case 'online':
                newStatus = Math.random() < 0.6 ? 'degraded' : 'offline';
                break;
            case 'degraded':
                newStatus = Math.random() < 0.7 ? 'online' : 'offline';
                break;
            case 'offline':
                newStatus = 'online'; 
                break;
        }
        
        if (newStatus !== node.status) {
            node.status = newStatus;
            
            publishEvent(node, 'NODE_STATUS_CHANGE', { newStatus: node.status });
            
            // ALARMA Crítica por nodo caído
            if (node.status === 'offline') {
                const alarm: AlarmData = { level: 'critical', message: 'Nodo caído. Pérdida total de servicio.' };
                publishEvent(node, 'ALARM', alarm);
            }
        }
    }
}

function simulateConnections(node: NetworkNode): void {
    if (node.status === 'online' || node.status === 'degraded') {
        // Fluctuación en número de conexiones
        const fluctuation = Math.floor(Math.random() * 50) * (Math.random() > 0.5 ? 1 : -1);
        let newConnections = node.connections + fluctuation;
        
        newConnections = Math.max(newConnections, 0); 
        node.connections = newConnections;

        publishEvent(node, 'CONNECTION_CHANGE', { newConnections: node.connections });
        
        // ALARMA por conexiones bajas (< 50)
        if (node.connections < 50 && node.status !== 'offline') {
             const alarm: AlarmData = { level: 'info', message: `Conexiones por debajo del umbral mínimo (${node.connections}).` };
            publishEvent(node, 'ALARM', alarm);
        }
    } else {
        node.connections = 0;
    }
}


function runSimulationCycle(): void {
    nodesMap.forEach(node => {
        simulateStatusChange(node);
        simulateLatency(node);
        simulateConnections(node);
        node.lastUpdate = Date.now();
    });
}

// --- Interfaz Pública (Exportaciones) ---

/**
 * Inicia la simulación periódica de nodos.
 * @param intervalMs Intervalo en milisegundos (1000 - 3000ms)
 */
export function startSimulation(intervalMs: number = 2000): void {
    if (typeof window !== 'undefined') {
        // En una aplicación real, esto se ejecutaría en un backend que publica a Kafka.
        // Aquí lo ejecutamos en el lado del cliente (en un useEffect de React) como un simuador.
        console.log(`[SIMULATOR] Iniciando simulación de eventos cada ${intervalMs}ms.`);
        setInterval(runSimulationCycle, intervalMs);
    }
}

/**
 * Permite que un componente se suscriba a nuevos eventos.
 */
export function subscribeToEvents(callback: SubscriberCallback): () => void {
    subscribers.push(callback);
    
    // Función para desuscribir (cleanup)
    return () => {
        const index = subscribers.indexOf(callback);
        if (index > -1) {
            subscribers.splice(index, 1);
        }
    };
}

/**
 * Retorna el estado inicial de todos los nodos.
 */
export function getInitialNodes(): NetworkNode[] {
    return Array.from(nodesMap.values());
}