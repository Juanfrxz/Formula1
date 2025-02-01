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
        
        const teams = await getEquipos();
        const team = teams.find(t => t.id === pilot.equipo);
        
        // Si el piloto pertenece a un equipo, eliminarlo de la lista de corredores
        if (team) {
            team.pilotos = team.pilotos.filter(id => id !== pilotId);
            await updateEquipo(team.id, { pilotos: team.pilotos });
        }

        // Eliminar el piloto
        await deletePiloto(pilotId);
        
        // Confirmación visual
        const confirmationMessage = this.shadowRoot.querySelector('#confirmation-message');
        confirmationMessage.textContent = `Piloto ${pilot.nombre} eliminado correctamente.`;
        confirmationMessage.style.display = 'block';
        
        // Recargar la lista de pilotos
        await this.loadPilots();
    }
}

customElements.define('racer-delete-component', RacerDeleteComponent);
