import { addEquipo } from '../api/fetchApi.js';

class CreateTeamComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = /*html*/ `
        <style>
            @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');
        </style>
        <div class="container mt-4">
            <div class="card">
                <div class="card-header text-center">
                    <h3>Crear Equipo</h3>
                </div>
                <div class="card-body">
                    <form id="team-form">
                        <div class="mb-3">
                            <label class="form-label">Nombre</label>
                            <input type="text" id="nombre" class="form-control" placeholder="Ingrese el nombre del equipo" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">País</label>
                            <input type="text" id="pais" class="form-control" placeholder="Ingrese el país del equipo" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Motor</label>
                            <input type="text" id="motor" class="form-control" placeholder="Ingrese el motor del equipo" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Imagen URL</label>
                            <input type="url" id="imagen" class="form-control" placeholder="Ingrese la URL de la imagen" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-100">Crear Equipo</button>
                        <div id="confirmation-message" class="alert alert-success mt-3" style="display: none;">
                            ¡Equipo creado con éxito!
                        </div>
                    </form>
                </div>
            </div>
        </div>
        `;
    }

    connectedCallback() {
        this.shadowRoot.querySelector('#team-form').addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(event) {
        event.preventDefault();
        const nombre = this.shadowRoot.querySelector('#nombre').value;
        const pais = this.shadowRoot.querySelector('#pais').value;
        const motor = this.shadowRoot.querySelector('#motor').value;
        const imagen = this.shadowRoot.querySelector('#imagen').value;
        
        const fecha = new Date();
        const id = `E${fecha.getTime().toString(16).toUpperCase()}`;
        
        const nuevoEquipo = {
            id,
            nombre,
            pais,
            motor,
            pilotos: [],
            imagen
        };

        await addEquipo(nuevoEquipo);
        this.showConfirmationMessage();
        this.shadowRoot.querySelector('#team-form').reset();
    }

    showConfirmationMessage() {
        const message = this.shadowRoot.querySelector('#confirmation-message');
        message.style.display = 'block';
        setTimeout(() => {
            message.style.display = 'none';
        }, 3000);
    }
}

customElements.define('create-team-component', CreateTeamComponent);
