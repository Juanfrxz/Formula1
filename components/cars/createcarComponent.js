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
        this.setupEvents();
    }

    setupEvents() {
        const form = this.shadowRoot.getElementById('carForm');
        const cancelBtn = this.shadowRoot.getElementById('cancelCreateCar');

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const newCar = this.getFormData();
            await addVehiculo(newCar);
            alert("Vehículo registrado con éxito");
            this.style.display = "none";
            document.querySelector("cars-component").style.display = "block";
        });

        cancelBtn.addEventListener("click", () => {
            this.style.display = "none";
            document.querySelector("cars-component").style.display = "block";
        });
    }

    getFormData() {
        const equipo = this.shadowRoot.getElementById("equipo").value;
        const modelo = this.shadowRoot.getElementById("modelo").value;
        const motor = this.shadowRoot.getElementById("motor").value;
        const velocidad = parseInt(this.shadowRoot.getElementById("velocidad").value);
        const aceleracion = parseFloat(this.shadowRoot.getElementById("aceleracion").value);
        const pilotos = Array.from(this.shadowRoot.querySelectorAll("#pilotos option:checked"), opt => parseInt(opt.value));
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
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
            <div class="container">
                <h2>Registrar Nuevo Vehículo</h2>
                <form id="carForm">
                    <div class="accordion" id="carAccordion">
                        <div class="accordion-item">
                            <h2 class="accordion-header">
                                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#generalInfo">
                                    Información General
                                </button>
                            </h2>
                            <div id="generalInfo" class="accordion-collapse collapse show">
                                <div class="accordion-body">
                                    <label>Equipo:</label>
                                    <select id="equipo" class="form-control">${this.equipos.map(eq => `<option value="${eq.nombre}">${eq.nombre}</option>`).join('')}</select>
                                    <label>Pilotos:</label>
                                    <select id="pilotos" class="form-control" multiple>${this.pilotos.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('')}</select>
                                    <label>Modelo:</label>
                                    <input type="text" id="modelo" class="form-control" required>
                                    <label>Motor:</label>
                                    <input type="text" id="motor" class="form-control" required>
                                    <label>Velocidad Máxima (km/h):</label>
                                    <input type="number" id="velocidad" class="form-control" required>
                                    <label>Aceleración 0-100 (s):</label>
                                    <input type="number" step="0.1" id="aceleracion" class="form-control" required>
                                    <label>Imagen (URL):</label>
                                    <input type="text" id="imagen" class="form-control">
                                </div>
                            </div>
                        </div>
                        <div class="accordion-item">
                            <h2 class="accordion-header">
                                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#performanceInfo">
                                    Rendimiento
                                </button>
                            </h2>
                            <div id="performanceInfo" class="accordion-collapse collapse">
                                <div class="accordion-body">
                                    ${this.renderPerformanceInputs("normal", "Conducción Normal")}
                                    ${this.renderPerformanceInputs("agresiva", "Conducción Agresiva")}
                                    ${this.renderPerformanceInputs("ahorro", "Ahorro de Combustible")}
                                </div>
                            </div>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary mt-3">Guardar</button>
                    <button type="button" class="btn btn-secondary mt-3" id="cancelCreateCar">Cancelar</button>
                </form>
            </div>
        `;
    }

    renderPerformanceInputs(prefix, label) {
        return `
            <h4>${label}</h4>
            <label>Velocidad Promedio (km/h):</label>
            <input type="number" id="${prefix}_velocidad" class="form-control" required>
            <label>Consumo Combustible:</label>
            <input type="number" id="${prefix}_comb_seco" class="form-control" placeholder="Seco" required>
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
