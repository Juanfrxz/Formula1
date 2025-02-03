import { getCircuitos, deleteCircuito } from '../../api/fetchApi.js';

class DeleteCircuitComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    this.circuits = await getCircuitos();
    this.render();
    this.setupEvents();
  }

  setupEvents() {
    const deleteBtn = this.shadowRoot.getElementById("deleteBtn");
    const cancelBtn = this.shadowRoot.getElementById("cancelDeleteCircuit");

    deleteBtn.addEventListener("click", async () => {
      const circuitSelect = this.shadowRoot.getElementById("circuitSelect");
      const selectedId = circuitSelect.value;
      if (!selectedId) {
        alert("Por favor, seleccione un circuito para eliminar.");
        return;
      }
      if (confirm("¿Está seguro de eliminar el circuito seleccionado?")) {
        try {
          await deleteCircuito(selectedId);
          alert("Circuito eliminado con éxito.");
          this.circuits = await getCircuitos();
          this.populateSelect();
        } catch (error) {
          console.error("Error al eliminar el circuito:", error);
          alert("Error al eliminar el circuito.");
        }
      }
    });

    cancelBtn.addEventListener("click", () => {
      // Lógica para cerrar el modal dinámico, si se requiere
    });
  }

  populateSelect() {
    const circuitSelect = this.shadowRoot.getElementById("circuitSelect");
    circuitSelect.innerHTML =
      `<option value="">Seleccione un circuito</option>` +
      this.circuits.map(circuit => `<option value="${circuit.id}">${circuit.nombre}</option>`).join('');
  }

  render() {
    this.shadowRoot.innerHTML = /*html*/ `
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
      <div class="container">
        <h2 class="mb-4">Eliminar Circuito</h2>
        <div class="mb-3">
          <label for="circuitSelect" class="form-label">Seleccione un circuito:</label>
          <select id="circuitSelect" class="form-select">
            <option value="">Cargando circuitos...</option>
          </select>
        </div>
        <div class="d-flex gap-2">
          <button id="deleteBtn" class="btn btn-danger">Eliminar</button>
          <button id="cancelDeleteCircuit" class="btn btn-secondary">Cancelar</button>
        </div>
      </div>
    `;
    this.populateSelect();
  }
}

customElements.define("delete-circuit-component", DeleteCircuitComponent);
