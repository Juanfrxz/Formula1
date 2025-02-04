// Inicializa la API de Sketchfab y carga el modelo en el iframe
const initSketchfab = () => {
  const iframe = document.getElementById('sketchfab-iframe');
  const client = new Sketchfab('1.12.1', iframe);
  client.init('c5b5587b06694b6aaf4d986ea6fa5769', {
    success: function(api) {
      api.start();
      window.sketchfabApi = api;
    },
    error: function() {
      console.error('Error initializing Sketchfab Viewer');
    }
  });
};

// Agrega eventos a los marcadores para actualizar la información en el panel derecho
const initMarkerEvents = () => {
  const markers = document.querySelectorAll('.marker');
  markers.forEach(marker => {
    marker.addEventListener('click', function(e) {
      e.preventDefault();
      const info = this.dataset.info;
      const infoPanel = document.getElementById('info-panel');
      if (infoPanel) {
        infoPanel.innerHTML = `<h3>Información</h3><p>${info}</p>`;
      }
    });
  });
};

const init = () => {
  initSketchfab();
  initMarkerEvents();
};

document.addEventListener('DOMContentLoaded', init);