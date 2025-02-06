import { getEquipos, updateEquipo, getPilotos, deletePiloto } from '../../api/fetchApi.js';

class RacerDeleteComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = /*html*/`
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
            <div class="container p-3">
                <h2>Delete F1 Pilot</h2>
                <div class="mb-3">
                    <label class="form-label">Select Pilot</label>
                    <select id="racer-select" class="form-select"></select>
                </div>
                <button id="delete-racer" class="btn btn-danger">Delete Pilot</button>
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
        
        // Show card-style confirmation modal
        const confirmed = await this.showConfirmationModal(`Are you sure you want to delete pilot ${pilot.nombre}?`);
        if (!confirmed) return;
        
        const teams = await getEquipos();
        const team = teams.find(t => t.id === pilot.equipo);
        
        // If the pilot belongs to a team, remove it from the team's pilot list
        if (team) {
            team.pilotos = team.pilotos.filter(id => id !== pilotId);
            await updateEquipo(team.id, { pilotos: team.pilotos });
        }

        // Delete the pilot
        await deletePiloto(pilotId);
        
        // Show confirmation message (optional)
        const confirmationMessage = this.shadowRoot.querySelector('#confirmation-message');
        confirmationMessage.textContent = `Pilot ${pilot.nombre} deleted successfully.`;
        confirmationMessage.style.display = 'block';
        
        // Reload the pilot <select> list
        await this.loadPilots();
        
        // Emit a general event indicating that a pilot was deleted
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
    // Method that creates and shows a confirmation modal using Bootstrap,
    // and returns a promise that resolves with true if the user confirms, or false if cancels.
    showConfirmationModal(message) {
        return new Promise((resolve) => {
            // Create the modal HTML content
            const modalTemplate = /*html*/`
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

            // Convert the template to a DOM node
            const modalWrapper = document.createElement('div');
            modalWrapper.innerHTML = modalTemplate;
            const modalElement = modalWrapper.firstElementChild;

            // Append the modal to the document body
            document.body.appendChild(modalElement);

            // Instantiate the Bootstrap modal
            const bsModal = new bootstrap.Modal(modalElement, {
                backdrop: 'static', // Prevent closing by clicking outside
                keyboard: false     // Prevent closing with the ESC key
            });
            bsModal.show();

            // Handle click on "Confirm" button
            modalElement.querySelector('#confirmButton').addEventListener('click', () => {
                resolve(true);
                bsModal.hide();
            });

            // Handle click on "Cancel" and the close (X) button
            const cancelHandler = () => {
                resolve(false);
                bsModal.hide();
            };
            modalElement.querySelector('#cancelButton').addEventListener('click', cancelHandler);
            modalElement.querySelector('.btn-close').addEventListener('click', cancelHandler);

            // Once the modal is hidden, remove it from the DOM
            modalElement.addEventListener('hidden.bs.modal', () => {
                modalElement.remove();
            });
        });
    }
}

customElements.define('racer-delete-component', RacerDeleteComponent);
