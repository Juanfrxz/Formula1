import { getCircuitos } from '../../api/fetchApi.js';

class CircuitsComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.circuits = []; // Almacenar los vehículos para la búsqueda dinámica
    }

    connectedCallback() {
        this.render();
        this.loadCircuits();
        this.setupDropdownEvents();
        this.setupSearchEvent();
    }

    async loadCircuits() {
        try {
            this.circuits = await getCircuitos();
            this.renderCircuits(this.circuits);
        } catch (error) {
            console.error('Error loading circuits:', error);
        }
    }

    renderCircuits(circuits) {
        const container = this.shadowRoot.querySelector('#circuits-list');
        container.innerHTML = '';
        
        circuits.forEach(circuit => {
            // Cada tarjeta se envuelve en una columna de 6 (2 por fila en pantallas medianas en adelante)
            const cardWrapper = document.createElement('div');
            cardWrapper.classList.add('col-md-6', 'mb-3');
 
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = /*html*/ `
                <img src="${circuit.imagen}" alt="${circuit.nombre}" class="card-img-top">
                <div class="card-body">
                    <h5 class="card-title">${circuit.nombre}</h5>
                    <p class="card-text">${circuit.pais}</p>
                    <button class="btn btn-primary buttonDetail" data-id="${circuit.id}" data-name="${circuit.nombre}">
                        Ver Detalles
                    </button>
                </div>

            `;
 
            // Asignar evento al botón
            card.querySelector('.buttonDetail').addEventListener('click', () => this.showCircuitDetails(circuit));
            cardWrapper.appendChild(card);
            container.appendChild(cardWrapper);

        });
    }

    showCircuitDetails(circuit) {
        console.log("Se invocó showCircuitDetails para:", circuit);
        // Busca el modal global en el documento
        const modalElement = document.getElementById("circuitModal");
        if (!modalElement) {
            console.error("❌ No se encontró el modal con id 'circuitModal'");
            return;
        }
        
        // Actualiza el contenido del modal
        const modalTitle = modalElement.querySelector(".modal-title");
        const modalBody = modalElement.querySelector(".modal-body");

        if (modalTitle) {
            modalTitle.textContent = circuit.nombre;
        } else {
            console.warn("No se encontró el elemento con la clase 'modal-title'");
        }

        if (modalBody) {
            modalBody.innerHTML = /*html*/ `
            <img src="${circuit.imagen_detail}" alt="${circuit.nombre}" class="card-img-top">
                <p><strong>Pais:</strong> ${circuit.pais}</p>
                <p><strong>Longitud (km):</strong> ${circuit.longitud_km}</p>
                <p><strong>Vueltas:</strong> ${circuit.vueltas}</p>
                <p><strong>Descripción:</strong> ${circuit.descripcion}</p>
                <h5>Record de Vueltas</h5>
            <ul>
                <li><strong>Tiempo:</strong> ${circuit.record_vuelta.tiempo}</li>
                <li><strong>Piloto:</strong> ${circuit.record_vuelta.piloto}</li>
                <li><strong>Año:</strong> ${circuit.record_vuelta.año}</li>
            </ul>
            `;
        } else {
            console.warn("No se encontró el elemento con la clase 'modal-body'");
        }
        
        // Muestra el modal usando la API de Bootstrap
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }

    setupDropdownEvents() {
        const dropdownBtn = this.shadowRoot.querySelector('.dropdown-toggle');
        const dropdownMenu = this.shadowRoot.querySelector('.dropdown-menu');

        if (dropdownBtn && dropdownMenu) {
            dropdownBtn.addEventListener('click', (event) => {
                event.preventDefault();
                const isVisible = dropdownMenu.classList.contains('show');
                dropdownMenu.classList.toggle('show', !isVisible);
            });

            document.addEventListener('click', (event) => {
                if (!this.contains(event.target)) {
                    dropdownMenu.classList.remove('show');
                }
            });
        }

        const createCircuitBtn = this.shadowRoot.getElementById('create-circuit');
        if (createCircuitBtn) {
            createCircuitBtn.addEventListener('click', () => {
                this.style.display = "none";
                const createCircuitComponent = document.querySelector("create-circuit-component");
                if (createCircuitComponent) {
                    createCircuitComponent.style.display = "block";
                }
            });
        }

        const editCircuitBtn = this.shadowRoot.getElementById('edit-circuit');
        if (editCircuitBtn) {
            editCircuitBtn.addEventListener('click', () => {
                this.style.display = "none";
                const editCircuitComponent = document.querySelector("edit-circuit-component");
                if (editCircuitComponent) {
                    editCircuitComponent.style.display = "block";
                } else {
                    console.error("❌ No se encontró el componente edit-circuit-component");
                }
            });
        }

        const deleteCircuitBtn = this.shadowRoot.getElementById('delete-circuit');
        if (deleteCircuitBtn) {
            deleteCircuitBtn.addEventListener('click', () => {
                this.style.display = "none";
                const deleteCircuitComponent = document.querySelector("delete-circuit-component");
                if (deleteCircuitComponent) {
                    deleteCircuitComponent.style.display = "block";
                } else {
                    console.error("❌ No se encontró el componente delete-circuit-component");
                }
            });
        }
    }

    setupSearchEvent() {
        const searchInput = this.shadowRoot.getElementById('search');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                const query = searchInput.value.toLowerCase();
                const filteredCircuits = this.circuits.filter(circuit =>
                    circuit.modelo.toLowerCase().includes(query) ||
                    circuit.equipo.toLowerCase().includes(query)
                );
                this.renderCircuits(filteredCircuits);
            });
        }
    }


    render() {
        this.shadowRoot.innerHTML = /*html*/ `
            <style>
                .container { padding: 20px; margin-top: 90%; }
                .card { margin: 10px; }
                .card img { width: 100%; height: auto; } /* Se muestra la imagen completa */
            </style>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
            <div class="container">
                <h2>Gestión de Circuitos</h2>
                <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        Opciones
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" id="create-circuit" href="#">Crear Circuito</a></li>
                        <li><a class="dropdown-item" id="edit-circuit" href="#">Editar Circuito</a></li>
                        <li><a class="dropdown-item" id="delete-circuit" href="#">Eliminar Circuito</a></li>
                    </ul>
                </div>
                <input type="text" id="search" placeholder="Buscar vehículo..." class="form-control my-3">
                <!-- Se utiliza "row" para el grid -->

                <div id="circuits-list" class="row"></div>
            </div>
        `;
    }
}

customElements.define('circuits-component', CircuitsComponent);
