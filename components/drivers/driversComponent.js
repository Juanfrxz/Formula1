import { getEquipos, getPilotos } from '../../api/fetchApi.js';

class PilotosComponent extends HTMLElement {
    constructor() {
        super();
        this.pilotos = [];
        this.filteredPilotos = [];
        this.attachShadow({ mode: 'open' });
        
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
            <style>
                :host {
                    display: block;
                    width: 100vw;
                    height: 100vh;
                }
                .container {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                .card img {
                    width: 100%;
                    height: auto;
                    border-radius: 8px;
                }
            </style>
            <div class="container mt-3">
                <div class="d-flex justify-content-between align-items-center w-100">
                    <h2>Pilotos Registrados</h2>
                    <input type="text" id="search" class="form-control w-50" placeholder="Buscar piloto...">
                </div>
                <div class="mt-3 d-flex gap-2">
                    <button class="btn btn-primary">Create</button>
                    <button class="btn btn-warning">Modify</button>
                    <button class="btn btn-danger">Delete</button>
                </div>
                <div id="pilotos-container" class="mt-3 row row-cols-3 g-3"></div>
            </div>
        `;
    }

    async connectedCallback() {
        await this.fetchPilotos();
        this.shadowRoot.querySelector('#search').addEventListener('input', (e) => this.filterPilotos(e.target.value));
        this.updatePilotos();
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

    filterPilotos(searchTerm) {
        this.filteredPilotos = this.pilotos.filter(piloto => 
            piloto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.updatePilotos();
    }

    updatePilotos() {
        const container = this.shadowRoot.querySelector('#pilotos-container');
        container.innerHTML = '';
        
        this.filteredPilotos.slice(0, 6).forEach(piloto => {
            const card = document.createElement('div');
            card.className = 'col';
            card.innerHTML = `
                <div class="card p-3 text-center shadow-sm" style="cursor: pointer;">
                    <img src="${piloto.foto}" alt="Foto de ${piloto.nombre}" class="img-fluid">
                    <h5 class="card-title">${piloto.nombre}</h5>
                    <p class="card-text d-none">Equipo: ${piloto.equipo}</p>
                </div>
            `;
            
            const cardText = card.querySelector('.card-text');
            card.addEventListener('mouseover', () => cardText.classList.remove('d-none'));
            card.addEventListener('mouseout', () => cardText.classList.add('d-none'));
            
            container.appendChild(card);
        });
    }
}

customElements.define('pilotos-component', PilotosComponent);
