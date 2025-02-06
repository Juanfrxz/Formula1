import { getPilotos } from '../../api/fetchApi.js';

class DriverSelectionComponent extends HTMLElement {
    constructor() {
        super();
        this.pilotos = [];
        this.filteredPilotos = [];
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <!-- Bootstrap CSS -->
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
                .card-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    justify-content: center;
                    align-items: center;
                }
                .card {
                    width: 300px;
                    overflow: hidden;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(174, 2, 2, 0.1);
                    transition: box-shadow 0.3s, border-color 0.3s;
                    cursor: pointer;
                }
                .card:hover {
                    box-shadow: 0 0 15px rgba(174, 2, 2, 0.6);
                    border-color: #AE0202;
                }
                .card img {
                    width: 100%;
                    height: auto;
                    object-fit: contain;
                    border-radius: 8px;
                }
                .card-body {
                    padding: 0.5rem;
                    text-align: center;
                }
                .list-container {
                    max-height: 70vh;
                    overflow-y: auto;
                    overflow-x: hidden;
                    scrollbar-width: thin;
                    scrollbar-color: rgb(218, 3, 3) #2a2a2a;
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
                .message {
                    text-align: center;
                    margin-top: 20px;
                    font-size: 1.2rem;
                    color: #AE0202;
                }
                .popup-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    animation: fadeIn 0.3s ease-in-out;
                }
                .popup-content {
                    background: linear-gradient(135deg, #ffffff, #f9f9f9);
                    padding: 30px;
                    border-radius: 12px;
                    text-align: center;
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
                    max-width: 400px;
                    width: 90%;
                    animation: slideDown 0.3s ease-in-out;
                }
                .popup-content p {
                    font-size: 1.2rem;
                    color: #333;
                    margin-bottom: 20px;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .close-popup-btn {
                    background-color: #007bff;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    font-size: 1rem;
                    color: #fff;
                    box-shadow: 0 4px 6px rgba(0, 123, 255, 0.4);
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }
                .close-popup-btn:hover {
                    background-color: #0056b3;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideDown {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            </style>
            <div class="container">
                <div class="header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h2>Pilotos Registrados</h2>
                        <input type="text" id="search" class="form-control w-50" placeholder="Buscar piloto...">
                    </div>
                </div>
                <div class="list-container">
                    <div id="pilotos-container" class="card-container mt-3"></div>
                </div>
            </div>
        `;
    }

    async connectedCallback() {
        const team = this.getAttribute('team');
        if (!team) {
            const container = this.shadowRoot.getElementById('pilotos-container');
            container.innerHTML = '<p class="message">Por favor, selecciona un equipo en el menú de equipos.</p>';
            return;
        }
        await this.fetchPilotos(team);
        this.shadowRoot.getElementById('search')
            .addEventListener('input', (e) => this.filterPilotos(e.target.value));
    }

    async fetchPilotos(team) {
        try {
            const allPilotos = await getPilotos();
            // Se filtran los pilotos que pertenecen al equipo seleccionado
            this.pilotos = allPilotos.filter(piloto => piloto.equipo === team);
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
        const container = this.shadowRoot.getElementById('pilotos-container');
        container.innerHTML = '';
        
        if (this.filteredPilotos.length === 0) {
            container.innerHTML = '<p class="message">No hay pilotos registrados para este equipo.</p>';
            return;
        }
        
        this.filteredPilotos.forEach(piloto => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${piloto.foto}" alt="Foto de ${piloto.nombre}">
                <div class="card-body">
                    <h5 class="card-title">${piloto.nombre}</h5>
                    <button class="btn btn-danger select-btn">Select</button>
                </div>
            `;
            card.querySelector('.select-btn').addEventListener('click', () => this.selectDriver(piloto));
            container.appendChild(card);
        });
    }

    selectDriver(pilot) {
        this.showPopup("Driver has been successfully selected ✅");
        const driverSelectedEvent = new CustomEvent('driverSelected', {
            detail: { driver: pilot },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(driverSelectedEvent);
    }

    showPopup(message) {
        const popupOverlay = document.createElement('div');
        popupOverlay.className = 'popup-overlay';

        const popupContent = document.createElement('div');
        popupContent.className = 'popup-content';

        const messagePara = document.createElement('p');
        messagePara.textContent = message;
        popupContent.appendChild(messagePara);

        const closeButton = document.createElement('button');
        closeButton.className = 'close-popup-btn';
        closeButton.textContent = 'Close';
        popupContent.appendChild(closeButton);

        popupOverlay.appendChild(popupContent);
        this.shadowRoot.appendChild(popupOverlay);

        closeButton.addEventListener('click', () => {
            this.shadowRoot.removeChild(popupOverlay);
        });

        popupOverlay.addEventListener('click', (e) => {
            if (e.target === popupOverlay) {
                this.shadowRoot.removeChild(popupOverlay);
            }
        });
    }
}

customElements.define('driverselection-component', DriverSelectionComponent);
