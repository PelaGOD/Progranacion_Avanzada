const express = require('express');
const { v4: uuidv4 } = require('uuid');
const kafka = require('./kafka-client');

const app = express();
app.use(express.json());

// CORS (necesario para que React hable con esta API)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const producer = kafka.producer();

app.post('/transactions', async (req, res) => {
  try {
    await producer.connect();
    
    // 1. Obtenemos los datos del formulario 
    const { fromAccount, toAccount, amount, currency, userId } = req.body;
    
    // 2. Creamos el ID de la transacción 
    const transactionId = uuidv4();
    
    // 3. Creamos el payload del evento [cite: 61]
    const payload = {
      fromAccount,
      toAccount,
      amount,
      currency,
      userId,
    };
    
    // 4. Creamos el "sobre" del evento [cite: 45-58]
    const event = {
      id: uuidv4(),
      type: 'txn.TransactionInitiated', // [cite: 22]
      version: 1,
      ts: Date.now(),
      transactionId: transactionId,
      userId: userId,
      payload: payload,
    };

    // 5. Enviamos a la "Barra de Comandas" (txn.commands) [cite: 10, 23]
    await producer.send({
      topic: 'txn.commands',
      messages: [
        {
          // Usamos transactionId como clave para garantizar el orden 
          key: transactionId, 
          value: JSON.stringify(event),
        },
      ],
    });

    console.log(`[API] Evento ${event.type} enviado para ${transactionId}`);
    res.status(202).json({ message: 'Transacción iniciada', transactionId });

  } catch (error) {
    console.error('[API] Error al producir evento:', error);
    res.status(500).json({ message: 'Error interno' });
  } 
  // No desconectamos el producer para que siga vivo
});

const PORT = 3001; // Diferente del frontend y del gateway
app.listen(PORT, () => {
  console.log(`[API] Servidor HTTP escuchando en http://localhost:${PORT}`);
});