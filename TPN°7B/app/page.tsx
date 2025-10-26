'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Node, Event } from '@/lib/types';
import { startSimulation, stopSimulation, subscribe, getInitialNodes } from '@/lib/kafka-simulator';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import NodeCard from '@/components/node-card';
import EventLog from '@/components/event-log';
import LatencyChart from '@/components/latency-chart';
import { Table, TableCaption, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

// Límite del historial de eventos [cite: 79]
const MAX_EVENT_HISTORY = 50; 

export default function DashboardPage() {
  const [nodes, setNodes] = useState<Node[]>(getInitialNodes());
  const [eventLog, setEventLog] = useState<Event[]>([]);

  // Función para procesar un evento y actualizar el estado de los nodos [cite: 48]
  const handleEvent = useCallback((event: Event) => {
    // 1. Actualizar el Log de Eventos [cite: 73]
    setEventLog(prevLog => {
      const newLog = [event, ...prevLog];
      return newLog.slice(0, MAX_EVENT_HISTORY); // Mantener últimos 50 eventos [cite: 79]
    });

    // 2. Actualizar el estado del nodo si el evento lo requiere
    if (event.type !== 'ALARM') {
      setNodes(prevNodes => prevNodes.map(node => {
        if (node.id === event.nodeId) {
          const newNode = { ...node, lastUpdate: event.timestamp };
          
          if (event.type === 'NODE_STATUS_CHANGE') {
            newNode.status = event.data.status;
          } else if (event.type === 'LATENCY_UPDATE') {
            newNode.latencyMs = event.data.latencyMs;
            newNode.latencyHistory = event.data.latencyHistory || newNode.latencyHistory;
          } else if (event.type === 'CONNECTION_CHANGE') {
            newNode.activeConnections = event.data.connections;
          }
          return newNode;
        }
        return node;
      }));
    }
  }, []);

  // Efecto para iniciar y limpiar la simulación/suscripción
  useEffect(() => {
    // Suscribirse a los eventos del simulador
    const unsubscribe = subscribe(handleEvent);
    
    // Iniciar la simulación [cite: 43]
    startSimulation();

    // Limpieza al desmontar el componente
    return () => {
      stopSimulation();
      unsubscribe();
    };
  }, [handleEvent]);


  // Estadísticas Generales [cite: 53]
  const stats = useMemo(() => {
    const totalActive = nodes.filter(n => n.status === 'online').length; // Total de nodos activos [cite: 54]
    const totalConnections = nodes.reduce((sum, n) => sum + n.activeConnections, 0); // Total de conexiones [cite: 56]
    const totalLatency = nodes.reduce((sum, n) => sum + n.latencyMs, 0);
    const avgLatency = nodes.length > 0 ? Math.round(totalLatency / nodes.length) : 0; // Promedio de latencia [cite: 55]
    const activeAlarms = eventLog.filter(e => e.type === 'ALARM' && e.severity === 'CRITICAL').length; // Número de alarmas activas [cite: 57]

    return { totalActive, totalConnections, avgLatency, activeAlarms };
  }, [nodes, eventLog]);

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold">Network Operations Center 🌐</h1>
      <p className="text-gray-500">Real-time monitoring with Kafka event streaming simulator.</p>

      {/* Panel de Estadísticas Generales [cite: 53] */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nodos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActive} / {nodes.length}</div>
            <p className="text-xs text-muted-foreground">Online Nodes [cite: 108]</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Latencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgLatency}ms</div>
            <p className="text-xs text-muted-foreground">Average Network Latency [cite: 114]</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conexiones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConnections}</div>
            <p className="text-xs text-muted-foreground">Total Active Connections [cite: 56, 113]</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alarmas Críticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.activeAlarms}</div>
            <p className="text-xs text-muted-foreground">Critical Alarms Active [cite: 57, 115]</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráficos de Latencia [cite: 58] */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Network Latency Monitor</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Se pasa el estado completo de los nodos, ya que cada uno contiene su historial [cite: 64] */}
              <LatencyChart nodes={nodes} /> 
            </CardContent>
          </Card>
        </div>

        {/* Log de Eventos y Alarmas [cite: 66] */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Event Stream (Kafka)</CardTitle>
              <p className="text-sm text-muted-foreground">Real-time network events and alarms [cite: 147]</p>
            </CardHeader>
            <CardContent>
              <EventLog log={eventLog} />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Tarjetas de Estado de Nodo [cite: 49] */}
      <h2 className="text-2xl font-semibold pt-4">Network Nodes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {nodes.map(node => (
          <NodeCard key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}