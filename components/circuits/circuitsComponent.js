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
            // Cada tarjeta se envuelve en una columna de 3 (4 por fila en pantallas medianas en adelante)
            const cardWrapper = document.createElement('div');
            cardWrapper.classList.add('col-md-3', 'mb-3');
 
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = /*html*/ `
                <img src="${circuit.imagen}" alt="${circuit.nombre}" class="card-img-top">
                <div class="card-body">
                    <h5 class="card-title">${circuit.pais}</h5>
                    <p class="card-text">${circuit.nombre}</p>
                    <button class="btn btn-danger buttonDetail" data-id="${circuit.id}" data-name="${circuit.nombre}">
                        View Details
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
                <div class="row">
                    <div class="col-md-6">
                        <img src="${circuit.imagen_detail}" alt="${circuit.nombre}" class="img-fluid" style="max-height:500px; object-fit:cover;">
                    </div>
                    <div class="col-md-6">
                        <p><strong>Country:</strong> ${circuit.pais}</p>
                        <p><strong>Length (km):</strong> ${circuit.longitud_km}</p>
                        <p><strong>Laps:</strong> ${circuit.vueltas}</p>
                        <p><strong>Description:</strong> ${circuit.descripcion}</p>
                        <h5>Lap Record</h5>
                        <ul>
                            <li><strong>Time:</strong> ${circuit.record_vuelta?.tiempo ?? ''}</li>
                            <li><strong>Driver:</strong> ${circuit.record_vuelta?.piloto ?? ''}</li>
                            <li><strong>Year:</strong> ${circuit.record_vuelta?.año ?? ''}</li>
                        </ul>
                    </div>
                </div>
            `;
        } else {
            console.warn("No se encontró el elemento con id 'circuitModalBody'");
        }
        
        // Hacer la ventana del modal más grande agregando la clase modal-xl al modal-dialog
        const modalDialog = modalElement.querySelector('.modal-dialog');
        if (modalDialog) {
            modalDialog.classList.add('modal-xl');
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
                        <h5 class="modal-title">Register New Circuit</h5>
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
                        <h5 class="modal-title">Edit Circuit</h5>
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
                        <h5 class="modal-title">Delete Circuit</h5>
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
                /* Contenedor del encabezado */
                .header-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 15px;
                }
                /* Tarjetas más pequeñas y con efecto hover */
                .card { 
                    margin: 10px;
                    max-width: 250px;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .card:hover {
                    transform: translateY(-5px) scale(1.02);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                }
                .card img { 
                    width: 100%; 
                    height: auto;
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
                <div class="header-container">
                    <h2>Circuit Management</h2>
                    <div class="dropdown">
                        <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            Options
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" id="create-circuit" href="#">Create Circuit</a></li>
                            <li><a class="dropdown-item" id="edit-circuit" href="#">Edit Circuit</a></li>
                            <li><a class="dropdown-item" id="delete-circuit" href="#">Delete Circuit</a></li>
                        </ul>
                    </div>
                </div>
                <input type="text" id="search" placeholder="Search circuit..." class="form-control my-">
                <!-- Contenedor desplazable para las cards -->
                <div class="list-container">
                    <div id="circuits-list" class="row"></div>
                </div>
            </div>
        `;
    }
}

customElements.define('circuits-component', CircuitsComponent);
