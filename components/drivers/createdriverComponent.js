import { getEquipos, updateEquipo, addPiloto, getPilotos } from '../../api/fetchApi.js';

class RacerCreateComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = /*html*/`
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
            <div class="container p-3">
                <h2>Create F1 Driver</h2>
                <div class="mb-3">
                    <label class="form-label">Name</label>
                    <input type="text" id="name" class="form-control" />
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
                    <label class="form-label">Driver Image</label>
                    <input type="text" id="foto" class="form-control" placeholder="Enter image URL" />
                </div>
                <button id="create-racer" class="btn btn-primary">Create Driver</button>
                <div id="confirmation-message" class="mt-3 text-success" style="display: none;"></div>
            </div>
        `;
    }

    async connectedCallback() {
        await this.loadTeams();
        this.shadowRoot.querySelector('#create-racer').addEventListener('click', () => this.createRacer());
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

    async createRacer() {
        const name = this.shadowRoot.querySelector('#name').value;
        const teamId = this.shadowRoot.querySelector('#team').value;
        const role = this.shadowRoot.querySelector('#role').value;
        const foto = this.shadowRoot.querySelector('#foto').value;
        const confirmationMessage = this.shadowRoot.querySelector('#confirmation-message');

        const pilots = await getPilotos();
        const lastId = pilots.length > 0 ? pilots[pilots.length - 1].id : 0;
        const newId = (parseInt(lastId) + 1).toString();

        const newPilot = { id: newId, nombre: name, equipo: teamId, rol: role, foto: foto, stats:[] };
        await addPiloto(newPilot);

        const teams = await getEquipos();
        const team = teams.find(team => team.id === teamId);
        team.pilotos = team.pilotos ? [...team.pilotos, newId] : [newId];
        await updateEquipo(teamId, { pilotos: team.pilotos });

        confirmationMessage.textContent = `Driver ${name} has been successfully added to the team.`;
        confirmationMessage.style.display = 'block';

        // Emit a general event indicating a driver was created
        this.dispatchEvent(new CustomEvent("pilotoChanged", {
            bubbles: true,
            detail: {
                action: "create",
                pilot: newPilot
            }
        }));
    }
}

customElements.define('racer-create-component', RacerCreateComponent);
