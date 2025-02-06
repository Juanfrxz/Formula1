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
        this.shadowRoot.innerHTML = `
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
                    width: 200px;
                    background-color: #f8f9fa;
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                .content {
                    flex: 1;
                    padding: 1rem;
                    overflow-y: auto;
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
                            <a class="nav-link" id="trackSelection" href="#">Track Selection</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="teamSelection" href="#">Team Selection</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="driverSelection" href="#">Driver Selection</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="carTuning" href="#">Car Tuning</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="classificationStart" href="#">Inicio de Clasificación</a>
                        </li>
                    </ul>
                </div>
                <div class="content" id="content-area">
                    <p>Select an option from the menu on the left.</p>
                </div>
            </div>
        `;
    }

    connectedCallback() {
        this.shadowRoot.querySelector('#trackSelection')
            .addEventListener('click', (e) => {
                e.preventDefault();
                this.loadTrackSelection();
            });
        this.shadowRoot.querySelector('#teamSelection')
            .addEventListener('click', (e) => {
                e.preventDefault();
                this.loadTeamSelection();
            });
        this.shadowRoot.querySelector('#driverSelection')
            .addEventListener('click', (e) => {
                e.preventDefault();
                this.loadDriverSelection();
            });
        this.shadowRoot.querySelector('#carTuning')
            .addEventListener('click', (e) => {
                e.preventDefault();
                this.loadCarTuning();
            });
        this.shadowRoot.querySelector('#classificationStart')
            .addEventListener('click', (e) => {
                e.preventDefault();
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
