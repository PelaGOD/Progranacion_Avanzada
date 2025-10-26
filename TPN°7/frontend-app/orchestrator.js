const { v4: uuidv4 } = require('uuid');
const kafka = require('./kafka-client');

const consumer = kafka.consumer({ groupId: 'orchestrator-group' });
const producer = kafka.producer();

// Función helper para crear nuevos eventos
const createEvent = (baseEvent, type, payload) => ({
  id: uuidv4(),
  type: type,
  version: 1,
  ts: Date.now(),
  transactionId: baseEvent.transactionId,
  userId: baseEvent.userId,
  correlationId: baseEvent.id, // ID del evento que disparó este
  payload: payload,
});

// Función helper para simular trabajo
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runOrchestrator = async () => {
  await consumer.connect();
  await producer.connect();
  
  // 1. Se suscribe a la "Barra de Comandas" (txn.commands) 
  await consumer.subscribe({ topic: 'txn.commands', fromBeginning: true });

  console.log('[Orchestrator] Esperando comandos...');

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      let baseEvent;
      try {
        baseEvent = JSON.parse(message.value.toString());
        console.log(`[Orchestrator] Procesando ${baseEvent.type} para ${baseEvent.transactionId}`);
        
        // --- INICIO DE LA SAGA ---
        
        // 2. Paso 1: Reservar Fondos 
        await sleep(1000); // Simula trabajo
        const fundsReservedEvent = createEvent(baseEvent, 'txn.FundsReserved', { ok: true, holdId: uuidv4() }); // [cite: 62]
        await producer.send({ topic: 'txn.events', messages: [{ key: baseEvent.transactionId, value: JSON.stringify(fundsReservedEvent) }] });

        // 3. Paso 2: Chequeo de Fraude 
        await sleep(1500); // Simula chequeo
        const risk = Math.random() < 0.8 ? 'LOW' : 'HIGH'; // 80% LOW, 20% HIGH
        
        const fraudCheckedEvent = createEvent(baseEvent, `txn.FraudChecked`, { risk: risk }); // [cite: 63]
        await producer.send({ topic: 'txn.events', messages: [{ key: baseEvent.transactionId, value: JSON.stringify(fraudCheckedEvent) }] });

        // 4. Paso 3: Decisión (Commit o Revert)
        if (risk === 'LOW') {
          // 4a. Riesgo BAJO: Commit [cite: 31, 32]
          await sleep(1000);
          const committedEvent = createEvent(baseEvent, 'txn.Committed', { ledgerTxId: uuidv4() }); // [cite: 34, 64]
          await producer.send({ topic: 'txn.events', messages: [{ key: baseEvent.transactionId, value: JSON.stringify(committedEvent) }] });

          // 4b. Notificar 
          await sleep(500);
          const notifiedEvent = createEvent(baseEvent, 'txn.Notified', { channels: ['email', 'push'] }); // [cite: 66]
          await producer.send({ topic: 'txn.events', messages: [{ key: baseEvent.transactionId, value: JSON.stringify(notifiedEvent) }] });

          console.log(`[Orchestrator] Transacción ${baseEvent.transactionId} COMPLETADA`);

        } else {
          // 4c. Riesgo ALTO: Revertir [cite: 33, 35]
          await sleep(1000);
          const reversedEvent = createEvent(baseEvent, 'txn.Reversed', { reason: 'HIGH_FRAUD_RISK' }); // [cite: 37, 65]
          await producer.send({ topic: 'txn.events', messages: [{ key: baseEvent.transactionId, value: JSON.stringify(reversedEvent) }] });

          console.log(`[Orchestrator] Transacción ${baseEvent.transactionId} REVERSADA`);
        }
        
        // --- FIN DE LA SAGA ---

      } catch (error) {
        // 5. Manejo de Error Inesperado [cite: 26, 28]
        console.error(`[Orchestrator] Error Inesperado al procesar ${baseEvent?.transactionId}:`, error);
        
        // Enviar a la Dead Letter Queue (DLQ) [cite: 10, 119]
        const errorPayload = {
            error: error.message,
            stack: error.stack,
            originalMessage: message.value.toString(),
        };
        await producer.send({
            topic: 'txn.dlq',
            messages: [{ key: message.key, value: JSON.stringify(errorPayload) }]
        });
      }
    },
  });
};

runOrchestrator().catch(console.error);