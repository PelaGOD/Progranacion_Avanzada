'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { NetworkNode, EventPayload, AlarmLevel, AlarmData } from './types';
import { startSimulation, subscribeToEvents, getInitialNodes } from './kafka-simulator';

// --- Tipos de Estado Global ---

interface NetworkState {
  nodes: Record<string, NetworkNode>;
  eventLog: EventPayload[];
  stats: {
    onlineNodes: number;
    avgLatency: number;
    totalConnections: number;
    criticalAlarms: number;
  };
}

const initialNodes = getInitialNodes();

const initialNetworkState: NetworkState = {
  nodes: initialNodes.reduce((acc, node) => ({ ...acc, [node.id]: node }), {}),
  eventLog: [], // Historial de los últimos 50 eventos
  stats: {
    onlineNodes: initialNodes.filter(n => n.status === 'online').length,
    avgLatency: initialNodes.reduce((sum, n) => sum + n.latencyMs, 0) / initialNodes.length,
    totalConnections: initialNodes.reduce((sum, n) => sum + n.connections, 0),
    criticalAlarms: 0,
  },
};

// --- Contexto ---

const NetworkContext = createContext<{ state: NetworkState; } | undefined>(undefined);

// --- Proveedor de Estado ---

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState(initialNetworkState);

  // Lógica de actualización de estado
  const processEvent = (event: EventPayload) => {
    setState(prevState => {
      const newNode = { ...prevState.nodes[event.nodeId] };
      const newNodes = { ...prevState.nodes };
      let newCriticalAlarms = prevState.stats.criticalAlarms;

      // 1. Actualizar el nodo afectado según el tipo de evento
      switch (event.type) {
        case 'NODE_STATUS_CHANGE':
          newNode.status = event.data.newStatus;
          break;
        case 'LATENCY_UPDATE':
          newNode.latencyMs = event.data.newLatency;
          break;
        case 'CONNECTION_CHANGE':
          newNode.connections = event.data.newConnections;
          break;
        case 'ALARM':
           // Actualizar el contador de alarmas críticas
           if (event.data.level === 'critical') {
               newCriticalAlarms += 1;
           }
           if (event.data.level === 'warning') {
               // Aquí podrías añadir lógica para bajar las alarmas críticas si se resuelven,
               // pero por ahora solo contamos las que llegan.
           }
           break;
      }
      newNode.lastUpdate = event.timestamp;
      newNodes[event.nodeId] = newNode;


      // 2. Actualizar el Log de Eventos (limitado a 50)
      const newEventLog = [event, ...prevState.eventLog].slice(0, 50);

      // 3. Recalcular las Estadísticas Globales
      const nodesArray = Object.values(newNodes);
      const newStats = {
        onlineNodes: nodesArray.filter(n => n.status === 'online').length,
        avgLatency: nodesArray.reduce((sum, n) => sum + n.latencyMs, 0) / nodesArray.length,
        totalConnections: nodesArray.reduce((sum, n) => sum + n.connections, 0),
        criticalAlarms: newCriticalAlarms,
      };

      return {
        nodes: newNodes,
        eventLog: newEventLog,
        stats: newStats,
      };
    });
  };

  // --- Efecto de Suscripción y Simulación ---
  useEffect(() => {
    // 1. Iniciar la simulación de eventos
    startSimulation(2000); 

    // 2. Suscribirse al stream de eventos (simulando consumir de Kafka/Gateway WS)
    const unsubscribe = subscribeToEvents(processEvent);

    return () => {
      // Limpieza al desmontar
      unsubscribe();
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ state }}>
      {children}
    </NetworkContext.Provider>
  );
};

// --- Hook para usar el estado ---
export const useNetworkState = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetworkState must be used within a NetworkProvider');
  }
  return context.state;
};