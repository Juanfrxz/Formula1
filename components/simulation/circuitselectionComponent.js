import { getCircuitos } from '../../api/fetchApi.js';

class CircuitSelectionComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.circuits = [];
        this.filteredCircuits = [];

        this.shadowRoot.innerHTML = /*html*/`
            <!-- Bootstrap CSS -->
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
            <style>
                :host {
                display: block;
                padding: 20px;
            }
            .container-fluid {
                margin-top: 1rem;
            }
            .card {
                margin: 10px;
                display: flex;
                flex-direction: column;
            }
            .card-img-top {
                width: 100%;
                height: 150px;
                object-fit: cover;
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

            /* Estilos actualizados para el pop up */
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
            <div class="container-fluid">
                <h2>Select a Circuit</h2>
                <input type="text" id="search" class="form-control my-3" placeholder="Search circuit...">
                <div class="list-container">
                    <div id="circuits-list" class="row row-cols-1 row-cols-md-4 g-4"></div>
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
            cardWrapper.classList.add('col');

            const card = document.createElement('div');
            card.classList.add('card', 'h-100');
            card.innerHTML = `
                <img src="${circuit.imagen}" alt="${circuit.nombre}" class="card-img-top">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${circuit.nombre}</h5>
                    <p class="card-text">${circuit.pais}</p>
                    <button class="btn btn-danger mt-auto select-button">Select</button>
                </div>
            `;

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

        // Muestra el pop up con el mensaje
        this.showPopup('The circuit has been successfully selected');
    }

    showPopup(message) {
        // Crear el overlay del pop up
        const popupOverlay = document.createElement('div');
        popupOverlay.className = 'popup-overlay';

        // Crear el contenido del pop up
        const popupContent = document.createElement('div');
        popupContent.className = 'popup-content';

        // Mensaje del pop up
        const messagePara = document.createElement('p');
        messagePara.textContent = message;
        popupContent.appendChild(messagePara);

        // Botón de cierre
        const closeButton = document.createElement('button');
        closeButton.className = 'btn btn-secondary mt-3';
        closeButton.textContent = 'Close';
        popupContent.appendChild(closeButton);

        // Agregar el contenido al overlay
        popupOverlay.appendChild(popupContent);

        // Añadir el overlay al shadow DOM
        this.shadowRoot.appendChild(popupOverlay);

        // Cierra el pop up al hacer clic en el botón
        closeButton.addEventListener('click', () => {
            this.shadowRoot.removeChild(popupOverlay);
        });

        // Cierra el pop up si se hace clic fuera del contenido
        popupOverlay.addEventListener('click', (e) => {
            if (e.target === popupOverlay) {
                this.shadowRoot.removeChild(popupOverlay);
            }
        });
    }
}

customElements.define('circuit-selection-component', CircuitSelectionComponent);
