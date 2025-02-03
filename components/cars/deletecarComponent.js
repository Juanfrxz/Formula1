import { getVehiculos, deleteVehiculo } from '../../api/fetchApi.js';

class DeleteCarComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    this.render();
    // Comentamos la línea de ocultación para que se muestre en el modal
    // this.style.display = "none";
    await this.loadVehicleOptions();
    this.setupEvents();
  }

  async loadVehicleOptions() {
    try {
      this.vehicles = await getVehiculos();
      const vehicleSelect = this.shadowRoot.getElementById("vehicleSelect");
      if (vehicleSelect) {
        vehicleSelect.innerHTML =
          `<option value="">Seleccione un vehículo</option>` +
          this.vehicles
            .map(
              vehicle =>
                `<option value="${vehicle.id}">${vehicle.modelo} - ${vehicle.equipo}</option>`
            )
            .join("");
      }
    } catch (error) {
      console.error("Error al cargar los vehículos:", error);
    }
  }

  setupEvents() {
    const deleteBtn = this.shadowRoot.getElementById("deleteBtn");
    const cancelBtn = this.shadowRoot.getElementById("cancelDeleteCar");

    deleteBtn.addEventListener("click", async () => {
      const vehicleSelect = this.shadowRoot.getElementById("vehicleSelect");
      const selectedId = vehicleSelect.value;
      if (!selectedId) {
        alert("Por favor, seleccione un vehículo para eliminar.");
        return;
      }
      if (confirm("¿Está seguro de eliminar el vehículo seleccionado?")) {
        try {
          await deleteVehiculo(selectedId);
          alert("Vehículo eliminado con éxito.");
          await this.loadVehicleOptions();
        } catch (error) {
          console.error("Error al eliminar el vehículo:", error);
          alert("Error al eliminar el vehículo.");
        }
      }
    });

    cancelBtn.addEventListener("click", () => {
      // Puedes agregar lógica para cerrar el modal dinámico si es necesario
    });
  }

  render() {
    this.shadowRoot.innerHTML = /*html*/ `
      <style>
        @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');
        .container {
          margin-top: 1rem;
        }
      </style>
      <div class="container">
        <h2>Eliminar Vehículo</h2>
        <div class="form-group">
          <label for="vehicleSelect">Seleccione el vehículo a eliminar:</label>
          <select id="vehicleSelect" class="form-control">
            <option value="">Cargando vehículos...</option>
          </select>
        </div>
        <button id="deleteBtn" class="btn btn-danger mt-3">Eliminar</button>
        <button id="cancelDeleteCar" class="btn btn-secondary mt-3">Cancelar</button>
      </div>
    `;
  }
}

customElements.define("delete-car-component", DeleteCarComponent);