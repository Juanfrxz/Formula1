import { getEquipos, getPilotos, updateVehiculo, getVehiculos } from '../../api/fetchApi.js';

class EditCarComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    // Cargar equipos y pilotos
    this.equipos = await getEquipos();
    this.pilotos = await getPilotos();
    // Renderizamos el componente
    this.render();
    // Comentamos la siguiente línea para que el componente se muestre (ahora se usará en modal)
    // this.style.display = "none";
    // Configuramos acordeones y eventos
    this.setupAccordion();
    this.setupEvents();
    // Cargar el listado de vehículos en el select
    await this.loadVehicleOptions();

    // Si se pasa el atributo "carid", se carga ese vehículo.
    const carIdAttr = this.getAttribute("carid");
    if (carIdAttr) {
      await this.loadVehicleData(carIdAttr);
      const vehicleSelect = this.shadowRoot.getElementById("vehicleSelect");
      if (vehicleSelect) {
        vehicleSelect.value = carIdAttr;
      }
    }
  }

  async loadVehicleOptions() {
    try {
      this.vehicles = await getVehiculos();
      const vehicleSelect = this.shadowRoot.getElementById("vehicleSelect");
      if (vehicleSelect) {
        vehicleSelect.innerHTML =
          `<option value="">Select a vehicle</option>` +
          this.vehicles
            .map(
              vehicle =>
                `<option value="${vehicle.id}">${vehicle.modelo} - ${this.getTeamName(vehicle.equipo)}</option>`
            )
            .join("");
        vehicleSelect.addEventListener("change", async (e) => {
          const selectedId = e.target.value;
          if (selectedId) {
            await this.loadVehicleData(selectedId);
          }
        });
      }
    } catch (error) {
      console.error("Error al cargar los vehículos:", error);
    }
  }

  async loadVehicleData(id) {
    try {
      this.carData = await this.fetchVehiculoData(id);
      this.populateForm();
    } catch (error) {
      console.error("Error al cargar datos del vehículo:", error);
    }
  }

  async fetchVehiculoData(id) {
    const response = await fetch(`https://json-server-api-f1-production.up.railway.app/vehiculos/${id}`);
    return response.json();
  }

  setupAccordion() {
    const accordionButtons = this.shadowRoot.querySelectorAll('.accordion-button');
    accordionButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetSelector = button.getAttribute('data-bs-target');
        const targetPanel = this.shadowRoot.querySelector(targetSelector);
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!isExpanded));
        if (targetPanel.classList.contains('show')) {
          targetPanel.classList.remove('show');
        } else {
          targetPanel.classList.add('show');
        }
      });
    });
  }

  setupEvents() {
    const form = this.shadowRoot.getElementById('carForm');
    const cancelBtn = this.shadowRoot.getElementById('cancelEditCar');

    const equipoSelect = this.shadowRoot.getElementById("equipo");
    this.updatePilotosForTeam(equipoSelect.value);
    equipoSelect.addEventListener("change", () => {
      this.updatePilotosForTeam(equipoSelect.value);
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const updatedCar = this.getFormData();
      await updateVehiculo(this.carData.id, updatedCar);
      alert("Vehicle updated successfully");
      // Aquí el modal se cerrará desde el componente que lo invoque
    });

    cancelBtn.addEventListener("click", () => {
      // Aquí puedes agregar lógica para cerrar el modal dinámico si lo requieres
    });
  }

  getTeamName(teamId) {
    const team = this.equipos.find(eq => eq.id === teamId);
    return team ? team.nombre : teamId;
  }

  updatePilotosForTeam(teamId) {
    const pilotosSelect = this.shadowRoot.getElementById("pilotos");
    const filteredPilotos = this.pilotos.filter(piloto => piloto.equipo === teamId);
    pilotosSelect.innerHTML = filteredPilotos
      .map(p => `<option value="${p.id}">${p.nombre}</option>`)
      .join('');
  }

  populateForm() {
    if (!this.carData) return;
    const equipoSelect = this.shadowRoot.getElementById("equipo");
    equipoSelect.value = this.carData.equipo;
    this.updatePilotosForTeam(this.carData.equipo);
    const pilotosSelect = this.shadowRoot.getElementById("pilotos");
    const pilotos = Array.from(this.shadowRoot.querySelectorAll("#pilotos option:checked"), opt => opt.value);
    Array.from(pilotosSelect.options).forEach(option => {
      option.selected = pilotos.includes(option.value);
    });

    this.shadowRoot.getElementById("modelo").value = this.carData.modelo;
    this.shadowRoot.getElementById("motor").value = this.carData.motor;
    this.shadowRoot.getElementById("velocidad").value = this.carData.velocidad_maxima_kmh;
    this.shadowRoot.getElementById("aceleracion").value = this.carData.aceleracion_0_100;
    this.shadowRoot.getElementById("imagen").value = this.carData.imagen;

    const setRendimiento = (prefix, data) => {
      this.shadowRoot.getElementById(`${prefix}_velocidad`).value = data.velocidad_promedio_kmh;
      this.shadowRoot.getElementById(`${prefix}_comb_seco`).value = data.consumo_combustible.seco;
      this.shadowRoot.getElementById(`${prefix}_comb_lluvioso`).value = data.consumo_combustible.lluvioso;
      this.shadowRoot.getElementById(`${prefix}_comb_extremo`).value = data.consumo_combustible.extremo;
      this.shadowRoot.getElementById(`${prefix}_desg_seco`).value = data.desgaste_neumaticos.seco;
      this.shadowRoot.getElementById(`${prefix}_desg_lluvioso`).value = data.desgaste_neumaticos.lluvioso;
      this.shadowRoot.getElementById(`${prefix}_desg_extremo`).value = data.desgaste_neumaticos.extremo;
    };

    if (this.carData.rendimiento) {
      setRendimiento("normal", this.carData.rendimiento.conduccion_normal);
      setRendimiento("agresiva", this.carData.rendimiento.conduccion_agresiva);
      setRendimiento("ahorro", this.carData.rendimiento.ahorro_combustible);
    }
  }

  getFormData() {
    const equipo = this.shadowRoot.getElementById("equipo").value;
    const modelo = this.shadowRoot.getElementById("modelo").value;
    const motor = this.shadowRoot.getElementById("motor").value;
    const velocidad = parseInt(this.shadowRoot.getElementById("velocidad").value);
    const aceleracion = parseFloat(this.shadowRoot.getElementById("aceleracion").value);
    const pilotos = Array.from(this.shadowRoot.querySelectorAll("#pilotos option:checked"), opt => opt.value);
    const imagen = this.shadowRoot.getElementById("imagen").value;

    return {
      id: this.carData.id,
      equipo,
      modelo,
      motor,
      velocidad_maxima_kmh: velocidad,
      aceleracion_0_100: aceleracion,
      pilotos,
      rendimiento: this.getRendimientoData(),
      imagen
    };
  }

  getRendimientoData() {
    const getValues = (prefix) => ({
      velocidad_promedio_kmh: parseInt(this.shadowRoot.getElementById(`${prefix}_velocidad`).value),
      consumo_combustible: {
        seco: parseFloat(this.shadowRoot.getElementById(`${prefix}_comb_seco`).value),
        lluvioso: parseFloat(this.shadowRoot.getElementById(`${prefix}_comb_lluvioso`).value),
        extremo: parseFloat(this.shadowRoot.getElementById(`${prefix}_comb_extremo`).value)
      },
      desgaste_neumaticos: {
        seco: parseFloat(this.shadowRoot.getElementById(`${prefix}_desg_seco`).value),
        lluvioso: parseFloat(this.shadowRoot.getElementById(`${prefix}_desg_lluvioso`).value),
        extremo: parseFloat(this.shadowRoot.getElementById(`${prefix}_desg_extremo`).value)
      }
    });

    return {
      conduccion_normal: getValues("normal"),
      conduccion_agresiva: getValues("agresiva"),
      ahorro_combustible: getValues("ahorro")
    };
  }

  render() {
    this.shadowRoot.innerHTML = /*html*/ `
      <style>
        @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');
        .accordion-collapse {
          display: none;
        }
        .accordion-collapse.show {
          display: block;
        }
      </style>
      <div class="container">
        <h2>Edit Vehicle</h2>
        <!-- Select to list registered vehicles -->
        <div class="form-group">
          <label for="vehicleSelect">Select a vehicle:</label>
          <select id="vehicleSelect" class="form-control">
            <option value="">Select a vehicle</option>
          </select>
        </div>
        <form id="carForm">
          <div class="accordion" id="carAccordion">
            <!-- General Information Section -->
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button class="accordion-button" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#generalInfo" 
                        aria-expanded="true">
                  General Information
                </button>
              </h2>
              <div id="generalInfo" class="accordion-collapse collapse show">
                <div class="accordion-body">
                  <label>Team:</label>
                  <select id="equipo" class="form-control">
                    ${this.equipos.map(eq => `<option value="${eq.id}">${eq.nombre}</option>`).join('')}
                  </select>
                  <label>Drivers:</label>
                  <select id="pilotos" class="form-control" multiple>
                    ${this.pilotos.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('')}
                  </select>
                  <label>Model:</label>
                  <input type="text" id="modelo" class="form-control" required>
                  <label>Engine:</label>
                  <input type="text" id="motor" class="form-control" required>
                  <label>Max Speed (km/h):</label>
                  <input type="number" id="velocidad" class="form-control" required>
                  <label>0-100 Acceleration (s):</label>
                  <input type="number" step="0.1" id="aceleracion" class="form-control" required>
                  <label>Image (URL):</label>
                  <input type="text" id="imagen" class="form-control">
                </div>
              </div>
            </div>
            <!-- Performance Section: Normal Driving -->
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button class="accordion-button collapsed" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#performance_normal" 
                        aria-expanded="false">
                  Performance: Normal Driving
                </button>
              </h2>
              <div id="performance_normal" class="accordion-collapse collapse">
                <div class="accordion-body">
                  ${this.renderPerformanceInputs("normal", "Normal Driving")}
                </div>
              </div>
            </div>
            <!-- Performance Section: Aggressive Driving -->
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button class="accordion-button collapsed" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#performance_agresiva" 
                        aria-expanded="false">
                  Performance: Aggressive Driving
                </button>
              </h2>
              <div id="performance_agresiva" class="accordion-collapse collapse">
                <div class="accordion-body">
                  ${this.renderPerformanceInputs("Aggressive", "Aggressive Driving")}
                </div>
              </div>
            </div>
            <!-- Performance Section: Fuel Saving -->
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button class="accordion-button collapsed" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#performance_ahorro" 
                        aria-expanded="false">
                  Performance: Fuel Saving
                </button>
              </h2>
              <div id="performance_ahorro" class="accordion-collapse collapse">
                <div class="accordion-body">
                  ${this.renderPerformanceInputs("Saving", "Fuel Saving")}
                </div>
              </div>
            </div>
          </div>
          <button type="submit" class="btn btn-primary mt-3">Update</button>
          <button type="button" class="btn btn-secondary mt-3" id="cancelEditCar">Cancel</button>
        </form>
      </div>
    `;
  }

  renderPerformanceInputs(prefix, label) {
    return /*html*/ `
      <h4>${label}</h4>
      <label>Average Speed (km/h):</label>
      <input type="number" id="${prefix}_velocidad" class="form-control" required>
      <label>Fuel Consumption:</label>
      <input type="number" id="${prefix}_comb_seco" class="form-control" placeholder="Dry" required>
      <input type="number" id="${prefix}_comb_lluvioso" class="form-control" placeholder="Wet" required>
      <input type="number" id="${prefix}_comb_extremo" class="form-control" placeholder="Extreme" required>
      <label>Tire Wear:</label>
      <input type="number" id="${prefix}_desg_seco" class="form-control" placeholder="Dry" required>
      <input type="number" id="${prefix}_desg_lluvioso" class="form-control" placeholder="Wet" required>
      <input type="number" id="${prefix}_desg_extremo" class="form-control" placeholder="Extreme" required>
    `;
  }
}

customElements.define("edit-car-component", EditCarComponent);
