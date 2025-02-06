import { getEquipoById, getVehiculos, updatePartida, getPartida } from '../../api/fetchApi.js';

class CarTuningComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    // Variable externa para almacenar la configuración seleccionada por el usuario.
    this.selectedConfig = {
      drivingMode: null,
      fuelStrategy: null,
      tirePressure: null,
      aeroLoad: null
    };

    // Objeto para almacenar los valores calculados de rendimiento y otros.
    this.tuningValues = {
      velocidadPromedio: null,
      consumoCombustibleEstrategia: null,
      pressureValue: null,
      aeroValue: null
    };

    this.shadowRoot.innerHTML =/*html*/ `
      <!-- Bootstrap CSS -->
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
      <style>

        :host {
          display: block;
          padding: 20px;
          height: 100%;
        }
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease-in-out;
        }
        .popup-content {
          background: linear-gradient(135deg, #ffffff, #f9f9f9);
          padding: 30px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
          max-width: 400px;
          width: 90%;
          animation: slideDown 0.3s ease-in-out;
        }
        .close-popup-btn {
          background-color: #007bff;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          font-size: 1rem;
          color: #fff;
          cursor: pointer;
          transition: background-color 0.3s ease;
          margin-top: 10px;
        }
        .close-popup-btn:hover {
          background-color: #0056b3;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      </style>
      <div class="container">
        <div id="content">Cargando información...</div>

      </div>
    `;
  }

  async connectedCallback() {
    const equipoId = this.getAttribute('equipo');
    // Se espera que el id de partida se pase como atributo del elemento, por ejemplo:
    // <car-tuning equipo="001" partida="123">
    const partidaId = this.getAttribute('partida');
    const contentEl = this.shadowRoot.getElementById('content');

    // Obtiene el valor de "modo" de la partida y lo guarda en la constante climaPista  
    let climaPista = 'seco'; // valor por defecto
    if (partidaId) {
      const partidaData = await getPartida(partidaId);
      if (partidaData && partidaData.pista && partidaData.pista.length > 0) {
        climaPista = partidaData.pista[0].modo;
      }
    }
    console.log("Clima de pista obtenido:", climaPista);

    if (!equipoId) {
      contentEl.innerHTML = /*html*/`<div class="alert alert-danger">No se proporcionó el id del equipo.</div>`;
      return;
    }

    try {
      // Se obtiene la información del equipo seleccionado
      const equipoData = await getEquipoById(equipoId);
      if (!equipoData) {
        contentEl.innerHTML = /*html*/`<div class="alert alert-warning">No se encontró información para el equipo seleccionado.</div>`;
        return;
      }

      // Se obtienen todos los vehículos y se filtra el que corresponde al equipo actual
      const vehiculos = await getVehiculos();
      const vehiculoFiltrado = vehiculos.find(vehicle => vehicle.equipo === equipoId);

      // Se extrae la URL del modelo 3D
      let modelo3dHTML = '';
      if (vehiculoFiltrado && vehiculoFiltrado.model3d) {
        let model3dUrl = vehiculoFiltrado.model3d;
        if (vehiculoFiltrado.model3d.includes('src="')) {
          const srcMatch = vehiculoFiltrado.model3d.match(/src="([^"]+)"/);
          if (srcMatch && srcMatch[1]) {
            model3dUrl = srcMatch[1];
          }
        }
        modelo3dHTML = /*html*/`
          <iframe 
            src="${model3dUrl}" 
            style="width: 100%; height: 120%; border: none;" 
            frameborder="0" 
            allowfullscreen>
          </iframe>
        `;
      } else {
        modelo3dHTML = /*html*/`<span class="text-muted">No se encontró el modelo 3D para este equipo.</span>`;
      }

      // Validar que el vehículo tenga información de rendimiento
      if (!vehiculoFiltrado || !vehiculoFiltrado.rendimiento) {
        contentEl.innerHTML = /*html*/`<div class="alert alert-danger">No se encontró información de rendimiento para el vehículo.</div>`;
        return;
      }

      // Componente: Se muestra una estructura de dos columnas, una con el modelo 3D y otra con las opciones.
      contentEl.innerHTML = /*html*/`
        <div class="row h-100">
          <!-- Columna izquierda: modelo 3D -->
          <div class="col-md-9 d-flex justify-content-center align-items-center">
            <div class="position-relative w-100" style="height: 100%; background-color: #e9ecef;">
              ${modelo3dHTML}
            </div>
          </div>
          <!-- Columna derecha: sidebar de opciones -->
          <div class="col-md-3">
            <div class="p-3">
              <h3>${equipoData.nombre} - Opciones de Rendimiento</h3>
              <div class="mb-3">
                <label for="drivingModeSelect" class="form-label">Modo de Conducción</label>
                <select id="drivingModeSelect" class="form-select">
                  <option value="conduccion_normal">Conducción Normal</option>
                  <option value="conduccion_agresiva">Conducción Agresiva</option>
                  <option value="ahorro_combustible">Ahorro de Combustible</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="fuelStrategySelect" class="form-label">Estrategia de Combustible</label>
                <select id="fuelStrategySelect" class="form-select">
                  <option value="rendimiento">Rendimiento</option>
                  <option value="agresivo">Agresivo</option>
                  <option value="ahorro_combustible">Ahorro de Combustible</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="tirePressureSelect" class="form-label">Presión de Neumáticos</label>
                <select id="tirePressureSelect" class="form-select">
                  <option value="baja">Baja</option>
                  <option value="estandar">Estándar</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="aeroLoadSelect" class="form-label">Carga Aerodinámica</label>
                <select id="aeroLoadSelect" class="form-select">
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
              <div class="mb-3">
                <button id="saveConfigBtn" class="btn btn-danger">Guardar Configuración</button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Inicializamos la variable externa con los valores por defecto mostrados.
      this.selectedConfig = {
        drivingMode: this.shadowRoot.getElementById('drivingModeSelect').value,
        fuelStrategy: this.shadowRoot.getElementById('fuelStrategySelect').value,
        tirePressure: this.shadowRoot.getElementById('tirePressureSelect').value,
        aeroLoad: this.shadowRoot.getElementById('aeroLoadSelect').value,
      };

      // Listener para Modo de Conducción: almacena el valor seleccionado y sus cálculos.
      const drivingSelect = this.shadowRoot.getElementById('drivingModeSelect');
      drivingSelect.addEventListener('change', () => {
        this.selectedConfig.drivingMode = drivingSelect.value;
        const selectedMode = drivingSelect.value;
        const rendimientoSeleccionado = vehiculoFiltrado.rendimiento[selectedMode];
        if (rendimientoSeleccionado) {
          const velocidadPromedio = rendimientoSeleccionado.velocidad_promedio_kmh;
          const consumoCombustible = rendimientoSeleccionado.consumo_combustible[climaPista];
          console.log("Modo de conducción seleccionado:", selectedMode);
          console.log("Velocidad Promedio (km/h):", velocidadPromedio);
          console.log("Consumo de Combustible:", consumoCombustible);
          // Guardamos la velocidadPromedio para uso externo.
          this.tuningValues.velocidadPromedio = velocidadPromedio;
        } else {
          console.log("No se encontró información de rendimiento para el modo seleccionado:", selectedMode);
        }
      });
      drivingSelect.dispatchEvent(new Event('change'));

      // Listener para Estrategia de Combustible: almacena el valor en selectedConfig y calcula el consumo.
      const fuelStrategySelect = this.shadowRoot.getElementById('fuelStrategySelect');
      fuelStrategySelect.addEventListener('change', () => {
        this.selectedConfig.fuelStrategy = fuelStrategySelect.value;
        const selectedFuelStrategy = fuelStrategySelect.value;
        console.log("Estrategia de Combustible seleccionada:", selectedFuelStrategy);
        let mappedMode;
        if (selectedFuelStrategy === "rendimiento") {
          mappedMode = "conduccion_normal";
        } else if (selectedFuelStrategy === "agresivo") {
          mappedMode = "conduccion_agresiva";
        } else if (selectedFuelStrategy === "ahorro_combustible") {
          mappedMode = "ahorro_combustible";
        }
        const rendimientoPorEstrategia = vehiculoFiltrado.rendimiento[mappedMode];
        if (rendimientoPorEstrategia && rendimientoPorEstrategia.consumo_combustible) {
          const consumoCombustibleEstrategia = rendimientoPorEstrategia.consumo_combustible[climaPista];
          console.log(`Consumo para estrategia ${selectedFuelStrategy} (mapeado a ${mappedMode}) bajo clima ${climaPista}:`, consumoCombustibleEstrategia);
          // Guardamos el consumoCombustibleEstrategia para uso externo.
          this.tuningValues.consumoCombustibleEstrategia = consumoCombustibleEstrategia;
        } else {
          console.log(`No se encontró información para la estrategia seleccionada: ${selectedFuelStrategy}`);
        }
      });
      fuelStrategySelect.dispatchEvent(new Event('change'));

      // Listener para Presión de Neumáticos: guarda valor en selectedConfig y asigna pressureValue.
      const tirePressureSelect = this.shadowRoot.getElementById('tirePressureSelect');
      tirePressureSelect.addEventListener('change', () => {
        this.selectedConfig.tirePressure = tirePressureSelect.value;
        const selectedPressure = tirePressureSelect.value;
        let pressureValue;
        if (selectedPressure === 'baja') {
          pressureValue = 20;
        } else if (selectedPressure === 'estandar') {
          pressureValue = 30;
        } else if (selectedPressure === 'alta') {
          pressureValue = 40;
        }
        console.log(`Presión de Neumáticos seleccionada: ${selectedPressure} (${pressureValue})`);
        // Guardamos el pressureValue para uso externo.
        this.tuningValues.pressureValue = pressureValue;
      });
      tirePressureSelect.dispatchEvent(new Event('change'));

      // Listener para Carga Aerodinámica: almacena el valor en selectedConfig y calcula aeroValue.
      const aeroLoadSelect = this.shadowRoot.getElementById('aeroLoadSelect');
      aeroLoadSelect.addEventListener('change', () => {
        this.selectedConfig.aeroLoad = aeroLoadSelect.value;
        const selectedAero = aeroLoadSelect.value;
        let aeroValue;
        if (selectedAero === 'baja') {
          aeroValue = 0.2;
        } else if (selectedAero === 'media') {
          aeroValue = 0.5;
        } else if (selectedAero === 'alta') {
          aeroValue = 0.8;
        }
        console.log(`Carga Aerodinámica seleccionada: ${selectedAero} (${aeroValue})`);
        // Guardamos el aeroValue para uso externo.
        this.tuningValues.aeroValue = aeroValue;
      });
      aeroLoadSelect.dispatchEvent(new Event('change'));

      // Listener para el botón de Guardar Configuración.
      const saveConfigBtn = this.shadowRoot.getElementById('saveConfigBtn');
      saveConfigBtn.addEventListener('click', async () => {
        if (partidaId) {
          try {
            // Se combinan los valores de selectedConfig y los datos calculados en tuningValues.
            const configuracion = { 
              ...this.selectedConfig,
              configuracionVehiculos: {
                velocidadPromedio: this.tuningValues.velocidadPromedio,
                consumoCombustibleEstrategia: this.tuningValues.consumoCombustibleEstrategia,
                pressureValue: this.tuningValues.pressureValue,
                aeroValue: this.tuningValues.aeroValue
              }
            };
            await updatePartida(partidaId, { configuracion });
            console.log('Configuración guardada:', configuracion);
            // En lugar de alert, se muestra el popup con el mensaje de éxito y emoji de confirmación.
            this.showPopup('¡Configuración guardada con éxito ✅');
          } catch (error) {
            console.error('Error al guardar la configuración:', error);
            alert('Error al guardar la configuración');
          }
        } else {
          console.error('No se proporcionó el ID de la partida para guardar la configuración.');
          alert('No se encontró el ID de la partida.');
        }
      });

    } catch (error) {
      console.error("Error al cargar la información del equipo:", error);
      contentEl.innerHTML = /*html*/`<div class="alert alert-danger">Error al cargar la información del equipo.</div>`;
    }
  }

  buildCard(title, data) {
    return/*html*/ `
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

  showPopup(message) {
    const popupOverlay = document.createElement('div');
    popupOverlay.className = 'popup-overlay';

    const popupContent = document.createElement('div');
    popupContent.className = 'popup-content';

    const messagePara = document.createElement('p');
    messagePara.textContent = message;
    popupContent.appendChild(messagePara);

    const closeButton = document.createElement('button');
    closeButton.className = 'close-popup-btn';
    closeButton.textContent = 'Cerrar';
    popupContent.appendChild(closeButton);

    popupOverlay.appendChild(popupContent);
    this.shadowRoot.appendChild(popupOverlay);

    // Cierra el popup al hacer click en el botón "Cerrar"
    closeButton.addEventListener('click', () => {
      this.shadowRoot.removeChild(popupOverlay);
    });

    // También se cierra si se hace click fuera del contenido
    popupOverlay.addEventListener('click', (e) => {
      if (e.target === popupOverlay) {
        this.shadowRoot.removeChild(popupOverlay);
      }
    });
  }
}

customElements.define('car-tuning', CarTuningComponent);
