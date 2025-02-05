import { getCircuitos } from '../../api/fetchApi.js';

class CircuitsComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.circuits = []; // Almacenar los circuitos para la búsqueda dinámica
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
                    <h5 class="card-title">${circuit.pais}</h5>
                    <p class="card-text">${circuit.nombre}</p>
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
        
        // Se busca el modal global definido en index.html
        const modalElement = document.getElementById("circuitModal");
        if (!modalElement) {
            console.error("❌ No se encontró el modal con id 'circuitModal'");
            return;
        }
        
        // Usamos los IDs definidos en index.html para actualizar el título y cuerpo del modal
        const modalTitle = document.getElementById("circuitModalLabel");
        const modalBody = document.getElementById("circuitModalBody");
        
        if (modalTitle) {
            modalTitle.textContent = circuit.nombre;
        } else {
            console.warn("No se encontró el elemento con id 'circuitModalLabel'");
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
                    <li><strong>Tiempo:</strong> ${circuit.record_vuelta?.tiempo ?? ''}</li>
                    <li><strong>Piloto:</strong> ${circuit.record_vuelta?.piloto ?? ''}</li>
                    <li><strong>Año:</strong> ${circuit.record_vuelta?.año ?? ''}</li>
                </ul>
            `;
        } else {
            console.warn("No se encontró el elemento con id 'circuitModalBody'");
        }
        
        // Se muestra el modal utilizando la instancia global de Bootstrap
        const modalInstance = new bootstrap.Modal(modalElement);
        modalInstance.show();
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
                const modalContainer = document.createElement('div');
                modalContainer.classList.add('modal', 'fade');
                modalContainer.tabIndex = -1;
                modalContainer.setAttribute('aria-hidden', 'true');
                modalContainer.innerHTML = /*html*/ `
                  <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title">Registrar Nuevo Circuito</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div class="modal-body">
                        <!-- Se insertará el custom element <create-circuit-component> -->
                      </div>
                    </div>
                  </div>`;
                document.body.appendChild(modalContainer);

                const modalBody = modalContainer.querySelector('.modal-body');
                const createCircuitComponent = document.createElement('create-circuit-component');
                modalBody.innerHTML = "";
                modalBody.appendChild(createCircuitComponent);

                const modalInstance = new bootstrap.Modal(modalContainer, { backdrop: 'static' });
                modalInstance.show();

                modalContainer.addEventListener('hidden.bs.modal', () => {
                  modalContainer.remove();
                });
            });
        }

        const editCircuitBtn = this.shadowRoot.getElementById('edit-circuit');
        if (editCircuitBtn) {
            editCircuitBtn.addEventListener('click', () => {
                const modalContainer = document.createElement('div');
                modalContainer.classList.add('modal', 'fade');
                modalContainer.tabIndex = -1;
                modalContainer.setAttribute('aria-hidden', 'true');
                modalContainer.innerHTML = /*html*/ `
                  <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title">Editar Circuito</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div class="modal-body">
                        <!-- Se insertará el custom element <edit-circuit-component> -->
                      </div>
                    </div>
                  </div>`;
                document.body.appendChild(modalContainer);

                const modalBody = modalContainer.querySelector('.modal-body');
                const editCircuitComponent = document.createElement('edit-circuit-component');
                modalBody.innerHTML = "";
                modalBody.appendChild(editCircuitComponent);

                const modalInstance = new bootstrap.Modal(modalContainer, { backdrop: 'static' });
                modalInstance.show();

                modalContainer.addEventListener('hidden.bs.modal', () => {
                  modalContainer.remove();
                });
            });
        }

        const deleteCircuitBtn = this.shadowRoot.getElementById('delete-circuit');
        if (deleteCircuitBtn) {
            deleteCircuitBtn.addEventListener('click', () => {
                const modalContainer = document.createElement('div');
                modalContainer.classList.add('modal', 'fade');
                modalContainer.tabIndex = -1;
                modalContainer.setAttribute('aria-hidden', 'true');
                modalContainer.innerHTML = /*html*/ `
                  <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title">Eliminar Circuito</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div class="modal-body">
                        <!-- Se insertará el custom element <delete-circuit-component> -->
                      </div>
                    </div>
                  </div>`;
                document.body.appendChild(modalContainer);

                const modalBody = modalContainer.querySelector('.modal-body');
                const deleteCircuitComponent = document.createElement('delete-circuit-component');
                modalBody.innerHTML = "";
                modalBody.appendChild(deleteCircuitComponent);

                const modalInstance = new bootstrap.Modal(modalContainer, { backdrop: 'static' });
                modalInstance.show();

                modalContainer.addEventListener('hidden.bs.modal', () => {
                  modalContainer.remove();
                });
            });
        }
    }

    setupSearchEvent() {
        const searchInput = this.shadowRoot.getElementById('search');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                const query = searchInput.value.toLowerCase();
                // Se filtra por nombre y país
                const filteredCircuits = this.circuits.filter(circuit =>
                    circuit.nombre.toLowerCase().includes(query) ||
                    circuit.pais.toLowerCase().includes(query)
                );
                this.renderCircuits(filteredCircuits);
            });
        }
    }

    render() {
        this.shadowRoot.innerHTML = /*html*/ `
            <style>
                .container { 
                    padding: 20px; 
                    margin-top: 2rem;
                }
                .card { 
                    margin: 10px; 
                }
                .card img { 
                    width: 100%; 
                    height: auto; /* Se muestra la imagen completa */
                }
                /* Contenedor desplazable para las cards */
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
                <input type="text" id="search" placeholder="Buscar circuito..." class="form-control my-3">
                <!-- Contenedor desplazable para las cards -->
                <div class="list-container">
                    <div id="circuits-list" class="row"></div>
                </div>
            </div>
        `;
    }
}

customElements.define('circuits-component', CircuitsComponent);
