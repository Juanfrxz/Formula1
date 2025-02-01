import { getVehiculos } from '../../api/fetchApi.js';

class CarsComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.cars = []; // Almacenar los vehículos para la búsqueda dinámica
    }

    connectedCallback() {
        this.render();
        this.loadCars();
        this.setupDropdownEvents();
        this.setupSearchEvent();
    }

    async loadCars() {
        try {
            this.cars = await getVehiculos();
            this.renderCars(this.cars);
        } catch (error) {
            console.error('Error loading cars:', error);
        }
    }

    renderCars(cars) {
        const container = this.shadowRoot.querySelector('#cars-list');
        container.innerHTML = '';

        cars.forEach(car => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = /*html*/ `
                <img src="${car.imagen}" alt="${car.modelo}" class="card-img-top">
                <div class="card-body">
                    <h5 class="card-title">${car.modelo}</h5>
                    <p class="card-text">Equipo: ${car.equipo}</p>
                    <button class="btn btn-primary buttonDetail" data-id="${car.id}" data-name="${car.modelo}">Ver Detalles</button>
                </div>
            `;

            // Asignar evento al botón
            card.querySelector('.buttonDetail').addEventListener('click', () => this.showCarDetails(car));
            container.appendChild(card);
        });
    }

    showCarDetails(car) {
        // Buscar el modal en el documento global
        const modalTitle = document.getElementById('carModalLabel');
        const modalBody = document.getElementById('carModalBody');
        const modalElement = document.getElementById('carModal');

        if (!modalTitle || !modalBody || !modalElement) {
            console.error("❌ No se encontró el modal en el documento.");
            return;
        }

        // Actualizar contenido del modal
        modalTitle.textContent = car.modelo;
        modalBody.innerHTML = /*html*/`
            <p><strong>Equipo:</strong> ${car.equipo}</p>
            <p><strong>Motor:</strong> ${car.motor}</p>
            <p><strong>Velocidad Máxima:</strong> ${car.velocidad_maxima_kmh} km/h</p>
            <p><strong>Aceleración 0-100 km/h:</strong> ${car.aceleracion_0_100} s</p>
            <h5>Rendimiento</h5>
            <ul>
                <li><strong>Conducción Normal:</strong> Velocidad Promedio: ${car.rendimiento.conduccion_normal.velocidad_promedio_kmh} km/h</li>
                <li><strong>Conducción Agresiva:</strong> Velocidad Promedio: ${car.rendimiento.conduccion_agresiva.velocidad_promedio_kmh} km/h</li>
                <li><strong>Ahorro de Combustible:</strong> Velocidad Promedio: ${car.rendimiento.ahorro_combustible.velocidad_promedio_kmh} km/h</li>
            </ul>
        `;

        // Mostrar el modal de Bootstrap
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

        const createCarBtn = this.shadowRoot.getElementById('create-car');
        if (createCarBtn) {
            createCarBtn.addEventListener('click', () => {
                this.style.display = "none";
                const createCarComponent = document.querySelector("create-car-component");
                if (createCarComponent) {
                    createCarComponent.style.display = "block";
                }
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
                .container { padding: 20px; 
                margin-top: 350px;
                }
                .card { margin: 10px; width: 18rem; }
                .card img { height: 150px; object-fit: cover; }
            </style>

            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
            <div class="container">
                <h2>Gestión de Vehículos</h2>
                <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        Opciones
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" id="create-car" href="#">Crear Vehículo</a></li>
                        <li><a class="dropdown-item" id="edit-car" href="#">Editar Vehículo</a></li>
                        <li><a class="dropdown-item" id="delete-car" href="#">Eliminar Vehículo</a></li>
                    </ul>
                </div>
                <input type="text" id="search" placeholder="Buscar vehículo..." class="form-control my-3">
                <div id="cars-list" class="d-flex flex-wrap"></div>
            </div>
        `;
    }
}

customElements.define('cars-component', CarsComponent);
