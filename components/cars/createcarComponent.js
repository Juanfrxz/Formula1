import { getEquipos, getPilotos, addVehiculo } from '../../api/fetchApi.js';

class CreateCarComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        this.equipos = await getEquipos();
        this.pilotos = await getPilotos();
        this.render();
        this.setupAccordion();
        this.setupEvents();
    }

    setupAccordion() {
        const accordionButtons = this.shadowRoot.querySelectorAll('.accordion-button');
        accordionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetSelector = button.getAttribute('data-bs-target');
                const targetPanel = this.shadowRoot.querySelector(targetSelector);
                const isExpanded = button.getAttribute('aria-expanded') === 'true';

                button.setAttribute('aria-expanded', String(!isExpanded));

                if (targetPanel.classList.contains('show')) {
                    targetPanel.classList.remove('show');
                } else {
                    targetPanel.classList.add('show');
                }
            });
        });
    }

    setupEvents() {
        const form = this.shadowRoot.getElementById('carForm');

        const equipoSelect = this.shadowRoot.getElementById("equipo");
        this.updatePilotosForTeam(equipoSelect.value);
        equipoSelect.addEventListener("change", () => {
            this.updatePilotosForTeam(equipoSelect.value);
        });

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const newCar = this.getFormData();
            await addVehiculo(newCar);
            
            // En lugar de usar alert, se actualiza el mensaje en el contenedor de confirmación
            const confirmationMessage = this.shadowRoot.getElementById("confirmation-message");
            confirmationMessage.textContent = "Vehicle registered successfully";
            confirmationMessage.style.display = "block";

            // Opcional: se puede emitir un evento personalizado si se necesita notificar a otros componentes
            this.dispatchEvent(new CustomEvent("vehicleCreated", {
                bubbles: true,
                detail: {
                    action: "create",
                    vehicle: newCar
                }
            }));

            // Si no se desea ocultar el formulario (como en el componente de driver), se pueden comentar o eliminar estas líneas:
            //this.style.display = "none";
            //document.querySelector("cars-component").style.display = "block";
        });
    }

    updatePilotosForTeam(teamId) {
        const pilotosSelect = this.shadowRoot.getElementById("pilotos");
        const filteredPilotos = this.pilotos.filter(piloto => piloto.equipo === teamId);
        pilotosSelect.innerHTML = filteredPilotos
            .map(p => `<option value="${p.id}">${p.nombre}</option>`)
            .join('');
    }

    getFormData() {
        const equipo = this.shadowRoot.getElementById("equipo").value;
        const modelo = this.shadowRoot.getElementById("modelo").value;
        const motor = this.shadowRoot.getElementById("motor").value;
        const velocidad = parseInt(this.shadowRoot.getElementById("velocidad").value);
        const aceleracion = parseFloat(this.shadowRoot.getElementById("aceleracion").value);
        const pilotos = Array.from(this.shadowRoot.querySelectorAll("#pilotos option:checked"), opt => opt.value);
        const imagen = this.shadowRoot.getElementById("imagen").value;

        return {
            id: "v" + Date.now().toString(16).toUpperCase(),
            equipo,
            modelo,
            motor,
            velocidad_maxima_kmh: velocidad,
            aceleracion_0_100: aceleracion,
            pilotos,
            rendimiento: this.getRendimientoData(),
            imagen
        };
    }

    getRendimientoData() {
        const getValues = (prefix) => ({
            velocidad_promedio_kmh: parseInt(this.shadowRoot.getElementById(`${prefix}_velocidad`).value),
            consumo_combustible: {
                seco: parseFloat(this.shadowRoot.getElementById(`${prefix}_comb_seco`).value),
                lluvioso: parseFloat(this.shadowRoot.getElementById(`${prefix}_comb_lluvioso`).value),
                extremo: parseFloat(this.shadowRoot.getElementById(`${prefix}_comb_extremo`).value)
            },
            desgaste_neumaticos: {
                seco: parseFloat(this.shadowRoot.getElementById(`${prefix}_desg_seco`).value),
                lluvioso: parseFloat(this.shadowRoot.getElementById(`${prefix}_desg_lluvioso`).value),
                extremo: parseFloat(this.shadowRoot.getElementById(`${prefix}_desg_extremo`).value)
            }
        });

        return {
            conduccion_normal: getValues("normal"),
            conduccion_agresiva: getValues("agresiva"),
            ahorro_combustible: getValues("ahorro")
        };
    }

    render() {
        this.shadowRoot.innerHTML = /* html */ `
            <style>
                /* Importamos Bootstrap */
                @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');

                /* Estilos básicos para el acordeón */
                .accordion-collapse {
                    display: none;
                }
                .accordion-collapse.show {
                    display: block;
                }
            </style>
            <div class="container">
                <h2>Register New Vehicle</h2>
                <form id="carForm">
                    <div class="accordion" id="carAccordion">
                        <div class="accordion-item">
                            <h2 class="accordion-header">
                                <button class="accordion-button" 
                                        type="button" 
                                        data-bs-toggle="collapse" 
                                        data-bs-target="#generalInfo" 
                                        aria-expanded="true">
                                        General Information
                                </button>
                            </h2>
                            <div id="generalInfo" class="accordion-collapse collapse show">
                                <div class="accordion-body">
                                    <label>Team:</label>
                                    <select id="equipo" class="form-control">
                                        ${this.equipos.map(eq => `<option value="${eq.id}">${eq.nombre}</option>`).join('')}
                                    </select>
                                    <label>Pilots:</label>
                                    <select id="pilotos" class="form-control" multiple></select>
                                    <label>Model:</label>
                                    <input type="text" id="modelo" class="form-control" required>
                                    <label>Engine:</label>
                                    <input type="text" id="motor" class="form-control" required>
                                    <label>Maximum speed (km/h):</label>
                                    <input type="number" id="velocidad" class="form-control" required>
                                    <label>Acceleration 0-100 (s):</label>
                                    <input type="number" step="0.1" id="aceleracion" class="form-control" required>
                                    <label>Image (URL):</label>
                                    <input type="text" id="imagen" class="form-control">
                                </div>
                            </div>
                        </div>
                        <div class="accordion-item">
                            <h2 class="accordion-header">
                                <button class="accordion-button collapsed" 
                                        type="button" 
                                        data-bs-toggle="collapse" 
                                        data-bs-target="#performance_normal" 
                                        aria-expanded="false">
                                        Performance: Normal driving
                                </button>
                            </h2>
                            <div id="performance_normal" class="accordion-collapse collapse">
                                <div class="accordion-body">
                                    ${this.renderPerformanceInputs("normal", "Normal Driving")}
                                </div>
                            </div>
                        </div>
                        <div class="accordion-item">
                            <h2 class="accordion-header">
                                <button class="accordion-button collapsed" 
                                        type="button" 
                                        data-bs-toggle="collapse" 
                                        data-bs-target="#performance_agresiva" 
                                        aria-expanded="false">
                                        Performance: Aggressive driving
                                </button>
                            </h2>
                            <div id="performance_agresiva" class="accordion-collapse collapse">
                                <div class="accordion-body">
                                    ${this.renderPerformanceInputs("agresiva", "Aggressive Driving")}
                                </div>
                            </div>
                        </div>
                        <div class="accordion-item">
                            <h2 class="accordion-header">
                                <button class="accordion-button collapsed" 
                                        type="button" 
                                        data-bs-toggle="collapse" 
                                        data-bs-target="#performance_ahorro" 
                                        aria-expanded="false">
                                        Performance: Fuel savings
                                </button>
                            </h2>
                            <div id="performance_ahorro" class="accordion-collapse collapse">
                                <div class="accordion-body">
                                    ${this.renderPerformanceInputs("ahorro", "Fuel Savings")}
                                </div>
                            </div>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary mt-3">Save</button>
                </form>
                <!-- Contenedor para el mensaje de confirmación, inicialmente oculto -->
                <div id="confirmation-message" class="mt-3 text-success" style="display: none;"></div>
            </div>
        `;
    }

    renderPerformanceInputs(prefix, label) {
        return /*html*/`
            <h4>${label}</h4>
            <label>Average speed (km/h):</label>
            <input type="number" id="${prefix}_velocidad" class="form-control" required>
            <label>Fuel consumption:</label>
            <input type="number" id="${prefix}_comb_seco" class="form-control" placeholder="Dry" required>
            <input type="number" id="${prefix}_comb_lluvioso" class="form-control" placeholder="Lluvioso" required>
            <input type="number" id="${prefix}_comb_extremo" class="form-control" placeholder="Extremo" required>
            <label>Desgaste Neumáticos:</label>
            <input type="number" id="${prefix}_desg_seco" class="form-control" placeholder="Seco" required>
            <input type="number" id="${prefix}_desg_lluvioso" class="form-control" placeholder="Lluvioso" required>
            <input type="number" id="${prefix}_desg_extremo" class="form-control" placeholder="Extremo" required>
        `;
    }
}

customElements.define("create-car-component", CreateCarComponent);
