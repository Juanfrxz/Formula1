import './createteamComponent.js'
import './editteamComponent.js'
import './deleteteamComponent.js'
import { getEquipos, getPilotos } from '../../api/fetchApi.js'

class TeamsComponent extends HTMLElement {
    constructor() {
        super();
        this.teams = [];
        this.filteredTeams = [];
        this.pilots = [];
        this.attachShadow({ mode: 'open' });
        
        this.shadowRoot.innerHTML = /*html*/`
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
                /* Se elimina la definición anterior del grid y se usa Bootstrap,
                   además se definen algunos estilos base para las tarjetas */
                .card {
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(174, 2, 2, 0.1);
                    overflow: hidden;
                    transition: box-shadow 0.3s, border-color 0.3s;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    cursor: pointer;
                    /* Tamaño fijo requerido */
                    width: 412px;
                    height: 272px;
                }
                .card:hover {
                    box-shadow: 0 0 15px rgba(174, 2, 2, 0.6);
                    border-color: #AE0202;
                }
                .card img {
                    width: 100%;
                    height: auto;
                    max-height: 60%;
                    object-fit: cover;
                }
                .card-body {
                    padding: 0.5rem;
                }
                .list-container {
                    max-height: 70vh;
                    overflow-y: auto; 
                    overflow-x: hidden;
                    /* Aplicamos la personalización únicamente en Firefox */
                    scrollbar-width: thin;
                    scrollbar-color: rgb(218, 3, 3) auto;
                }
                .list-container::-webkit-scrollbar {
                    width: 8px;
                }
                /* Se elimina la personalización de la pista para que se use la apariencia por defecto */
                /* .list-container::-webkit-scrollbar-track {
                    background: transparent;
                } */
                .list-container::-webkit-scrollbar-thumb {
                    background-color: rgb(218, 3, 3);
                    border-radius: 15px;
                }
                .list-container::-webkit-scrollbar-thumb:hover {
                    background-color: rgb(180, 0, 0);
                }
                /* Nuevo estilo para que las tarjetas realicen wrap */
                #teams-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 20px;
                    justify-content: center;
                }
                /* Estilos para el dropdown manual */
                .dropdown {
                    position: relative;
                }
                .dropdown-menu {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    display: none;
                    background-color: #fff;
                    border: 1px solid rgba(0,0,0,.15);
                    border-radius: 0.25rem;
                    box-shadow: 0 0.5rem 1rem rgba(0,0,0,.175);
                    list-style: none;
                    padding: 0.5rem 0;
                    margin: 0;
                    z-index: 1000;
                }
                .dropdown-menu.show {
                    display: block;
                }
                .dropdown-menu li {
                    padding: 0;
                }
                .dropdown-menu li a {
                    display: block;
                    padding: 0.25rem 1.5rem;
                    color: #212529;
                    text-decoration: none;
                }
                .dropdown-menu li a:hover {
                    background-color: #f8f9fa;
                }
            </style>
            <div class="container">
                <div class="header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h2>Registered Teams</h2>
                        <div class="dropdown">
                            <button class="btn btn-secondary dropdown-toggle" type="button">
                                Options
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" id="create-team" href="#">Create Team</a></li>
                                <li><a class="dropdown-item" id="edit-team" href="#">Modify Team</a></li>
                                <li><a class="dropdown-item" id="delete-team" href="#">Delete Team</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="mt-3">
                        <input type="text" id="search" class="form-control w-100" placeholder="Search team...">
                    </div>
                </div>
                <div class="list-container">
                    <!-- Se elimina la clase "row" y se usa el contenedor flex definido en el CSS -->
                    <div id="teams-container" class="mt-3"></div>
                </div>
            </div>
        `;
    }

    async connectedCallback() {
        await this.fetchEquipos();
        await this.fetchPilotos();

        // Setup dropdown toggle para manejo manual del dropdown
        const dropdownToggle = this.shadowRoot.querySelector('.dropdown-toggle');
        const dropdownMenu = this.shadowRoot.querySelector('.dropdown-menu');
        if (dropdownToggle && dropdownMenu) {
            dropdownToggle.addEventListener('click', (event) => {
                event.preventDefault();
                dropdownMenu.classList.toggle('show');
            });
        }

        // Cerrar el dropdown si se hace clic fuera del componente
        document.addEventListener('click', (event) => {
            if (!this.contains(event.target)) {
                dropdownMenu && dropdownMenu.classList.remove('show');
            }
        });

        // Setup para el input de búsqueda
        this.shadowRoot.querySelector('#search').addEventListener('input', (e) => this.filterTeams(e.target.value));

        // Setup de event listeners para cada opción del dropdown
        this.shadowRoot.querySelector('#create-team').addEventListener('click', (e) => {
            e.preventDefault();
            this.showCreateTeamPopup();
        });
        this.shadowRoot.querySelector('#edit-team').addEventListener('click', (e) => {
            e.preventDefault();
            this.showEditTeamPopup();
        });
        this.shadowRoot.querySelector('#delete-team').addEventListener('click', (e) => {
            e.preventDefault();
            this.showDeleteTeamPopup();
        });

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

    async fetchPilotos() {
        try {
            this.pilots = await getPilotos();
        } catch (error) {
            console.error('Error fetching pilotos:', error);
            this.pilots = [];
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
            card.className = 'card';
            card.innerHTML = /*html*/`
                <h5 class="card-title my-3">${team.nombre}</h5>
                <img src="${team.imagen}" alt="Image of ${team.nombre}">
                <div class="card-body">
                    <!-- Información adicional del equipo si es necesario -->
                </div>
            `;
            card.addEventListener('click', () => this.showTeamDetails(team));
            container.appendChild(card);
        });
    }

    showTeamDetails(team) {
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

        const popup = document.createElement('div');
        popup.style.background = '#fff';
        popup.style.padding = '20px';
        popup.style.borderRadius = '8px';
        popup.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        popup.style.maxWidth = '800px';
        popup.style.width = '90%';
        popup.style.maxHeight = '90vh';
        popup.style.overflowY = 'auto';
        
        popup.style.opacity = '0';
        popup.style.transform = 'scale(0.8)';
        popup.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';

        // Convertir los IDs de pilotos a sus nombres
        const pilotosListHTML =
            Array.isArray(team.pilotos) ?
            team.pilotos
                .map(pilotId => {
                    // Se busca en this.pilots el piloto cuyo id coincida con pilotId.
                    const pilot = this.pilots ? this.pilots.find(p => p.id === pilotId) : null;
                    return `<li>${pilot ? pilot.nombre : pilotId}</li>`;
                })
                .join('') :
            `<li>${team.pilotos || 'No especificado'}</li>`;

        popup.innerHTML = /*html*/`
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 300px;">
                    <img src="${team.imagen}" alt="${team.nombre}" style="width: 100%; height: auto; object-fit: cover; border-radius:8px;">
                </div>
                <div style="flex: 1; min-width: 300px;">
                    <h2>${team.nombre}</h2>
                    <p>
                        <strong>Country:</strong> ${team.pais} 
                        <img src="../source/img/${team.pais.toLowerCase()}.svg" alt="${team.pais} flag" style="width:24px; height:24px; vertical-align: middle;">
                    </p>
                    <p><strong>Engine:</strong> ${team.motor ? team.motor : 'No especificado'}</p>
                    <p><strong>Driver:</strong></p>
                    <ul>${pilotosListHTML}</ul>
                </div>
            </div>
        `;

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        setTimeout(() => {
            popup.style.opacity = '1';
            popup.style.transform = 'scale(1)';
        }, 10);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
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