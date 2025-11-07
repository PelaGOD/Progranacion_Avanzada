import { useState, useEffect } from 'react';
import Head from 'next/head';
import { io } from 'socket.io-client';
import NewTransaction from '../components/NewTransaction';
import TransactionTimeline from '../components/TransactionTimeline';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080';
let socket;

export default function Home() {
  const [events, setEvents] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentTxnId, setCurrentTxnId] = useState(null);

  // 1. Conectar al WebSocket Gateway
  useEffect(() => {
    socket = io(WS_URL);

    socket.on('connect', () => {
      console.log('Connected to WebSocket Gateway');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket Gateway');
      setIsConnected(false);
    });

    // 2. Escuchar nuevos eventos
    socket.on('event', (event) => {
      console.log('Event received:', event);
      // Solo mostrar eventos de la transacción actual
      if (event.transactionId === currentTxnId) {
        setEvents((prevEvents) => [event, ...prevEvents]);
      }
    });

    // Limpieza al desmontar el componente
    return () => {
      socket.disconnect();
    };
  }, [currentTxnId]); // Se re-ejecuta si cambia el currentTxnId (para la lógica del filtro)

  // 3. Manejar el envío de la transacción
  const handleInitiateTransaction = async (formData) => {
    setIsSubmitting(true);
    setEvents([]); // Limpiar timeline para la nueva transacción

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.status === 202) {
        const { transactionId, userId } = data;
        
        // 4. Suscribirse a los eventos de esta transacción 
        socket.emit('subscribe', data.transactionId);
        setCurrentTxnId(data.transactionId); // Establecer la TXN activa
        
        // Añadir evento "visual" de inicio
        setEvents([{
          id: 'local-init',
          type: 'txn.Initiated (Client)',
          ts: Date.now(),
          transactionId: data.transactionId,
          payload: formData
        }]);

      } else {
        console.error('Error:', data.message);
      }
    } catch (error) {
      console.error('Failed to initiate transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={containerStyle}>
      <Head>
        <title>Sistema de eventos bancarios</title>
      </Head>

      <header style={headerStyle}>
        <h1>Sistema de eventos bancarios</h1>
        <span style={statusStyle(isConnected)}>
          {isConnected ? 'Conectado' : 'Desconectado'}
        </span>
      </header>

      <main style={mainStyle}>
        <div style={panelStyle}>
          <NewTransaction 
            onSubmit={handleInitiateTransaction} 
            isSubmitting={isSubmitting} 
          />
        </div>
        <div style={panelStyle}>
          <TransactionTimeline events={events} />
        </div>
      </main>
    </div>
  );
}

// Estilos
const containerStyle = { padding: '0 2rem' };
const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #333',
};
const statusStyle = (isConnected) => ({
  padding: '5px 10px',
  borderRadius: '6px',
  backgroundColor: isConnected ? '#4caf50' : '#f44336',
  color: 'white',
  fontWeight: 600
});
const mainStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
  gap: '30px',
  padding: '2rem 0',
};
const panelStyle = {
  backgroundColor: '#1e1e1e',
  padding: '25px',
  borderRadius: '8px',
  border: '1px solid #333',
};