const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'banco-app',
  brokers: ['localhost:9092'], // Asegúrate que KAFKA_BROKERS esté configurado [cite: 101]
});

module.exports = kafka;