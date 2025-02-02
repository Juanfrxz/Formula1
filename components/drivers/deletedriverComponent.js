import { getEquipos, updateEquipo, getPilotos, deletePiloto } from '../../api/fetchApi.js';

class RacerDeleteComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
            <div class="container p-3">
                <h2>Eliminar Piloto de F1</h2>
                <div class="mb-3">
                    <label class="form-label">Seleccionar Piloto</label>
                    <select id="racer-select" class="form-select"></select>
                </div>
                <button id="delete-racer" class="btn btn-danger">Eliminar Piloto</button>
                <div id="confirmation-message" class="mt-3 text-success" style="display: none;"></div>
            </div>
        `;
    }

    async connectedCallback() {
        await this.loadPilots();
        this.shadowRoot.querySelector('#delete-racer').addEventListener('click', () => this.deleteRacer());
    }

    async loadPilots() {
        const pilots = await getPilotos();
        const select = this.shadowRoot.querySelector('#racer-select');
        select.innerHTML = '';
        pilots.forEach(pilot => {
            const option = document.createElement('option');
            option.value = pilot.id;
            option.textContent = pilot.nombre;
            select.appendChild(option);
        });
    }

    async deleteRacer() {
        const pilotId = this.shadowRoot.querySelector('#racer-select').value;
        if (!pilotId) return;
        
        const pilots = await getPilotos();
        const pilot = pilots.find(p => p.id === pilotId);
        if (!pilot) return;
        
        // Mostrar modal de confirmación estilo tarjeta
        const confirmed = await this.showConfirmationModal(`¿Estás seguro de que deseas eliminar al piloto ${pilot.nombre}?`);
        if (!confirmed) return;
        
        const teams = await getEquipos();
        const team = teams.find(t => t.id === pilot.equipo);
        
        // Si el piloto pertenece a un equipo, eliminarlo de la lista de corredores
        if (team) {
            team.pilotos = team.pilotos.filter(id => id !== pilotId);
            await updateEquipo(team.id, { pilotos: team.pilotos });
        }

        // Eliminar el piloto
        await deletePiloto(pilotId);
        
        // Mostrar mensaje de confirmación visual (opcional)
        const confirmationMessage = this.shadowRoot.querySelector('#confirmation-message');
        confirmationMessage.textContent = `Piloto ${pilot.nombre} eliminado correctamente.`;
        confirmationMessage.style.display = 'block';
        
        // Recargar la lista de pilotos (para el <select> interno)
        await this.loadPilots();
        
        // Emitir evento general indicando que se eliminó un piloto
        this.dispatchEvent(new CustomEvent("pilotoChanged", {
            bubbles: true,
            detail: {
                action: "delete",
                pilot: { id: pilotId, nombre: pilot.nombre }
            }
        }));
    }

    // Método que crea y muestra un modal de confirmación utilizando Bootstrap,
    // y retorna una promesa que se resuelve con true si el usuario confirma, false si cancela.
    showConfirmationModal(message) {
        return new Promise((resolve) => {
            // Crear el contenido HTML del modal
            const modalTemplate = `
                <div class="modal fade" tabindex="-1" role="dialog">
                    <div class="modal-dialog modal-dialog-centered" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Confirmación</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <p>${message}</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" id="cancelButton">Cancelar</button>
                                <button type="button" class="btn btn-primary" id="confirmButton">Confirmar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Convertir el template a un nodo DOM
            const modalWrapper = document.createElement('div');
            modalWrapper.innerHTML = modalTemplate;
            const modalElement = modalWrapper.firstElementChild;

            // Agregar el modal al body del documento
            document.body.appendChild(modalElement);

            // Instanciar el modal de Bootstrap
            const bsModal = new bootstrap.Modal(modalElement, {
                backdrop: 'static', // Evita que se cierre al hacer click fuera
                keyboard: false     // Evita que se cierre con la tecla ESC
            });
            bsModal.show();

            // Manejar clic en "Confirmar"
            modalElement.querySelector('#confirmButton').addEventListener('click', () => {
                resolve(true);
                bsModal.hide();
            });

            // Manejar clic en "Cancelar" y el cierre con el botón de la X
            const cancelHandler = () => {
                resolve(false);
                bsModal.hide();
            };
            modalElement.querySelector('#cancelButton').addEventListener('click', cancelHandler);
            modalElement.querySelector('.btn-close').addEventListener('click', cancelHandler);

            // Una vez que el modal se oculta, removerlo del DOM
            modalElement.addEventListener('hidden.bs.modal', () => {
                modalElement.remove();
            });
        });
    }
}

customElements.define('racer-delete-component', RacerDeleteComponent);
