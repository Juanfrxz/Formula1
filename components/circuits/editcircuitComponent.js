import { getCircuitos, updateCircuito } from '../../api/fetchApi.js';

class EditCircuitComponent extends HTMLElement {
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
    const form = this.shadowRoot.getElementById('circuitForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const updatedCircuit = this.getFormData();
      try {
        await updateCircuito(updatedCircuit.id, updatedCircuit);
        alert("Circuito actualizado con éxito");
        // Aquí se podría emitir un evento para que el modal se cierre
      } catch (error) {
        console.error("Error al actualizar circuito:", error);
      }
    });

    const cancelBtn = this.shadowRoot.getElementById('cancelEditCircuit');
    cancelBtn.addEventListener('click', () => {
      // Lógica para cerrar el modal dinámico, si se requiere
    });

    const circuitSelect = this.shadowRoot.getElementById('circuitSelect');
    circuitSelect.addEventListener("change", async (e) => {
      const selectedId = e.target.value;
      if (selectedId) {
        this.loadCircuitData(selectedId);
      }
    });
  }

  loadCircuitData(id) {
    this.circuitData = this.circuits.find(circuit => circuit.id === id);
    this.populateForm();
  }

  populateForm() {
    if (!this.circuitData) return;
    this.shadowRoot.getElementById("nombre").value = this.circuitData.nombre;
    this.shadowRoot.getElementById("pais").value = this.circuitData.pais;
    this.shadowRoot.getElementById("longitud_km").value = this.circuitData.longitud_km;
    this.shadowRoot.getElementById("vueltas").value = this.circuitData.vueltas;
    this.shadowRoot.getElementById("descripcion").value = this.circuitData.descripcion;
    this.shadowRoot.getElementById("imagen").value = this.circuitData.imagen;
    this.shadowRoot.getElementById("imagen_detail").value = this.circuitData.imagen_detail;
  }

  getFormData() {
    const id = this.shadowRoot.getElementById('circuitSelect').value || (this.circuitData && this.circuitData.id);
    return {
      id,
      nombre: this.shadowRoot.getElementById('nombre').value,
      pais: this.shadowRoot.getElementById('pais').value,
      longitud_km: parseFloat(this.shadowRoot.getElementById('longitud_km').value),
      vueltas: parseInt(this.shadowRoot.getElementById('vueltas').value),
      descripcion: this.shadowRoot.getElementById('descripcion').value,
      imagen: this.shadowRoot.getElementById('imagen').value,
      imagen_detail: this.shadowRoot.getElementById('imagen_detail').value
    };
  }

  render() {
    this.shadowRoot.innerHTML = /*html*/ `
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
      <div class="container">
        <h2 class="mb-4">Editar Circuito</h2>
        <div class="mb-3">
          <label for="circuitSelect" class="form-label">Seleccione Circuito:</label>
          <select id="circuitSelect" class="form-select">
            <option value="">Seleccione un circuito</option>
            ${this.circuits.map(circuit => `<option value="${circuit.id}">${circuit.nombre}</option>`).join('')}
          </select>
        </div>
        <form id="circuitForm">
          <div class="mb-3">
            <label for="nombre" class="form-label">Nombre:</label>
            <input type="text" id="nombre" class="form-control" required>
          </div>
          <div class="mb-3">
            <label for="pais" class="form-label">País:</label>
            <input type="text" id="pais" class="form-control" required>
          </div>
          <div class="mb-3">
            <label for="longitud_km" class="form-label">Longitud (km):</label>
            <input type="number" id="longitud_km" class="form-control" step="0.1" required>
          </div>
          <div class="mb-3">
            <label for="vueltas" class="form-label">Vueltas:</label>
            <input type="number" id="vueltas" class="form-control" required>
          </div>
          <div class="mb-3">
            <label for="descripcion" class="form-label">Descripción:</label>
            <textarea id="descripcion" class="form-control"></textarea>
          </div>
          <div class="mb-3">
            <label for="imagen" class="form-label">Imagen (URL):</label>
            <input type="text" id="imagen" class="form-control">
          </div>
          <div class="mb-3">
            <label for="imagen_detail" class="form-label">Imagen Detallada (URL):</label>
            <input type="text" id="imagen_detail" class="form-control">
          </div>
          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary">Actualizar</button>
            <button type="button" id="cancelEditCircuit" class="btn btn-secondary">Cancelar</button>
          </div>
        </form>
      </div>
    `;
  }
}

customElements.define("edit-circuit-component", EditCircuitComponent);
