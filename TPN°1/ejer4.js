let edad = 60; // Cambia esto a la edad que quieras verificar
let genero = "Mujer"; // Cambia esto a "Hombre" o "Mujer"

if (genero === "Hombre" && edad >= 65) {
    console.log("Este hombre está jubilado.");
} else if (genero === "Mujer" && edad >= 60) {
    console.log("Esta mujer está jubilada.");
} else {
    console.log("Esta persona aún no está jubilada.");
}