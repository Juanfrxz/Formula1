import { getEquipoById } from '../../api/fetchApi.js';

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
      const equipoData = await getEquipoById(equipoId);
      if (!equipoData) {
        contentEl.innerHTML = `<div class="alert alert-warning">No se encontró información para el equipo seleccionado.</div>`;
        return;
      }

      // Con los datos del equipo se construyen las tarjetas de rendimiento
      const cardNormal = this.buildCard('Conducción Normal', equipoData.rendimiento.conduccion_normal);
      const cardAgresiva = this.buildCard('Conducción Agresiva', equipoData.rendimiento.conduccion_agresiva);
      const cardAhorro = this.buildCard('Ahorro de Combustible', equipoData.rendimiento.ahorro_combustible);

      contentEl.innerHTML = `
        <div class="row mb-4">
          <div class="col-12">
            <div class="position-relative" style="height: 400px; background-color: #e9ecef;">
              <!-- Aquí va el modelo 3D del carro -->
              <div class="d-flex h-100 justify-content-center align-items-center">
                <span class="text-muted">[Espacio para el modelo 3D del carro]</span>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <h3>${equipoData.nombre} - Opciones de Rendimiento</h3>
          </div>
          ${cardNormal}
          ${cardAgresiva}
          ${cardAhorro}
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
