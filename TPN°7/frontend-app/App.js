import React, { useState, useEffect } from 'react';
import './App.css'; // Asume que tienes algo de CSS

function App() {
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);
  const [currentTxnId, setCurrentTxnId] = useState(null);

  // Efecto para conectar al WebSocket (Gateway) 
  useEffect(() => {
    // Reemplaza con tu NEXT_PUBLIC_WS_URL [cite: 105]
    const ws = new WebSocket('ws://localhost:8081'); 

    ws.onopen = () => {
      console.log('Conectado al Gateway WebSocket');
      setConnected(true);
    };

    ws.onmessage = (message) => {
      const event = JSON.parse(message.data);
      console.log('Evento recibido:', event);
      setEvents(prevEvents => [...prevEvents, event]);
    };

    ws.onclose = () => {
      console.log('Desconectado del Gateway');
      setConnected(false);
    };

    ws.onerror = (err) => {
      console.error('Error de WebSocket:', err);
      setConnected(false);
    };

    // Limpieza al desmontar
    return () => {
      ws.close();
    };
  }, []);

  // Función para enviar la transacción a la API 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEvents([]); // Limpia eventos anteriores
    setCurrentTxnId(null);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      // Llama a la API (el mesero) 
      const response = await fetch('http://localhost:3001/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if(response.ok) {
        setCurrentTxnId(result.transactionId);
      } else {
        alert(`Error al iniciar: ${result.message}`);
      }

    } catch (error) {
      console.error('Error al enviar transacción:', error);
      alert('No se pudo conectar a la API');
    }
  };

  // Filtra eventos solo de la transacción actual
  const filteredEvents = currentTxnId 
    ? events.filter(e => e.transactionId === currentTxnId)
    : [];

  return (
    <div className="App">
      <header>
        <h1>Banking Events System [cite: 78]</h1>
        <p>Real-time transaction processing with Kafka [cite: 79]</p>
        <div className={`status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? 'Conectado' : 'Desconectado'} [cite: 80]
        </div>
      </header>

      <main>
        {/* Formulario de Nueva Transacción [cite: 81] */}
        <section className="transaction-form">
          <h2>New Transaction [cite: 81]</h2>
          <form onSubmit={handleSubmit}>
            <label>User ID</label>
            <input name="userId" defaultValue="user-123" /> [cite: 83]
            <label>From Account</label>
            <input name="fromAccount" defaultValue="ACC-001" /> [cite: 90]
            <label>To Account</label>
            <input name="toAccount" defaultValue="ACC-002" /> [cite: 86]
            <label>Amount</label>
            <input name="amount" defaultValue="100.00" type="number" step="0.01" /> [cite: 92]
            <label>Currency</label>
            <input name="currency" defaultValue="USD" /> [cite: 85]
            <button type="submit">Initiate Transaction [cite: 95]</button>
          </form>
        </section>

        {/* Timeline de la Transacción  */}
        <section className="transaction-timeline">
          <h2>Transaction Timeline </h2>
          <div className="timeline-content">
            {filteredEvents.length === 0 ? (
              <p>No events yet. Create a transaction... [cite: 98]</p>
            ) : (
              <ul>
                {filteredEvents.map(event => (
                  <li key={event.id}>
                    <strong>{event.type}</strong>
                    <pre>{JSON.stringify(event.payload, null, 2)}</pre>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;