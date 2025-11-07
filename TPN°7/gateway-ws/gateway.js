import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env' }); // <-- La ruta relativa para encontrar el .env en la raíz

import { Kafka } from 'kafkajs';
import { Server } from 'socket.io'; // <-- Importación moderna

const KAFKA_BROKERS = process.env.KAFKA_BROKERS.split(',');
const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID;
const GATEWAY_PORT = parseInt(process.env.GATEWAY_PORT || 8080);

// 1. Configurar WebSocket Server (Socket.io)
const io = new Server(GATEWAY_PORT, {
  cors: {
    origin: '*', // En producción, deberías limitar esto a tu dominio
  },
});

console.log(`[Gateway] WebSocket Server escuchando en el puerto ${GATEWAY_PORT}`);

io.on('connection', (socket) => {
  console.log(`[Gateway] Cliente conectado: ${socket.id}`);

  // El cliente (app) se suscribe a "rooms" específicas 
  socket.on('subscribe', (room) => {
    console.log(`[Gateway] Cliente ${socket.id} suscrito a ${room}`);
    socket.join(room); // El "room" será el userId o transactionId
  });

  socket.on('disconnect', () => {
    console.log(`[Gateway] Cliente desconectado: ${socket.id}`);
  });
});

// 2. Configurar Kafka Consumer 
const kafka = new Kafka({
  clientId: `${KAFKA_CLIENT_ID}-gateway`,
  brokers: KAFKA_BROKERS,
});

const consumer = kafka.consumer({ groupId: 'gateway-group' });
const TOPIC_EVENTS = 'txn.events';

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC_EVENTS, fromBeginning: true });
  console.log('[Gateway] Conectado a Kafka, escuchando en', TOPIC_EVENTS);

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const event = JSON.parse(message.value.toString());
        const { transactionId, userId, type } = event;

        console.log(`[Gateway] Evento recibido: ${type} for txn ${transactionId}`);

        // 3. Reenviar evento por WebSocket [cite: 11, 42]
        // Filtra y envía al room del transactionId O al room del userId [cite: 41]
        io.to(transactionId).emit('event', event);
        io.to(userId).emit('event', event);

      } catch (error) {
        console.error('[Gateway] Error procesando mensaje de Kafka:', error.message);
      }
    },
  });
};

run().catch(console.error);