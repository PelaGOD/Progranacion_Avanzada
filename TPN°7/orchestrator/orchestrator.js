import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env' }); // <-- La ruta relativa para encontrar el .env en la raíz

import { Kafka } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid'; // <-- Importación moderna (funciona con type: module)

const KAFKA_BROKERS = process.env.KAFKA_BROKERS.split(',');
const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID;

const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: KAFKA_BROKERS,
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'orchestrator-group' });

// Tópicos de Kafka
const TOPIC_COMMANDS = 'txn.commands';
const TOPIC_EVENTS = 'txn.events';
const TOPIC_DLQ = 'txn.dlq';

// Función helper para producir eventos
const produceEvent = async (type, transactionId, userId, payload) => {
  const event = {
    id: uuidv4(), // id del evento [cite: 46]
    type: type, // ej: "txn.FundsReserved" [cite: 47, 49]
    version: 1, // [cite: 50, 51]
    ts: Date.now(), // [cite: 52, 53]
    transactionId: transactionId, // Clave de partición [cite: 14, 55]
    userId: userId, // [cite: 56]
    payload: payload, // [cite: 57]
  };

  console.log(`[Orchestrator] Emitting Event: ${type} for txn ${transactionId}`);
  await producer.send({
    topic: TOPIC_EVENTS,
    messages: [
      {
        key: transactionId, // Partición por transactionId [cite: 14]
        value: JSON.stringify(event),
      },
    ],
  });
};

// Lógica principal del orquestador
const run = async () => {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC_COMMANDS, fromBeginning: true });

  console.log('[Orchestrator] Conectado y escuchando en', TOPIC_COMMANDS);

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      let command;
      try {
        command = JSON.parse(message.value.toString());
        const { transactionId, userId, payload } = command;

        console.log(`[Orchestrator] Processing command: ${command.type} for txn ${transactionId}`);

        // 1. Inicia el flujo [cite: 24]
        if (command.type === 'txn.TransactionInitiated') {
          // 2. Simular reserva de fondos [cite: 25]
          await produceEvent('txn.FundsReserved', transactionId, userId, {
            ok: true,
            holdId: uuidv4(),
            amount: payload.amount,
          }); // [cite: 62]

          // 3. Simular chequeo de fraude [cite: 30]
          const risk = Math.random() > 0.8 ? 'HIGH' : 'LOW'; // 20% de riesgo ALTO
          
          if (risk === 'LOW') {
            // 4.a Flujo de bajo riesgo [cite: 31]
            await produceEvent('txn.FraudChecked', transactionId, userId, { risk: 'LOW' }); // [cite: 32, 63]
            await produceEvent('txn.Committed', transactionId, userId, { ledgerTxId: uuidv4() }); // [cite: 34, 64]
            await produceEvent('txn.Notified', transactionId, userId, { channels: ['email', 'push'] }); // [cite: 36, 66]
            
            console.log(`[Orchestrator] Completed OK: ${transactionId}`);

          } else {
            // 4.b Flujo de alto riesgo (Reverso) [cite: 33]
            await produceEvent('txn.FraudChecked', transactionId, userId, { risk: 'HIGH' }); // [cite: 35, 63]
            await produceEvent('txn.Reversed', transactionId, userId, { reason: 'High fraud risk' }); // [cite: 37, 65]
            
            console.log(`[Orchestrator] Reversed (Fraud): ${transactionId}`);
          }
        }
      } catch (error) {
        // 5. Manejo de error inesperado [cite: 26, 28]
        console.error('[Orchestrator] Error inesperado:', error.message);
        
        // Enviar a la Dead Letter Queue (DLQ) 
        await producer.send({
          topic: TOPIC_DLQ,
          messages: [
            {
              key: command?.transactionId || 'unknown',
              value: JSON.stringify({
                error: error.message,
                originalMessage: message.value.toString(),
              }),
            },
          ],
        });
      }
    },
  });
};

run().catch(console.error);