// Este es el API (api.js) que recibe el POST
// require('dotenv').config({ path: '../../../.env' }); // Sube 3 niveles para encontrar el .env
import { Kafka } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';

// Estas variables deben ser leídas directamente por Next.js del .env
const KAFKA_BROKERS = process.env.KAFKA_BROKERS.split(','); 
const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID;

// Inicializamos Kafka (en un escenario real, esto se manejaría como un singleton)
const kafka = new Kafka({
  clientId: `${KAFKA_CLIENT_ID}-api`,
  brokers: KAFKA_BROKERS,
});

const producer = kafka.producer();
let producerConnected = false;

async function getProducer() {
  if (!producerConnected) {
    await producer.connect();
    producerConnected = true;
  }
  return producer;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { fromAccount, toAccount, amount, currency, userId, description } = req.body;

    // Generar ID de transacción
    const transactionId = uuidv4();

    // 1. Crear el comando inicial [cite: 61]
    const command = {
      id: uuidv4(),
      type: 'txn.TransactionInitiated', // [cite: 22]
      version: 1,
      ts: Date.now(),
      transactionId: transactionId,
      userId: userId,
      payload: { fromAccount, toAccount, amount, currency, userId },
    };

    // 2. Producir el comando a Kafka [cite: 21, 23]
    const kafkaProducer = await getProducer();
    await kafkaProducer.send({
      topic: 'txn.commands', // [cite: 23]
      messages: [
        {
          key: transactionId, // Partición por transactionId [cite: 14]
          value: JSON.stringify(command),
        },
      ],
    });

    console.log(`[API] Comando 'txn.TransactionInitiated' publicado para ${transactionId}`);

    // 3. Responder al cliente
    // Respondemos 202 (Aceptado) porque el procesamiento es asíncrono
    res.status(202).json({ 
      message: 'Transaction initiated', 
      transactionId: transactionId 
    });

  } catch (error) {
    console.error('[API] Error al publicar en Kafka:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}