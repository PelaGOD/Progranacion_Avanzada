const traficoRed = {
  "08:00": 1250,
  "09:00": 1870,
  "10:00": 2100,
  "11:00": 1950,
  "12:00": 1600,
  "13:00": 1300,
  "14:00": 1700,
  "15:00": 2200,
  "16:00": 1800,
  "17:00": 1500
};

// Calcula el total de datos transferidos
const totalTransferido = Object.values(traficoRed).reduce((total, actual) => total + actual, 0);

// Encuentra la hora con mayor tráfico
let horaPico = "";
let maxTrafico = 0;
for (const hora in traficoRed) {
  if (traficoRed[hora] > maxTrafico) {
    maxTrafico = traficoRed[hora];
    horaPico = hora;
  }
}

console.log("Total de datos transferidos (MB):", totalTransferido);
console.log(`La hora con mayor tráfico fue a las ${horaPico} con ${maxTrafico} MB.`);