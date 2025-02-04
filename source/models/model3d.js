// Inicializa la API de Sketchfab y carga el modelo en el iframe
const initSketchfab = () => {
  const iframe = document.getElementById('sketchfab-iframe');
  const client = new Sketchfab('1.12.1', iframe);
  client.init('0c9e188ef67b49f1bafd4b9e290a410c', {
    success: function(api) {
      api.start();
      window.sketchfabApi = api;
    },
    error: function() {
      console.error('Error initializing Sketchfab Viewer');
    }
  });
};

const init = () => {
  initSketchfab();
};

document.addEventListener('DOMContentLoaded', init);