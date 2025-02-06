import { getVehiculos, deleteVehiculo, getEquipos } from '../../api/fetchApi.js';

class DeleteCarComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.equipos = []; // Inicializamos el array de equipos
  }

  async connectedCallback() {
    this.render();
    // Comentamos la línea de ocultación para que se muestre en el modal
    // this.style.display = "none";

    // Cargamos primero los equipos y luego los vehículos
    await this.loadEquipos();
    await this.loadVehicleOptions();
    this.setupEvents();
  }

  async loadEquipos() {
    try {
      // Se asume que getEquipos retorna un array de equipos, cada uno con id y nombre
      this.equipos = await getEquipos();
    } catch (error) {
      console.error("Error al cargar los equipos:", error);
      this.equipos = [];
    }
  }

  /**
   * Función que dado el id del equipo devuelve el nombre del equipo
   * Si no se encuentra, retorna el id como fallback.
   */
  getTeamName(teamId) {
    const team = this.equipos.find((eq) => eq.id === teamId);
    return team ? team.nombre : teamId;
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
              (vehicle) =>
                `<option value="${vehicle.id}">${vehicle.modelo} - ${this.getTeamName(
                  vehicle.equipo
                )}</option>`
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
        // En lugar de alert, mostramos un popup informativo
        await this.showInfoModal("Please select a vehicle to delete.");
        return;
      }
      // Utilizamos un popup de confirmación
      const confirmed = await this.showConfirmationModal(
        "Are you sure you want to delete the selected vehicle?"
      );
      if (confirmed) {
        try {
          await deleteVehiculo(selectedId);
          await this.showInfoModal("Vehicle deleted successfully.");
          await this.loadVehicleOptions();
        } catch (error) {
          console.error("Error al eliminar el vehículo:", error);
          await this.showInfoModal("Error deleting the vehicle.");
        }
      }
    });

    cancelBtn.addEventListener("click", () => {
      // Cierra el modal contenedor si existe (esto permite salir dando click fuera)
      const modalContainer = this.closest(".modal");
      if (modalContainer) {
        const modalInstance = bootstrap.Modal.getInstance(modalContainer);
        if (modalInstance) modalInstance.hide();
      }
    });
  }

  // Método para mostrar un popup de confirmación (dos botones: "Cancel" y "Confirm")
  showConfirmationModal(message) {
    return new Promise((resolve) => {
      const modalTemplate = /*html*/ `
        <div class="modal fade" tabindex="-1" role="dialog">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Confirmation</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <p>${message}</p>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" id="cancelButton">Cancel</button>
                <button type="button" class="btn btn-primary" id="confirmButton">Confirm</button>
              </div>
            </div>
          </div>
        </div>
      `;

      const modalWrapper = document.createElement("div");
      modalWrapper.innerHTML = modalTemplate;
      const modalElement = modalWrapper.firstElementChild;
      document.body.appendChild(modalElement);

      // Usamos la configuración por defecto para permitir cerrar dando click fuera
      const bsModal = new bootstrap.Modal(modalElement);
      bsModal.show();

      modalElement.querySelector("#confirmButton").addEventListener("click", () => {
        resolve(true);
        bsModal.hide();
      });

      const cancelHandler = () => {
        resolve(false);
        bsModal.hide();
      };

      modalElement.querySelector("#cancelButton").addEventListener("click", cancelHandler);
      modalElement.querySelector(".btn-close").addEventListener("click", cancelHandler);

      modalElement.addEventListener("hidden.bs.modal", () => {
        modalElement.remove();
      });
    });
  }

  // Método para mostrar un popup informativo (un botón "OK")
  showInfoModal(message) {
    return new Promise((resolve) => {
      const modalTemplate = /*html*/ `
        <div class="modal fade" tabindex="-1" role="dialog">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Information</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <p>${message}</p>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-primary" id="okButton">OK</button>
              </div>
            </div>
          </div>
        </div>
      `;

      const modalWrapper = document.createElement("div");
      modalWrapper.innerHTML = modalTemplate;
      const modalElement = modalWrapper.firstElementChild;
      document.body.appendChild(modalElement);

      const bsModal = new bootstrap.Modal(modalElement);
      bsModal.show();

      const handler = () => {
        resolve();
        bsModal.hide();
      };

      modalElement.querySelector("#okButton").addEventListener("click", handler);
      modalElement.querySelector(".btn-close").addEventListener("click", handler);

      modalElement.addEventListener("hidden.bs.modal", () => {
        modalElement.remove();
      });
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
        <h2>Delete Vehicle</h2>
        <div class="form-group">
          <label for="vehicleSelect">Select the vehicle to delete:</label>
          <select id="vehicleSelect" class="form-control">
            <option value="">Loading vehicles...</option>
          </select>
        </div>
        <button id="deleteBtn" class="btn btn-danger mt-3">Delete</button>
        <button id="cancelDeleteCar" class="btn btn-secondary mt-3">Cancel</button>
      </div>
    `;
  }
}

customElements.define("delete-car-component", DeleteCarComponent);