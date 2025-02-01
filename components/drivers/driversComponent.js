import './createdriverComponent.js';
import './editdriverComponent.js';
import './deletedriverComponent.js';
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
                    <button class="btn btn-primary" id="btnCreateDriver">Create</button>
                    <button class="btn btn-warning" id="btnModifyDriver">Modify</button>
                    <button class="btn btn-danger" id="btnDeleteDriver">Delete</button>
                </div>
                <div id="pilotos-container" class="mt-3 row row-cols-3 g-3"></div>
            </div>
        `;
    }

    async connectedCallback() {
        await this.fetchPilotos();
        this.shadowRoot.querySelector('#search').addEventListener('input', (e) => this.filterPilotos(e.target.value));
        this.shadowRoot.querySelector('#btnCreateDriver').addEventListener('click', () => this.showCreateDriverPopup());
        this.shadowRoot.querySelector('#btnModifyDriver').addEventListener('click', () => this.showEditDriverPopup());
        this.shadowRoot.querySelector('#btnDeleteDriver').addEventListener('click', () => this.showDeleteDriverPopup());
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
}

customElements.define('pilotos-component', PilotosComponent);
