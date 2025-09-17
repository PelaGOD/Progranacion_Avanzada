const API_URL = 'https://api.spacexdata.com/v5/launches';
const app = document.getElementById('app');
let launchesData = []; // Caché para guardar los datos de los lanzamientos

/**
 * Función para obtener todos los lanzamientos de la API de SpaceX
 */
const getLaunches = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    launchesData = data; // Guardamos los datos en caché
    return data;
  } catch (error) {
    console.error('Error fetching launches:', error);
    app.innerHTML = `<p>Error al cargar los datos. Inténtalo de nuevo más tarde.</p>`;
  }
};

/**
 * Renderiza la grilla de tarjetas en la página principal (Home) 
 */
const renderHome = (launches) => {
  app.innerHTML = `
    <div class="grid-container">
      ${launches.map(launch => `
        <div class="card">
          <img 
            src="${launch.links.patch.small || 'https://via.placeholder.com/250'}" 
            alt="${launch.name}"
            data-flight-number="${launch.flight_number}"
          >
          <h3>${launch.name}</h3>
        </div>
      `).join('')}
    </div>
  `;

  // Añade event listeners a las imágenes para que sean clickeables 
  document.querySelectorAll('.card img').forEach(img => {
    img.addEventListener('click', (event) => {
      const flightNumber = event.target.dataset.flightNumber;
      window.location.hash = `/launch/${flightNumber}`;
    });
  });
};

/**
 * Renderiza la vista de detalles de un lanzamiento específico
 */
const renderDetail = (flightNumber) => {
  const launch = launchesData.find(l => l.flight_number == flightNumber);

  if (!launch) {
    app.innerHTML = `<p>Lanzamiento no encontrado.</p><a href="#">Volver</a>`;
    return;
  }

  // Formatear la fecha y hora de despegue [cite: 22]
  const launchDate = new Date(launch.date_utc).toLocaleString('es-AR', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  app.innerHTML = `
    <div class="detail-container">
      <a href="#" class="back-button">← Volver a la lista</a>
      <h2>${launch.name}</h2>
      <img src="${launch.links.patch.large || 'https://via.placeholder.com/300'}" alt="${launch.name}"> <div class="detail-info">
        <p><strong>Número de vuelo:</strong> ${launch.flight_number}</p> <p><strong>Fecha de despegue:</strong> ${launchDate}</p>
        <p><strong>Detalles:</strong> ${launch.details || 'No hay detalles disponibles.'}</p> <p><strong>Fallas:</strong> ${launch.failures.length > 0 ? launch.failures.map(f => f.reason).join(', ') : 'No se registraron fallas.'}</p> </div>
    </div>
  `;
};


/**
 * Un "router" simple basado en el hash de la URL para manejar las vistas
 */
const router = async () => {
  const path = window.location.hash.slice(1) || '/';
  const parts = path.split('/');

  // Limpia el contenido anterior
  app.innerHTML = '<h2>Cargando...</h2>';

  // Asegurarnos de tener los datos antes de renderizar
  if (launchesData.length === 0) {
    await getLaunches();
  }

  if (parts[1] === 'launch' && parts[2]) {
    const flightNumber = parts[2];
    renderDetail(flightNumber);
  } else {
    renderHome(launchesData);
  }
};

// Escucha los cambios en el hash de la URL para navegar entre vistas
window.addEventListener('hashchange', router);

// Llama al router al cargar la página por primera vez
router();