import { getEquipoById, getVehiculos } from '../../api/fetchApi.js';


class CarTuningComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <!-- Bootstrap CSS -->
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
      <style>
        :host {
          display: block;
          padding: 20px;
        }
      </style>
      <div class="container">
        <div id="content">Cargando información...</div>
      </div>
    `;
  }

  async connectedCallback() {
    const equipoId = this.getAttribute('equipo');
    const contentEl = this.shadowRoot.getElementById('content');

    if (!equipoId) {
      contentEl.innerHTML = `<div class="alert alert-danger">No se proporcionó el id del equipo.</div>`;
      return;
    }

    try {
      // Se obtiene la información del equipo seleccionado
      const equipoData = await getEquipoById(equipoId);
      if (!equipoData) {
        contentEl.innerHTML = `<div class="alert alert-warning">No se encontró información para el equipo seleccionado.</div>`;
        return;
      }

      // Se obtienen todos los vehículos y se filtra el que corresponde al equipo (comparando la llave "equipo")
      const vehiculos = await getVehiculos();
      const vehiculoFiltrado = vehiculos.find(vehicle => vehicle.equipo === equipoId);

      // Se extrae la URL del modelo 3D usando la misma lógica aplicada en CarsComponent.js
      let modelo3dHTML = '';
      if (vehiculoFiltrado && vehiculoFiltrado.model3d) {
        let model3dUrl = vehiculoFiltrado.model3d;
        if (vehiculoFiltrado.model3d.includes('src="')) {
          const srcMatch = vehiculoFiltrado.model3d.match(/src="([^"]+)"/);
          if (srcMatch && srcMatch[1]) {
            model3dUrl = srcMatch[1];
          }
        }
        modelo3dHTML = `
          <iframe 
            src="${model3dUrl}" 
            style="width: 100%; height: 100%; border: none;" 
            frameborder="0" 
            allowfullscreen>
          </iframe>
        `;
      } else {
        modelo3dHTML = `<span class="text-muted">No se encontró el modelo 3D para este equipo.</span>`;
      }

      // Se arma la vista del componente, mostrando el modelo 3D y el nombre del equipo
      contentEl.innerHTML = `
        <div class="row mb-4">
          <div class="col-12">
            <div class="position-relative" style="height: 400px; background-color: #e9ecef;">
              ${modelo3dHTML}
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <h3>${equipoData.nombre} - Opciones de Rendimiento</h3>
          </div>
          <!-- Puedes agregar aquí las tarjetas de rendimiento si así lo requieres -->
        </div>
      `;
    } catch (error) {
      console.error("Error al cargar la información del equipo:", error);
      contentEl.innerHTML = `<div class="alert alert-danger">Error al cargar la información del equipo.</div>`;
    }
  }

  buildCard(title, data) {
    return `
      <div class="col-md-4 mb-3">
        <div class="card h-100">
          <div class="card-header text-center fw-bold">${title}</div>
          <div class="card-body">
            <p><strong>Velocidad Promedio:</strong> ${data.velocidad_promedio_kmh} km/h</p>
            <p><strong>Consumo de Combustible:</strong></p>
            <ul class="list-unstyled ms-3">
              <li><strong>Seco:</strong> ${data.consumo_combustible.seco} L/100km</li>
              <li><strong>Lluvioso:</strong> ${data.consumo_combustible.lluvioso} L/100km</li>
              <li><strong>Extremo:</strong> ${data.consumo_combustible.extremo} L/100km</li>
            </ul>
            <p><strong>Desgaste de Neumáticos:</strong></p>
            <ul class="list-unstyled ms-3">
              <li><strong>Seco:</strong> ${data.desgaste_neumaticos.seco}</li>
              <li><strong>Lluvioso:</strong> ${data.desgaste_neumaticos.lluvioso}</li>
              <li><strong>Extremo:</strong> ${data.desgaste_neumaticos.extremo}</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('car-tuning', CarTuningComponent);
