import { getEquipos, deleteEquipo } from '../api/fetchApi.js';

class DeleteTeamComponent extends HTMLElement {
    constructor() {
        super();
        this.equipos = [];
        this.selectedEquipo = null;
        this.attachShadow({ mode: 'open' });

        this.shadowRoot.innerHTML = /*html*/ `
        <style>
            @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');
        </style>
        <div class="container mt-4">
            <h3 class="mb-3">Eliminar Equipo</h3>
            <select class="form-select mb-3" id="team-select"></select>
            <button class="btn btn-danger" id="delete-button" disabled>Eliminar</button>
            <div id="confirmation-message" class="alert alert-success mt-3" style="display: none;">
                ¡Equipo eliminado correctamente!
            </div>
        </div>
        `;

        // Agregar el modal al DOM principal (fuera del shadowRoot)
        if (!document.querySelector("#confirmModal")) {
            document.body.insertAdjacentHTML("beforeend", `
                <div class="modal fade" id="confirmModal" tabindex="-1" aria-labelledby="confirmModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="confirmModalLabel">Confirmar eliminación</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                ¿Estás seguro de que deseas eliminar este equipo?
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" class="btn btn-danger" id="confirm-delete">Eliminar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        }
    }

    async connectedCallback() {
        await this.fetchEquipos();
        this.shadowRoot.querySelector('#team-select').addEventListener('change', (e) => this.handleSelectChange(e));
        this.shadowRoot.querySelector('#delete-button').addEventListener('click', () => this.showModal());
        document.querySelector('#confirm-delete').addEventListener('click', () => this.handleDelete());
    }

    async fetchEquipos() {
        this.equipos = await getEquipos();
        this.updateDropdown();
    }

    handleSelectChange(event) {
        this.selectedEquipo = event.target.value;
        this.shadowRoot.querySelector('#delete-button').disabled = !this.selectedEquipo;
    }

    showModal() {
        if (this.selectedEquipo) {
            const modal = new bootstrap.Modal(document.querySelector('#confirmModal'));
            modal.show();
        }
    }

    async handleDelete() {
        if (!this.selectedEquipo) return;
        await deleteEquipo(this.selectedEquipo);
        this.showConfirmationMessage();
        await this.fetchEquipos();

        const modalElement = document.querySelector('#confirmModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();
    }

    updateDropdown() {
        const select = this.shadowRoot.querySelector('#team-select');
        select.innerHTML = '<option value="">Seleccione un equipo</option>' +
            this.equipos.map(e => `<option value="${e.id}">${e.nombre}</option>`).join('');
        this.shadowRoot.querySelector('#delete-button').disabled = true;
    }

    showConfirmationMessage() {
        const message = this.shadowRoot.querySelector('#confirmation-message');
        message.style.display = 'block';
        setTimeout(() => {
            message.style.display = 'none';
        }, 3000);
    }
}

customElements.define('delete-team-component', DeleteTeamComponent);
