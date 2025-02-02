import './createteamComponent.js'
import './editteamComponent.js'
import './deleteteamComponent.js'
import { getEquipos, getPilotos } from '../../api/fetchApi.js'

class TeamsComponent extends HTMLElement {
    constructor() {
        super();
        this.teams = [];
        this.filteredTeams = [];
        this.attachShadow({ mode: 'open' });
        
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
            <style>
                :host {
                    display: block;
                }
                .container {
                    width: 100%;
                    padding: 1rem;
                }
                .header {
                    margin-bottom: 1rem;
                }
                /* Uso de CSS Grid para mostrar 3 tarjetas por fila y centrar el contenido */
                .card-container {
                    display: grid;
                    grid-template-columns: repeat(3, 350px);
                    gap: 1rem;
                    justify-content: center;
                }
                /* Estilos de la tarjeta con contenido centrado y sombra personalizada */
                .card {
                    width: 100%;
                    height: 350px;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(174, 2, 2, 0.1); /* Sombra sutil con tinte rojo */
                    overflow: hidden;
                    transition: box-shadow 0.3s, border-color 0.3s;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                }
                .card:hover {
                    box-shadow: 0 0 15px rgba(174, 2, 2, 0.6); /* Sombra más intensa al hacer hover */
                    border-color: #AE0202;
                }
                .card img {
                    width: 100%;
                    height: 200px;
                    object-fit: cover;
                }
                .card-body {
                    padding: 0.5rem;
                }
                .list-container {
                    max-height: 70vh;
                    overflow-y: auto; 
                    overflow-x: hidden; /* Oculta la barra horizontal */
                    
                    /* Estilo para Firefox */
                    scrollbar-width: thin;
                    scrollbar-color: #ccc transparent;
                }
                /* Estilos para navegadores Webkit (Chrome, Safari, Opera) */
                .list-container::-webkit-scrollbar {
                    width: 8px; /* Ancho de la barra vertical */
                }
                .list-container::-webkit-scrollbar-track {
                    background: transparent; /* Fondo transparente en la pista */
                }
                .list-container::-webkit-scrollbar-thumb {
                    background-color: #ccc; /* Color más claro del pulgar */
                    border-radius: 15px;  /* Bordes redondeados */
                }
                .list-container::-webkit-scrollbar-thumb:hover {
                    background-color: #bbb;
                }
            </style>
            <div class="container">
                <div class="header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h2>Equipos Registrados</h2>
                        <input type="text" id="search" class="form-control w-50" placeholder="Buscar equipo...">
                    </div>
                    <div class="mt-3">
                        <button class="btn btn-primary" id="btnCreateTeam">Create</button>
                        <button class="btn btn-warning" id="btnModifyTeam">Modify</button>
                        <button class="btn btn-danger" id="btnDeleteTeam">Delete</button>
                    </div>
                </div>
                <div class="list-container">
                    <div id="teams-container" class="card-container mt-3"></div>
                </div>
            </div>
        `;
    }

    async connectedCallback() {
        await this.fetchEquipos();
        this.shadowRoot.querySelector('#search').addEventListener('input', (e) => this.filterTeams(e.target.value));
        this.shadowRoot.querySelector('#btnCreateTeam').addEventListener('click', () => this.showCreateTeamPopup());
        this.shadowRoot.querySelector('#btnModifyTeam').addEventListener('click', () => this.showEditTeamPopup());
        this.shadowRoot.querySelector('#btnDeleteTeam').addEventListener('click', () => this.showDeleteTeamPopup());
        this.updateTeams();

        // Escuchar el evento general "teamChanged" para actualizar el listado de equipos
        document.addEventListener("teamChanged", (e) => {
            const { action, team } = e.detail;
            if (action === "create") {
                this.teams.push(team);
            } else if (action === "delete") {
                this.teams = this.teams.filter(t => t.id !== team.id);
            } else if (action === "update") {
                this.teams = this.teams.map(t => (t.id === team.id ? team : t));
            }
            this.filteredTeams = [...this.teams];
            this.updateTeams();
        });
    }

    async fetchEquipos() {
        try {
            this.teams = await getEquipos();
            this.filteredTeams = [...this.teams];
            this.updateTeams();
        } catch (error) {
            console.error('Error fetching equipos:', error);
        }
    }

    filterTeams(searchTerm) {
        this.filteredTeams = this.teams.filter(team =>
            team.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.updateTeams();
    }

    updateTeams() {
        const container = this.shadowRoot.querySelector('#teams-container');
        container.innerHTML = '';
        
        this.filteredTeams.forEach(team => {
            const card = document.createElement('div');
            card.className = 'col';
            card.innerHTML = `
                <div class="card p-3" style="cursor: pointer;">
                    <h5 class="card-title" style="margin-bottom: 1rem;">${team.nombre}</h5>
                    <img src="${team.imagen}" alt="Imagen de ${team.nombre}" class="img-fluid">
                </div>
            `;
            container.appendChild(card);
        });
    }

    showCreateTeamPopup() {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '1000';

        const createTeamElement = document.createElement('create-team-component');
        createTeamElement.style.background = '#fff';
        createTeamElement.style.padding = '20px';
        createTeamElement.style.borderRadius = '8px';
        createTeamElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';

        overlay.appendChild(createTeamElement);
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    }

    showEditTeamPopup() {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '1000';

        const editTeamElement = document.createElement('edit-team-component');
        editTeamElement.style.background = '#fff';
        editTeamElement.style.padding = '20px';
        editTeamElement.style.borderRadius = '8px';
        editTeamElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';

        overlay.appendChild(editTeamElement);
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    }

    showDeleteTeamPopup() {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '1000';

        const deleteTeamElement = document.createElement('delete-team-component');
        deleteTeamElement.style.background = '#fff';
        deleteTeamElement.style.padding = '20px';
        deleteTeamElement.style.borderRadius = '8px';
        deleteTeamElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';

        overlay.appendChild(deleteTeamElement);
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    }
}

customElements.define('teams-component', TeamsComponent);