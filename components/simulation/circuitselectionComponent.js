import { getCircuitos } from '../../api/fetchApi.js';

class CircuitSelectionComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.circuits = [];
        this.filteredCircuits = [];

        this.shadowRoot.innerHTML = `
            <!-- Bootstrap CSS -->
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
            <style>
                :host {
                    display: block;
                    padding: 20px;
                }
                .container {
                    margin-top: 1rem;
                }
                .card {
                    margin: 10px;
                }
                .card img {
                    width: 100%;
                    height: auto;
                }
                .list-container {
                    max-height: 70vh;
                    overflow-y: auto;
                    overflow-x: hidden;
                    scrollbar-width: thin;
                    scrollbar-color: #ccc transparent;
                }
                .list-container::-webkit-scrollbar {
                    width: 8px;
                }
                .list-container::-webkit-scrollbar-track {
                    background: transparent;
                }
                .list-container::-webkit-scrollbar-thumb {
                    background-color: #ccc;
                    border-radius: 8px;
                }
                .list-container::-webkit-scrollbar-thumb:hover {
                    background-color: #bbb;
                }
            </style>
            <div class="container">
                <h2>Select a Circuit</h2>
                <input type="text" id="search" class="form-control my-3" placeholder="Search circuit...">
                <div class="list-container">
                    <div id="circuits-list" class="row"></div>
                </div>
            </div>
        `;
    }

    async connectedCallback() {
        // Load circuits and attach search event
        await this.loadCircuits();
        const searchInput = this.shadowRoot.getElementById('search');
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            this.filteredCircuits = this.circuits.filter(circuit =>
                circuit.nombre.toLowerCase().includes(query) ||
                circuit.pais.toLowerCase().includes(query)
            );
            this.updateCircuits();
        });
    }

    async loadCircuits() {
        try {
            this.circuits = await getCircuitos();
            this.filteredCircuits = [...this.circuits];
            this.updateCircuits();
        } catch (error) {
            console.error('Error loading circuits:', error);
        }
    }

    updateCircuits() {
        const container = this.shadowRoot.getElementById('circuits-list');
        container.innerHTML = '';
        this.filteredCircuits.forEach(circuit => {
            const cardWrapper = document.createElement('div');
            cardWrapper.classList.add('col-md-6', 'mb-3');

            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = `
                <img src="${circuit.imagen}" alt="${circuit.nombre}" class="card-img-top">
                <div class="card-body">
                    <h5 class="card-title">${circuit.nombre}</h5>
                    <p class="card-text">${circuit.pais}</p>
                    <button class="btn btn-primary select-button">Select</button>
                </div>
            `;

            // Add click event on the select button
            const selectButton = card.querySelector('.select-button');
            selectButton.addEventListener('click', () => this.selectCircuit(circuit));

            cardWrapper.appendChild(card);
            container.appendChild(cardWrapper);
        });
    }

    selectCircuit(circuit) {
        // Dispatch a custom event with the circuit's data
        const event = new CustomEvent('circuitSelected', {
            detail: circuit,
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(event);
        console.log("Selected circuit with id:", circuit.id);
    }
}

customElements.define('circuit-selection-component', CircuitSelectionComponent);
