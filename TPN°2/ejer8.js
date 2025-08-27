const alertas = [
    { id: 1, nivel: "bajo", mensaje: "Intento de login fallido" },
    { id: 2, nivel: "alto", mensaje: "Acceso no autorizado detectado desde 10.0.0.5" },
    { id: 3, nivel: "medio", mensaje: "Puerto 8080 escaneado" },
    { id: 4, nivel: "alto", mensaje: "Malware detectado en Servidor-Web" }
];

const mensajesAdmin = alertas
    .filter(alerta => alerta.nivel === "alto")
    .map(alerta => `¡ALERTA URGENTE! ${alerta.mensaje}. Tomar acción inmediata.`);

console.log(mensajesAdmin);