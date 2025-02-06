import './createcarComponent.js';
import './editcarComponent.js';
import './deletecarComponent.js';
import { getVehiculos, getEquipos } from '../../api/fetchApi.js';
// import * as THREE from 'three';


class CarsComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.cars = []; // Almacenar los vehículos para la búsqueda dinámica
        this.equipos = []; // Almacenar la lista de equipos
    }

    connectedCallback() {
        this.render();
        this.loadCars();
        this.setupDropdownEvents();
        this.setupSearchEvent();
    }

    async loadCars() {
        try {
            // Se obtienen primero los vehículos y después los equipos para poder mostrar el nombre del equipo
            this.cars = await getVehiculos();
            this.equipos = await getEquipos();
            this.renderCars(this.cars);
        } catch (error) {
            console.error('Error loading cars:', error);
        }
    }

    // Método helper para obtener el nombre del equipo basándose en el id almacenado en el objeto automóvil.
    getTeamName(teamId) {
        const team = this.equipos.find(eq => eq.id === teamId);
        return team ? team.nombre : teamId;
    }

    renderCars(cars) {
        const container = this.shadowRoot.querySelector('#cars-list');
        container.innerHTML = '';
        
        cars.forEach(car => {
            // Cada tarjeta se envuelve en una columna de 6 (2 por fila en pantallas medianas en adelante)
            const cardWrapper = document.createElement('div');
            cardWrapper.classList.add('col-md-6', 'mb-3');
 
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = /*html*/ `
                <img src="${car.imagen}" alt="${car.modelo}" class="card-img-top">
                <div class="card-body">
                    <h5 class="card-title">${car.modelo}</h5>
                    <p class="card-text">Team: ${this.getTeamName(car.equipo)}</p>
                    <button class="btn btn-primary buttonDetail" data-id="${car.id}" data-name="${car.modelo}">
                    See Details
                    </button>
                </div>
            `;
 
            // Asignar evento al botón
            card.querySelector('.buttonDetail').addEventListener('click', () => this.showCarDetails(car));
            cardWrapper.appendChild(card);
            container.appendChild(cardWrapper);
        });
    }

    showCarDetails(car) {
        const modalTitle = document.getElementById('carModalLabel');
        const modalBody = document.getElementById('carModalBody');
        const modalElement = document.getElementById('carModal');

        if (!modalTitle || !modalBody || !modalElement) {
            console.error("❌ No se encontró el modal en el documento.");
            return;
        }

        // Extraer la URL del modelo 3D en caso de que esté embebida en un iframe
        let model3dUrl = car.model3d;
        if (car.model3d.includes('src="')) {
            const srcMatch = car.model3d.match(/src="([^"]+)"/);
            if (srcMatch && srcMatch[1]) {
                model3dUrl = srcMatch[1];
            }
        }

        modalTitle.textContent = car.modelo;

        // Construir el HTML del modal
        modalBody.innerHTML = `
            <div class="container-fluid">
                <div class="row">
                    <!-- Columna izquierda (8/12): Modelo 3D con overlay de carga -->
                    <div class="col-md-8" style="position: relative;">
                        <iframe 
                            src="${model3dUrl}" 
                            style="width:100%; height:600px; border:none;" 
                            frameborder="0" 
                            allowfullscreen>
                        </iframe>
                    </div>
                    <!-- Columna derecha (4/12): Información del vehículo -->
                    <div class="col-md-4">
                        <h3>Vehicle Details</h3>
                        <p><strong>Team:</strong> ${this.getTeamName(car.equipo)}</p>
                        <p><strong>Engine:</strong> ${car.motor}</p>
                        <p><strong>Maximum speed:</strong> ${car.velocidad_maxima_kmh} km/h</p>
                        <p><strong>Acceleration 0-100 km/h:</strong> ${car.aceleracion_0_100} s</p>
                        <h5>Performance</h5>
                        <ul>
                            <li><strong>Normal Driving:</strong> Average Speed: ${car.rendimiento.conduccion_normal.velocidad_promedio_kmh} km/h</li>
                            <li><strong>Aggressive Driving:</strong> Average Speed: ${car.rendimiento.conduccion_agresiva.velocidad_promedio_kmh} km/h</li>
                            <li><strong>Fuel Savings:</strong> Average Speed: ${car.rendimiento.ahorro_combustible.velocidad_promedio_kmh} km/h</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        // Agregar un overlay de carga en la columna izquierda donde se muestra el modelo 3D
        const leftColumn = modalBody.querySelector('.col-md-8');
        if (leftColumn) {
            // Crear el overlay con spinner (utilizando la clase spinner-border de Bootstrap)
            const loadingOverlay = document.createElement('div');
            loadingOverlay.style.position = 'absolute';
            loadingOverlay.style.top = '0';
            loadingOverlay.style.left = '0';
            loadingOverlay.style.width = '100%';
            loadingOverlay.style.height = '100%';
            loadingOverlay.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            loadingOverlay.style.display = 'flex';
            loadingOverlay.style.justifyContent = 'center';
            loadingOverlay.style.alignItems = 'center';
            loadingOverlay.innerHTML = `<div class="spinner-border text-danger" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>`;
            leftColumn.appendChild(loadingOverlay);

            // Una vez que el iframe cargue, se oculta el overlay
            const iframe = leftColumn.querySelector('iframe');
            if (iframe) {
                iframe.onload = function() {
                    loadingOverlay.style.display = 'none';
                }
            }
        }

        // Asegurarse de que el modal sea extra grande (opcional)
        const modalDialog = modalElement.querySelector('.modal-dialog');
        if (modalDialog) {
            modalDialog.classList.add('modal-xl');
        }

        // Mostrar el modal
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

        // Mostrar <create-car-component> en un modal dinámico
        const createCarBtn = this.shadowRoot.getElementById('create-car');
        if (createCarBtn) {
            createCarBtn.addEventListener('click', () => {
                const modalContainer = document.createElement('div');
                modalContainer.classList.add('modal', 'fade');
                modalContainer.tabIndex = -1;
                modalContainer.setAttribute('aria-hidden', 'true');
                modalContainer.innerHTML =/*html*/ `
                    <div class="modal-dialog modal-dialog-centered modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Register New Vehicle</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <!-- Se insertará el custom element <create-car-component> -->
                            </div>
                        </div>
                    </div>`;
                document.body.appendChild(modalContainer);

                const modalBody = modalContainer.querySelector('.modal-body');
                const createCarComponent = document.createElement('create-car-component');
                modalBody.innerHTML = "";
                modalBody.appendChild(createCarComponent);

                const modalInstance = new bootstrap.Modal(modalContainer, { backdrop: 'static' });
                modalInstance.show();

                modalContainer.addEventListener('hidden.bs.modal', () => {
                    modalContainer.remove();
                });
            });
        }

        // Mostrar <edit-car-component> en un modal dinámico
        const editCarBtn = this.shadowRoot.getElementById('edit-car');
        if (editCarBtn) {
            editCarBtn.addEventListener('click', () => {
                const modalContainer = document.createElement('div');
                modalContainer.classList.add('modal', 'fade');
                modalContainer.tabIndex = -1;
                modalContainer.setAttribute('aria-hidden', 'true');
                modalContainer.innerHTML = /*html*/`
                    <div class="modal-dialog modal-dialog-centered modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Edit Vehicle</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <!-- Se insertará el custom element <edit-car-component> -->
                            </div>
                        </div>
                    </div>`;
                document.body.appendChild(modalContainer);

                const modalBody = modalContainer.querySelector('.modal-body');
                const editCarComponent = document.createElement('edit-car-component');
                modalBody.innerHTML = "";
                modalBody.appendChild(editCarComponent);

                const modalInstance = new bootstrap.Modal(modalContainer, { backdrop: 'static' });
                modalInstance.show();

                modalContainer.addEventListener('hidden.bs.modal', () => {
                    modalContainer.remove();
                });
            });
        }

        // Mostrar <delete-car-component> en un modal dinámico
        const deleteCarBtn = this.shadowRoot.getElementById('delete-car');
        if (deleteCarBtn) {
            deleteCarBtn.addEventListener('click', () => {
                const modalContainer = document.createElement('div');
                modalContainer.classList.add('modal', 'fade');
                modalContainer.tabIndex = -1;
                modalContainer.setAttribute('aria-hidden', 'true');
                modalContainer.innerHTML = /*html*/`
                    <div class="modal-dialog modal-dialog-centered modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Delete Vehicle</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <!-- Se insertará el custom element <delete-car-component> -->
                            </div>
                        </div>
                    </div>`;
                document.body.appendChild(modalContainer);

                const modalBody = modalContainer.querySelector('.modal-body');
                const deleteCarComponent = document.createElement('delete-car-component');
                modalBody.innerHTML = "";
                modalBody.appendChild(deleteCarComponent);

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
                const filteredCars = this.cars.filter(car =>
                    car.modelo.toLowerCase().includes(query) ||
                    car.equipo.toLowerCase().includes(query)
                );
                this.renderCars(filteredCars);
            });
        }
    }

    render() {
        this.shadowRoot.innerHTML = /*html*/ `
            <style>
                /* Estilos base del contenedor */
                .container { 
                    background-color: none;
                    padding: 20px; 
                    margin-top: 90px; 
                }
                /* Contenedor para el header con título y dropdown */
                .header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }
                .header h2 {
                    margin: 0;
                }
                /* Estilos de las tarjetas */
                .card { 
                    background-color: none;
                    margin: 10px; 
                    position: relative; 
                    overflow: hidden; 
                    transition: box-shadow 0.3s;
                    border-color: #444;
                }
                .card:hover {
                    box-shadow: 0 0 15px rgba(218, 3, 3, 0.6);
                }
                .card img { 
                    width: 100%; 
                    height: auto;
                }
                /* Estilos del contenedor con scroll */
                .list-container {
                    max-height: 70vh;
                    overflow-y: auto;
                    overflow-x: hidden;
                    scrollbar-width: thin;
                    scrollbar-color: rgb(218, 3, 3);
                }
                .list-container::-webkit-scrollbar {
                    width: 8px;
                }
                .list-container::-webkit-scrollbar-track {
                    background: rgb(221, 56, 56);
                }
                .list-container::-webkit-scrollbar-thumb {
                    background-color: rgb(218, 3, 3);
                    border-radius: 8px;
                }
                .list-container::-webkit-scrollbar-thumb:hover {
                    background-color: #ff0000;
                }
                .form-control, .form-select {
                    background-color: #3a3a3a;
                    color: white;
                    border-color: #444;
                }
                .form-control:focus, .form-select:focus {
                    background-color: #3a3a3a;
                    color: white;
                    border-color: rgb(218, 3, 3);
                    box-shadow: 0 0 0 0.25rem rgba(218, 3, 3, 0.25);
                }
                .buttonDetail {
                    background-color: rgb(218, 3, 3) !important;
                    color: white !important;
                    border: 1px solid transparent !important;
                }
                .buttonDetail:hover {
                    background-color: #2a2a2a !important;
                    color: white !important;
                    border: 1px solid rgb(218, 3, 3) !important;
                }
                .card:hover::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 200%;
                    height: 100%;
                    background: linear-gradient(120deg, transparent, var(--shine-color, rgb(202, 50, 50)), transparent);
                    transform: skewX(-20deg);
                    animation: shine 0.75s forwards;
                }
                @keyframes shine {
                    0% { left: -100%; }
                    100% { left: 100%; }
                }
            </style>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
            
            <div class="container">
                <div class="header">
                    <h2>Vehicle Management</h2>
                    <div class="dropdown">
                        <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        Options
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" id="create-car" href="#">Create Vehicle</a></li>
                            <li><a class="dropdown-item" id="edit-car" href="#">Edit Vehicle</a></li>
                            <li><a class="dropdown-item" id="delete-car" href="#">Delete Vehicle</a></li>
                        </ul>
                    </div>
                </div>
                <input type="text" id="search" placeholder="Search vehicle..." class="form-control my-3">
                <div class="list-container">
                    <div id="cars-list" class="row"></div>
                </div>
            </div>
        `;
    }
}

customElements.define('cars-component', CarsComponent);
