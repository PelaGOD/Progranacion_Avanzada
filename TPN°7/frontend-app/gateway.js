const { WebSocketServer } = require('ws');
const kafka = require('./kafka-client');

const consumer = kafka.consumer({ groupId: 'gateway-group' });
const wss = new WebSocketServer({ port: 8081 }); // Puerto para WebSocket

wss.on('connection', ws => {
  console.log('[Gateway] Cliente WebSocket conectado');
  ws.on('close', () => console.log('[Gateway] Cliente WebSocket desconectado'));
});

// Función para transmitir a todos los clientes conectados
const broadcast = (event) => {
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(event));
    }
  });
};

const runGateway = async () => {
  await consumer.connect();
  
  // 1. Se suscribe a la "Ventana de Platos Listos" (txn.events) 
  await consumer.subscribe({ topic: 'txn.events', fromBeginning: true });
  console.log('[Gateway] Escuchando eventos de Kafka en txn.events...');

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const event = JSON.parse(message.value.toString());
        console.log(`[Gateway] Reenviando evento ${event.type} para ${event.transactionId}`);
        
        // 2. Transmite el evento a TODOS los clientes conectados
        // (La mejora es filtrar por userId/transactionId) [cite: 41, 42]
        broadcast(event);

      } catch (error) {
        console.error('[Gateway] Error al procesar mensaje de Kafka:', error);
      }
    },
  });
};

runGateway().catch(console.error);