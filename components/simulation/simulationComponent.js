import './circuitselectionComponent.js';
import './teamselectionComponent.js';
import './driverselectionComponent.js';
import './cartuningComponent.js';
import './classificationStartComponent.js';
import { addPartida, updatePartida } from '../../api/fetchApi.js';

class SimulationComponent extends HTMLElement {
    constructor() {
        super();
        this.selectedPista = null;
        this.selectedTeam = null;
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = /*html*/`
            <!-- Bootstrap CSS -->
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
            <style>
                :host {
                    display: block;
                    height: 90vh;
                    width: 100vw;
                }
                .container {
                    display: flex;
                    height: 100%;
                    width: 100%;
                }
                .sidebar {
                    width: 250px;
                    background-color: #1E1E1E;
                    padding: 2rem 1rem;
                    height: 100%;
                    position: fixed;
                    left: 0;
                    transition: all 0.3s ease;
                    box-shadow: 2px 0 5px rgba(0,0,0,0.2);
                }
                .nav-link {
                    color: #FFFFFF;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    margin-bottom: 0.5rem;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                }
                .nav-link:hover {
                    background-color: #FF1E1E;
                    color: white;
                    transform: translateX(5px);
                }
                .nav-link.active {
                    background-color: #E10600;
                    color: white;
                }
                .nav-link i {
                    margin-right: 10px;
                    width: 20px;
                    text-align: center;
                    color: #FF1E1E;
                }
                .nav-link:hover i,
                .nav-link.active i {
                    color: white;
                }
                .content {
                    margin-left: 250px;
                    padding: 2rem;
                    transition: all 0.3s ease;
                    background-color: #F8F9FA;
                }
                @media (min-width: 1400px) {
                    .container{
                        min-width: 100%;
                    }
                }
            </style>
            <div class="container">
                <div class="sidebar">
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <a class="nav-link" id="trackSelection" href="#">
                                <i class="fas fa-road"></i>
                                Track Selection
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="teamSelection" href="#">
                                <i class="fas fa-users"></i>
                                Team Selection
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="driverSelection" href="#">
                                <i class="fas fa-user-astronaut"></i>
                                Driver Selection
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="carTuning" href="#">
                                <i class="fas fa-cogs"></i>
                                Car Tuning
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="classificationStart" href="#">
                                <i class="fas fa-flag-checkered"></i>
                                Inicio de Clasificación
                            </a>
                        </li>
                    </ul>
                </div>
                <div class="content" id="content-area">
                    <p>Select an option from the menu on the left.</p>
                </div>
            </div>
        `;
    }

    setActiveLink(linkId) {
        // Remover la clase active de todos los links
        this.shadowRoot.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        // Agregar la clase active al link seleccionado
        const activeLink = this.shadowRoot.getElementById(linkId);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    connectedCallback() {
        this.shadowRoot.querySelector('#trackSelection')
            .addEventListener('click', (e) => {
                e.preventDefault();
                this.setActiveLink('trackSelection');
                this.loadTrackSelection();
            });
        this.shadowRoot.querySelector('#teamSelection')
            .addEventListener('click', (e) => {
                e.preventDefault();
                this.setActiveLink('teamSelection');
                this.loadTeamSelection();
            });
        this.shadowRoot.querySelector('#driverSelection')
            .addEventListener('click', (e) => {
                e.preventDefault();
                this.setActiveLink('driverSelection');
                this.loadDriverSelection();
            });
        this.shadowRoot.querySelector('#carTuning')
            .addEventListener('click', (e) => {
                e.preventDefault();
                this.setActiveLink('carTuning');
                this.loadCarTuning();
            });
        this.shadowRoot.querySelector('#classificationStart')
            .addEventListener('click', (e) => {
                e.preventDefault();
                this.setActiveLink('classificationStart');
                this.loadClassificationStart();
            });
        this.initializePartida();
    }

    loadTrackSelection() {
        const contentArea = this.shadowRoot.getElementById('content-area');
        contentArea.innerHTML = '';
        const circuitSelection = document.createElement('circuit-selection-component');

        circuitSelection.addEventListener('circuitSelected', async (event) => {
            console.log("Evento 'circuitSelected' recibido:", event.detail);
            this.selectedPista = event.detail.id;
            const nuevaPista = [{
                pistaSeleccionada: this.selectedPista,
                modo: event.detail.modo || 'seco'
            }];
            console.log("ID de partida antes de actualizar pista:", this.partidaId);
            try {
                const updateResult = await updatePartida(this.partidaId, { pista: nuevaPista });
                console.log("Partida actualizada con la pista:", updateResult);
            } catch (err) {
                console.error("Error actualizando pista en la partida:", err);
            }
            this.dispatchEvent(
                new CustomEvent('pista-selected', {
                    detail: { id: this.selectedPista, modo: nuevaPista[0].modo },
                    bubbles: true,
                    composed: true
                })
            );
        });

        contentArea.appendChild(circuitSelection);
    }

    loadTeamSelection() {
        const contentArea = this.shadowRoot.getElementById('content-area');
        contentArea.innerHTML = '';
        const teamSelection = document.createElement('team-selection-component');

        teamSelection.addEventListener('teamSelected', async (event) => {
            console.log("Evento 'teamSelected' recibido:", event.detail);
            this.selectedTeam = event.detail.id;
            console.log("ID de partida antes de actualizar equipo:", this.partidaId);
            try {
                const updateResult = await updatePartida(this.partidaId, {
                    equipo: { id: this.selectedTeam, driver: "" }
                });
                console.log("Partida actualizada con el equipo:", updateResult);
            } catch (err) {
                console.error("Error actualizando equipo en la partida:", err);
            }
        });

        contentArea.appendChild(teamSelection);
    }

    loadDriverSelection() {
        const contentArea = this.shadowRoot.getElementById('content-area');
        contentArea.innerHTML = '';
        const driverSelection = document.createElement('driverselection-component');
        if (this.selectedTeam) {
            driverSelection.setAttribute('team', this.selectedTeam);
        }
        driverSelection.addEventListener('driverSelected', async (event) => {
            console.log("Evento 'driverSelected' recibido:", event.detail);
            const selectedDriverId = event.detail.driver.id;
            try {
                const updateResult = await updatePartida(this.partidaId, {
                    equipo: { id: this.selectedTeam, driver: selectedDriverId }
                });
                console.log("Partida actualizada con el driver:", updateResult);
            } catch (err) {
                console.error("Error actualizando driver en la partida:", err);
            }
        });
        contentArea.appendChild(driverSelection);
    }

    loadCarTuning() {
        const contentArea = this.shadowRoot.getElementById('content-area');
        contentArea.innerHTML = '';
        if (!this.selectedTeam) {
            contentArea.innerHTML = `<div class="alert alert-warning">Por favor, seleccione un equipo antes de acceder a Car Tuning.</div>`;
            return;
        }
        const carTuning = document.createElement('car-tuning');
        carTuning.setAttribute('equipo', this.selectedTeam);
        if (this.partidaId) {
            carTuning.setAttribute('partida', this.partidaId);
        }
        contentArea.appendChild(carTuning);
    }

    loadClassificationStart() {
        const contentArea = this.shadowRoot.getElementById('content-area');
        contentArea.innerHTML = '';
        const classificationComponent = document.createElement('classification-start-component');
        if (this.partidaId) {
            classificationComponent.setAttribute('partida', this.partidaId);
        }
        contentArea.appendChild(classificationComponent);
    }

    async initializePartida() {
        const partidaId = 'partida' + Date.now().toString(16);
        const modos = ['seco', 'lluvioso', 'extremo'];
        const randomModo = modos[Math.floor(Math.random() * modos.length)];

        const pistaObject = {
            pistaSeleccionada: this.selectedPista || null,
            modo: randomModo
        };

        const equipoObject = {
            id: this.selectedTeam || null,
            driver: ""
        };

        const partida = {
            id: partidaId,
            pista: [pistaObject],
            equipo: equipoObject
        };

        try {
            const result = await addPartida(partida);
            this.partidaId = partidaId;
            console.log("Partida creada:", result);
        } catch (error) {
            console.error("Error al crear partida:", error);
        }
    }
}

customElements.define('simulation-component', SimulationComponent);
