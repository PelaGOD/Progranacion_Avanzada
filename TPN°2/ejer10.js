const topologiaRed = {
  nodos: [
    { id: "A", tipo: "Router", ubicacion: "Planta 1"},
    { id: "B", tipo: "Switch", ubicacion: "Planta 1"},
    { id: "C", tipo: "Switch", ubicacion: "Planta 2"},
    { id: "D", tipo: "Switch", ubicacion: "Planta 3" },
    { id: "E", tipo: "Router", ubicacion: "Planta 3" }
  ],
  conexiones: [
    { origen: "A", destino: "B", ancho_banda: 1000},
    { origen: "A", destino: "C", ancho_banda: 1000},
    { origen: "B", destino: "C", ancho_banda: 100},
    { origen: "B", destino: "D", ancho_banda: 100},
    { origen: "C", destino: "D", ancho_banda: 100},
    { origen: "C", destino: "E", ancho_banda: 1000},
    { origen: "D", destino: "E", ancho_banda: 1000}
  ]
};

// Cuenta el número de conexiones por nodo
const conexionesPorNodo = {};
topologiaRed.nodos.forEach(nodo => {
  conexionesPorNodo[nodo.id] = 0;
});

topologiaRed.conexiones.forEach(conexion => {
    conexionesPorNodo[conexion.origen]++;
    conexionesPorNodo[conexion.destino]++;
});

// Encuentra los nodos con más conexiones
const nodosOrdenados = Object.entries(conexionesPorNodo)
  .sort(([, a], [, b]) => b - a);

// Sugiere optimizaciones
const sugerencias = [];
nodosOrdenados.forEach(([nodo, cantidad]) => {
    if (cantidad > 2) {
        sugerencias.push(`El nodo ${nodo} tiene ${cantidad} conexiones. Considerar aumentar su capacidad o ancho de banda.`);
    }
});

console.log("Conexiones por nodo:", conexionesPorNodo);
console.log("Nodos ordenados por número de conexiones:", nodosOrdenados);
console.log("Sugerencias de optimización:", sugerencias);