import '../styles/globals.css'; // Importa los estilos globales

// Este es el componente principal de la App
function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp; // Asegúrate de que haya un 'default export'