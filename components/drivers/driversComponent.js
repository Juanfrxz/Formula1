import './createdriverComponent.js';
import './editdriverComponent.js';
import './deletedriverComponent.js';
import { getEquipos, getPilotos } from '../../api/fetchApi.js';

class PilotosComponent extends HTMLElement {
    constructor() {
        super();
        this.pilotos = [];
        this.filteredPilotos = [];
        this.equipos = [];
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
                /* Contenedor para header (título, botones y búsqueda) */
                .header {
                    margin-bottom: 1rem;
                }
                /* Contenedor de tarjetas usando Flex */
                .card-container {
                    display: flex;
                    flex-start:center;
                    flex-wrap: wrap;
                    gap: 1rem;
                    justify-content: center;
                    align-items: center;
                }
                .card {
                    width: 300px; /* ancho fijo */
                    height: 350px; /* alto fijo */
                    overflow: hidden;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(174, 2, 2, 0.1); /* Sombra sutil similar a teamsComponent */
                    transition: box-shadow 0.3s, border-color 0.3s; /* Agregamos transición */
                }
                /* Efecto hover y sombra al estilo teamsComponent */
                .card:hover {
                    box-shadow: 0 0 15px rgba(174, 2, 2, 0.6);
                    border-color: #AE0202;
                }
                .card img {
                    width: 100%;
                    height: 200px;
                    object-fit: cover; /* evita distorsión */
                    border-radius: 8px; /* redondea las esquinas */
                }
                .card-body {
                    padding: 0.5rem;
                }

                .col {
                    flex: 0 0 0%;
                }
                /* Contenedor scrollable con scrollbars personalizados */
                .list-container {
                    max-height: 70vh;
                    overflow-y: auto;
                    overflow-x: hidden; /* Oculta la barra horizontal */
                    
                    /* Estilo para Firefox */
                    scrollbar-width: thin;
                    scrollbar-color: rgb(218, 3, 3) none;
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
                    border-radius: 8px;  /* Bordes redondeados */
                }
                .list-container::-webkit-scrollbar-thumb:hover {
                    background-color: #bbb;
                }
            </style>
            <div class="container">
                <div class="header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h2>Pilotos Registrados</h2>
                        <div>
                            <button class="btn btn-primary" id="btnCreateDriver">Create</button>
                            <button class="btn btn-warning" id="btnModifyDriver">Modify</button>
                            <button class="btn btn-danger" id="btnDeleteDriver">Delete</button>
                        </div>
                    </div>
                    <div class="mt-3">
                        <input type="text" id="search" class="form-control" placeholder="Buscar piloto...">
                    </div>
                </div>
                <!-- Envolvemos el contenedor de tarjetas en un contenedor scrollable -->
                <div class="list-container">
                    <div id="pilotos-container" class="card-container mt-3"></div>
                </div>
            </div>
        `;
    }

    async connectedCallback() {
        await this.fetchPilotos();
        await this.fetchEquipos();
        this.shadowRoot.querySelector('#search').addEventListener('input', (e) => this.filterPilotos(e.target.value));
        this.shadowRoot.querySelector('#btnCreateDriver').addEventListener('click', () => this.showCreateDriverPopup());
        this.shadowRoot.querySelector('#btnModifyDriver').addEventListener('click', () => this.showEditDriverPopup());
        this.shadowRoot.querySelector('#btnDeleteDriver').addEventListener('click', () => this.showDeleteDriverPopup());
        this.updatePilotos();

        document.addEventListener("pilotoChanged", (e) => {
            const { action, pilot } = e.detail;
            if (action === "create") {
                this.pilotos.push(pilot);
            } else if (action === "delete") {
                this.pilotos = this.pilotos.filter(p => p.id !== pilot.id);
            } else if (action === "update") {
                this.pilotos = this.pilotos.map(p => (p.id === pilot.id ? pilot : p));
            }
            this.filteredPilotos = [...this.pilotos];
            this.updatePilotos();
        });
    }

    async fetchPilotos() {
        try {
            this.pilotos = await getPilotos();
            this.filteredPilotos = [...this.pilotos];
            this.updatePilotos();
        } catch (error) {
            console.error('Error fetching pilotos:', error);
        }
    }

    async fetchEquipos() {
        try {
            this.equipos = await getEquipos();
        } catch (error) {
            console.error("Error fetching equipos:", error);
            this.equipos = [];
        }
    }

    filterPilotos(searchTerm) {
        this.filteredPilotos = this.pilotos.filter(piloto => 
            piloto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.updatePilotos();
    }

    updatePilotos() {
        const container = this.shadowRoot.querySelector('#pilotos-container');
        container.innerHTML = '';
        
        this.filteredPilotos.forEach(piloto => {
            const card = document.createElement('div');
            card.className = 'col';
            card.innerHTML = /*html*/`
                <div class="card p-3 text-center" style="cursor: pointer;">
                    <img src="${piloto.foto}" alt="Foto de ${piloto.nombre}" class="img-fluid" style="height:260px; object-fit: cover;">
                    <h5 class="card-title" style="margin-top:1rem;">${piloto.nombre}</h5>
                    <p><strong>Equipo:</strong> ${this.equipos.find(e => e.id === piloto.equipo)?.nombre || 'Equipo no encontrado'}</p>
                </div>
            `;
            
            card.addEventListener('click', () => {
                this.showDriverDetails(piloto);
            });
            
            container.appendChild(card);
        });
    }

    showCreateDriverPopup() {
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

        const createDriverElement = document.createElement('racer-create-component');
        createDriverElement.style.background = '#fff';
        createDriverElement.style.padding = '20px';
        createDriverElement.style.borderRadius = '8px';
        createDriverElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';

        overlay.appendChild(createDriverElement);
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    }

    showEditDriverPopup() {
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

        const editDriverElement = document.createElement('racer-edit-component');
        editDriverElement.style.background = '#fff';
        editDriverElement.style.padding = '20px';
        editDriverElement.style.borderRadius = '8px';
        editDriverElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';

        overlay.appendChild(editDriverElement);
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    }

    showDeleteDriverPopup() {
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

        const deleteDriverElement = document.createElement('racer-delete-component');
        deleteDriverElement.style.background = '#fff';
        deleteDriverElement.style.padding = '20px';
        deleteDriverElement.style.borderRadius = '8px';
        deleteDriverElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';

        overlay.appendChild(deleteDriverElement);
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    }

    async showDriverDetails(driver) {
        // Crear overlay para el popup
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

        // Crear la carta con estilos personalizados
        const card = document.createElement('div');
        card.style.background = '#fff';
        card.style.padding = '20px';
        card.style.borderRadius = '8px';
        card.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        card.style.maxWidth = '400px';
        card.style.width = '90%';
        card.style.minHeight = '500px';
        card.style.textAlign = 'center';

        // Configurar estado inicial para la animación (fade in + scale)
        card.style.opacity = '0';
        card.style.transform = 'scale(0.8)';
        card.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';

        // Obtener el nombre del equipo usando la función getEquipos
        let teamName = '';
        try {
            const equipos = await getEquipos();
            const equipoFound = equipos.find(equipo => equipo.id === driver.equipo);
            teamName = equipoFound ? equipoFound.nombre : 'Equipo no encontrado';
        } catch (error) {
            console.error("Error fetching equipos:", error);
            teamName = 'Error obteniendo equipo';
        }

        // Incluir el contenido en la carta
        card.innerHTML = /*html*/`
            <h2 style="text-align: center;">${driver.nombre}</h2>
            <img src="${driver.foto}" alt="Foto de ${driver.nombre}" style="width:100%; max-height:350px; object-fit:cover; border-radius:8px; margin: 10px 0;">
            <p><strong>Equipo:</strong> ${teamName}</p>
            <p><strong>Rol:</strong> ${driver.rol ? driver.rol : 'Rol no especificado'}</p>
            <p><strong>Estadísticas acumuladas hasta 2024:</strong></p>
            <ul style="list-style: none; padding: 0;">
                <li><strong>Victorias:</strong> ${driver.stats.Victorias}</li>
                <li><strong>Podios:</strong> ${driver.stats.Podios}</li>
                <li><strong>Pole Positions:</strong> ${driver.stats.Pole_positions}</li>
            </ul>
        `;

        overlay.appendChild(card);
        document.body.appendChild(overlay);

        // Forzar el reflow y luego iniciar la animación
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
        }, 10);

        // Cerrar el popup al hacer clic fuera de la carta
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    }
}

customElements.define('pilotos-component', PilotosComponent);
