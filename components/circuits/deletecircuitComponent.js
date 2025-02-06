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
        alert("Please select a circuit to delete.");
        return;
      }
      if (confirm("Are you sure you want to delete the selected circuit?")) {
        try {
          await deleteCircuito(selectedId);
          alert("Circuit deleted successfully.");
          this.circuits = await getCircuitos();
          this.populateSelect();
        } catch (error) {
          console.error("Error deleting the circuit:", error);
          alert("Error deleting the circuit.");
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
      `<option value="">Select a circuit</option>` +
      this.circuits.map(circuit => `<option value="${circuit.id}">${circuit.nombre}</option>`).join('');
  }

  render() {
    this.shadowRoot.innerHTML = /*html*/ `
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
      <div class="container">
        <h2 class="mb-4">Delete Circuit</h2>
        <div class="mb-3">
          <label for="circuitSelect" class="form-label">Select a circuit:</label>
          <select id="circuitSelect" class="form-select">
            <option value="">Loading circuits...</option>
          </select>
        </div>
        <div class="d-flex gap-2">
          <button id="deleteBtn" class="btn btn-danger">Delete</button>
          <button id="cancelDeleteCircuit" class="btn btn-secondary">Cancel</button>
        </div>
      </div>
    `;
    this.populateSelect();
  }
}

customElements.define("delete-circuit-component", DeleteCircuitComponent);
