import { getEquipos, updateEquipo, getPilotos, updatePiloto } from '../../api/fetchApi.js';

class RacerEditComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = /*html*/`
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
            <div class="container p-3">
                <h2>Edit F1 Pilot</h2>
                <div class="mb-3">
                    <label class="form-label">Name</label>
                    <select id="name" class="form-select"></select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Team</label>
                    <select id="team" class="form-select"></select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Role</label>
                    <select id="role" class="form-select">
                        <option value="Lider">Leader</option>
                        <option value="Escudero">Second Driver</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Pilot Image</label>
                    <input type="text" id="foto" class="form-control" placeholder="Enter image URL" />
                </div>
                <button id="update-racer" class="btn btn-primary">Update Pilot</button>
                <div id="confirmation-message" class="mt-3 text-success" style="display: none;"></div>
            </div>
        `;
    }

    async connectedCallback() {
        await this.loadTeams();
        await this.loadPilots();

        // Si se pasó el atributo 'pilot-id', cargamos la información inicial del piloto
        const pilotId = this.getAttribute('pilot-id');
        if (pilotId) {
            await this.loadPilotData(pilotId);
        }

        this.shadowRoot.querySelector('#update-racer').addEventListener('click', () => this.updateRacer());

        // Agregamos listener para que, al cambiar el piloto en el select 'name', se actualicen los campos correspondientes
        this.shadowRoot.querySelector('#name').addEventListener('change', () => {
            const selectedPilotId = this.shadowRoot.querySelector('#name').value;
            this.loadPilotData(selectedPilotId);
        });
    }

    async loadTeams() {
        const teams = await getEquipos();
        const select = this.shadowRoot.querySelector('#team');
        teams.forEach(team => {
            const option = document.createElement('option');
            option.value = team.id;
            option.textContent = team.nombre;
            select.appendChild(option);
        });
    }

    async loadPilots() {
        const pilots = await getPilotos();
        const select = this.shadowRoot.querySelector('#name');
        pilots.forEach(pilot => {
            const option = document.createElement('option');
            option.value = pilot.id;
            option.textContent = pilot.nombre;
            select.appendChild(option);
        });
    }

    async loadPilotData(pilotId) {
        const pilots = await getPilotos();
        const pilot = pilots.find(p => p.id === pilotId);
        if (pilot) {
            // Actualizamos los campos con la información ya registrada del piloto
            this.shadowRoot.querySelector('#name').value = pilot.id;
            this.shadowRoot.querySelector('#team').value = pilot.equipo;
            this.shadowRoot.querySelector('#role').value = pilot.rol;
            this.shadowRoot.querySelector('#foto').value = pilot.foto || '';
            this.previousTeam = pilot.equipo; // Guardamos el equipo anterior si es necesario
        }
    }

    async updateRacer() {
        const pilotId = this.shadowRoot.querySelector('#name').value;
        const name = this.shadowRoot.querySelector('#name').selectedOptions[0].text;
        const newTeamId = this.shadowRoot.querySelector('#team').value;
        const role = this.shadowRoot.querySelector('#role').value;
        const foto = this.shadowRoot.querySelector('#foto').value;
        const confirmationMessage = this.shadowRoot.querySelector('#confirmation-message');
        
        // Actualizamos el piloto incluyendo la foto
        await updatePiloto(pilotId, { nombre: name, equipo: newTeamId, rol: role, foto: foto });
        
        // Obtenemos la lista actualizada de pilotos y equipos y actualizamos los equipos
        const pilots = await getPilotos();
        const teams = await getEquipos();
        const updatedTeams = teams.map(team => ({
            ...team,
            pilotos: pilots.filter(pilot => pilot.equipo === team.id).map(pilot => pilot.id)
        }));
        for (const team of updatedTeams) {
            await updateEquipo(team.id, { pilotos: team.pilotos });
        }

        confirmationMessage.textContent = `Pilot ${name} updated successfully.`;
        confirmationMessage.style.display = 'block';
        
        // Emitir evento general indicando que se actualizó un piloto
        this.dispatchEvent(new CustomEvent("pilotoChanged", {
            bubbles: true,
            detail: {
                action: "update",
                pilot: { id: pilotId, nombre: name, equipo: newTeamId, rol: role, foto: foto }
            }
        }));
    }
}

customElements.define('racer-edit-component', RacerEditComponent);
