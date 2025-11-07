export default function TransactionTimeline({ events }) {
  const getStatusColor = (type) => {
    if (type.includes('Reversed') || type.includes('HIGH')) return '#f44336'; // Rojo
    if (type.includes('Committed') || type.includes('Notified')) return '#4caf50'; // Verde
    if (type.includes('Initiated')) return '#2196f3'; // Azul
    return '#ff9800'; // Naranja (default)
  };

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        Cronología de la transacción
      </h2>
      <div style={{ 
        height: '400px', 
        overflowY: 'auto', 
        backgroundColor: '#1a1a1a', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #333'
      }}>
        {events.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>
            Aún no hay eventos. Crea una transacción para ver la cronología.
          </p> // [cite: 98]
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {events.map((event) => (
              <li key={event.id} style={{ 
                borderLeft: `4px solid ${getStatusColor(event.type)}`, 
                padding: '10px 15px', 
                marginBottom: '10px', 
                backgroundColor: '#2a2a2a' 
              }}>
                <strong style={{ color: getStatusColor(event.type) }}>
                  {event.type}
                </strong>
                <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '5px' }}>
                  {new Date(event.ts).toLocaleTimeString()} - Txn: {event.transactionId.substring(0, 8)}...
                </div>
                <pre style={{ 
                  fontSize: '0.75rem', 
                  backgroundColor: '#1a1a1a', 
                  padding: '5px', 
                  overflowX: 'auto',
                  marginTop: '8px'
                }}>
                  {JSON.stringify(event.payload, null, 2)}
                </pre>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}