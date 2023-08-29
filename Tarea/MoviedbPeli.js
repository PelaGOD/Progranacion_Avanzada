const apikey = '8fa8fe67b5f6b84aedfe04b2350639db';

const peticion = fetch(`https://api.themoviedb.org/3/movie/550?api_key=${apikey}`);

peticion
  .then(resp => resp.json())
  .then(json => {
    const {
      original_title,
      overview,
      poster_path
    } = json;

    // Mostrar los datos en una lista
    const ul = document.createElement("ul");
    ul.classList.add("peli");
    ul.innerHTML = `
      <li>
        <img src="https://image.tmdb.org/t/p/w500${poster_path}" alt="${original_title}" crossorigin="anonymous">
        <h3>${original_title}</h3>
        <p>${overview}</p>
      </li>
    `;
    document.getElementById("app").appendChild(ul);
  })
  .catch(console.warn);
