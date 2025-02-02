import { getVehiculos } from '../../api/fetchApi.js';
// import * as THREE from 'three';

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
            // Cada tarjeta se envuelve en una columna de 6 (2 por fila en pantallas medianas en adelante)
            const cardWrapper = document.createElement('div');
            cardWrapper.classList.add('col-md-6', 'mb-3');
 
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = /*html*/ `
                <img src="${car.imagen}" alt="${car.modelo}" class="card-img-top">
                <div class="card-body">
                    <h5 class="card-title">${car.modelo}</h5>
                    <p class="card-text">Equipo: ${car.equipo}</p>
                    <button class="btn btn-primary buttonDetail" data-id="${car.id}" data-name="${car.modelo}">
                        Ver Detalles
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
        // Buscar el modal en el documento global
        const modalTitle = document.getElementById('carModalLabel');
        const modalBody = document.getElementById('carModalBody');
        const modalElement = document.getElementById('carModal');

        if (!modalTitle || !modalBody || !modalElement) {
            console.error("❌ No se encontró el modal en el documento.");
            return;
        }

        // Actualizar contenido del modal, incluyendo un canvas para el modelo 3D
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
            <div class="mt-3">
              <canvas id="car3dCanvas" width="460" height="440" style="border: 1px solid #ccc;"></canvas>
            </div>
        `;

        // Mostrar el modal de Bootstrap
        const modal = new bootstrap.Modal(modalElement);
        modal.show();

        // Inicializar el modelo 3D en el canvas
        const canvas3d = modalBody.querySelector('#car3dCanvas');
        if (canvas3d) {
            this.initThreeDModel(canvas3d);
        }
    }

    initThreeDModel(canvas) {
        // Configurar la escena, cámara y renderizador usando Three.js
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 500);
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
        renderer.setSize(canvas.width, canvas.height);

        // Configuración para que las texturas se rendericen correctamente
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.physicallyCorrectLights = true;

        // Agregar luces a la escena
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);
    
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        let model = null;

        // Cargar el modelo 3D desde la carpeta public (asegúrate de que la ruta sea la correcta)
        const loader = new THREE.GLTFLoader();
        loader.load(
            '/redbull-3d.glb', // Ruta ajustada: generalmente se accede desde la raíz
            (gltf) => {
                model = gltf.scene;
                // Reducir la escala para que el modelo sea más pequeño y se ajuste al contenedor
                model.scale.set(0.3, 0.3, 0.3);
                model.position.set(0, -0.5, 0);
                scene.add(model);
            },
            undefined,
            (error) => {
                console.error('Error al cargar el modelo 3D:', error);
            }
        );

        // Ajustar la posición de la cámara para enfocar correctamente el modelo
        camera.position.set(0, 0, 3);

        // Función de animación
        const animate = () => {
            requestAnimationFrame(animate);
            if (model) {
                // Rotación continua para mostrar el modelo en 3D
                model.rotation.y += 0.01;
            }
            renderer.render(scene, camera);
        };
        animate();

        // Opcional: actualizar tamaño en caso de redimensionamiento
        window.addEventListener('resize', () => {
            camera.aspect = canvas.width / canvas.height;
            camera.updateProjectionMatrix();
            renderer.setSize(canvas.width, canvas.height);
        });
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

        const editCarBtn = this.shadowRoot.getElementById('edit-car');
        if (editCarBtn) {
            editCarBtn.addEventListener('click', () => {
                this.style.display = "none";
                const editCarComponent = document.querySelector("edit-car-component");
                if (editCarComponent) {
                    editCarComponent.style.display = "block";
                } else {
                    console.error("❌ No se encontró el componente edit-car-component");
                }
            });
        }

        const deleteCarBtn = this.shadowRoot.getElementById('delete-car');
        if (deleteCarBtn) {
            deleteCarBtn.addEventListener('click', () => {
                this.style.display = "none";
                const deleteCarComponent = document.querySelector("delete-car-component");
                if (deleteCarComponent) {
                    deleteCarComponent.style.display = "block";
                } else {
                    console.error("❌ No se encontró el componente delete-car-component");
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
                .container { padding: 20px; margin-top: 90%; }
                .card { margin: 10px; }
                .card img { width: 100%; height: auto; } /* Se muestra la imagen completa */
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
                <!-- Se utiliza "row" para el grid -->
                <div id="cars-list" class="row"></div>
            </div>
        `;
    }
}

customElements.define('cars-component', CarsComponent);
