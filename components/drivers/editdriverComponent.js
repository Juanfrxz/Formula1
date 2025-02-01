import { getEquipos, updateEquipo, getPilotos, updatePiloto } from '../../api/fetchApi.js';

class RacerEditComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
            <div class="container p-3">
                <h2>Editar Piloto de F1</h2>
                <div class="mb-3">
                    <label class="form-label">Nombre</label>
                    <select id="name" class="form-select"></select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Equipo</label>
                    <select id="team" class="form-select"></select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Rol</label>
                    <select id="role" class="form-select">
                        <option value="Lider">Líder</option>
                        <option value="Escudero">Escudero</option>
                    </select>
                </div>
                <button id="update-racer" class="btn btn-primary">Actualizar Piloto</button>
                <div id="confirmation-message" class="mt-3 text-success" style="display: none;"></div>
            </div>
        `;
    }

    async connectedCallback() {
        await this.loadTeams();
        await this.loadPilots();
        const pilotId = this.getAttribute('pilot-id');
        if (pilotId) {
            await this.loadPilotData(pilotId);
        }
        this.shadowRoot.querySelector('#update-racer').addEventListener('click', () => this.updateRacer());
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
            this.shadowRoot.querySelector('#name').value = pilot.id;
            this.shadowRoot.querySelector('#team').value = pilot.equipo;
            this.shadowRoot.querySelector('#role').value = pilot.rol;
            this.previousTeam = pilot.equipo; // Guardar el equipo anterior
        }
    }

    async updateRacer() {
        const pilotId = this.shadowRoot.querySelector('#name').value;
        const name = this.shadowRoot.querySelector('#name').selectedOptions[0].text;
        const newTeamId = this.shadowRoot.querySelector('#team').value;
        const role = this.shadowRoot.querySelector('#role').value;
        const confirmationMessage = this.shadowRoot.querySelector('#confirmation-message');
        
        // Actualizar el equipo del piloto primero
        await updatePiloto(pilotId, { nombre: name, equipo: newTeamId, rol: role });
        
        // Obtener la lista actualizada de pilotos y equipos
        const pilots = await getPilotos();
        const teams = await getEquipos();
        
        // Crear un mapa de equipos con los pilotos correctamente asignados
        const updatedTeams = teams.map(team => {
            return {
                ...team,
                pilotos: pilots.filter(pilot => pilot.equipo === team.id).map(pilot => pilot.id)
            };
        });
        
        // Aplicar la actualización a cada equipo
        for (const team of updatedTeams) {
            await updateEquipo(team.id, { pilotos: team.pilotos });
        }

        confirmationMessage.textContent = `Piloto ${name} actualizado correctamente.`;
        confirmationMessage.style.display = 'block';
    }
}

customElements.define('racer-edit-component', RacerEditComponent);
