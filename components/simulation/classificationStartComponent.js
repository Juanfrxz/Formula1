import { getPartida, getEquipoById, getPilotos, getCircuitos } from '../../api/fetchApi.js';

class ClassificationStartComponent extends HTMLElement {
    constructor() {
        super();
        this.partidaId = null;
        // Array para almacenar los resultados de cada simulación
        this.results = [];
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML =/*html*/ `
            <!-- Importando Bootstrap desde CDN -->
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" crossorigin="anonymous">
            <style>
                :host {
                    display: block;
                    width: 80vw;
                    height: 100vh;
                    margin: 0;
                    padding: 0;
                }
                .full-screen-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                    margin: 0;
                    padding: 0;
                }
                table {
                    width: auto;
                    margin: 0 auto;
                    border-collapse: separate;
                    border-spacing: 0;
                    border-radius: 10px;
                    overflow: hidden;
                }
                thead th {
                    text-align: center;
                }
                tbody tr td {
                    text-align: center;
                    background-color: #f2f2f2;
                }
                button#start-btn {
                    margin-top: 20px;
                }
            </style>
            <div class="full-screen-container">
                <table class="table table-striped table-bordered">
                    <thead class="thead-dark">
                        <tr>
                            <th>Driver</th>
                            <th>Team</th>
                            <th>Time (s)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="3">&nbsp;</td>
                        </tr>
                    </tbody>
                </table>
                <button id="start-btn" class="btn btn-danger">Start</button>
            </div>
        `;

        this.shadowRoot.getElementById('start-btn')
            .addEventListener('click', () => this.startActions());
    }

    // Indicamos que queremos observar el atributo 'partida'
    static get observedAttributes() {
        return ['partida'];
    }

    // Este método se ejecuta cada vez que cambia uno de los atributos observados
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'partida') {
            this.partidaId = newValue;
            console.log("Atributo 'partida' actualizado:", this.partidaId);
        }
    }

    connectedCallback() {
        // En caso de que el atributo ya se haya establecido antes del connectedCallback,
        // podemos obtener su valor directamente.
        if (!this.partidaId && this.hasAttribute('partida')) {
            this.partidaId = this.getAttribute('partida');
        }
        // Escucha el evento "partidaCreated" emitido globalmente
        document.addEventListener('partidaCreated', this.handlePartidaCreated.bind(this));
    }

    // Función para manejar el evento "partidaCreated"
    handlePartidaCreated(event) {
        const partidaId = event.detail.partidaId;
        console.log("Partida ID recibido en ClassificationStartComponent:", partidaId);
        this.partidaId = partidaId;
    }

    // Método que muestra un popup de carga durante 3 segundos y luego inicia las acciones
    async startActions() {
        // Mostrar popup de carga
        this.showLoadingPopup();

        // Esperar 3 segundos (3000 ms)
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Ocultar popup de carga
        this.hideLoadingPopup();

        console.log("Iniciando acciones con la partida ID:", this.partidaId);
        const datos = await obtenerDatosPartidaYLongitud(this.partidaId);
        if (!datos) {
            console.error("No se pudieron extraer los datos para el cálculo.");
            return;
        }
        if (!datos.longitudPista || !datos.velocidadPromedio) {
            console.error("Datos insuficientes para calcular el tiempo de recorrido.");
            return;
        }
        // Cálculo del tiempo base (en segundos), considerando que velocidadPromedio está en km/h
        const baseTimeSeconds = (datos.longitudPista / datos.velocidadPromedio) * 3600;
        // Aplicar modificadores: se asume que aeroValue y pressureValue reducen el tiempo y consumoCombustibleEstrategia lo aumenta
        const modifier = 1 - ((datos.aeroValue + datos.pressureValue) * 0.01) + (datos.consumoCombustibleEstrategia * 0.01);
        const totalTimeSeconds = baseTimeSeconds * modifier;
        console.log("Tiempo estimado de recorrido (segundos):", totalTimeSeconds);
        
        // Con el id del driver, obtenemos la información del piloto y luego su equipo
        let driverName = 'Driver desconocido';
        let teamName = 'Equipo desconocido';
        try {
            const pilotos = await getPilotos();
            const pilotoEncontrado = pilotos.find(p => p.id === datos.driver);
            if (pilotoEncontrado) {
                driverName = pilotoEncontrado.nombre;
                const equipoData = await getEquipoById(pilotoEncontrado.equipo);
                if (equipoData) {
                    teamName = equipoData.nombre;
                }
            }
        } catch (error) {
            console.error("Error al obtener datos del driver o del equipo:", error);
        }
        
        // Crear un objeto resultado con el nombre del driver, nombre del equipo y el tiempo calculado
        const result = {
            driver: driverName,
            team: teamName,
            time: totalTimeSeconds
        };
        
        // Agregar el resultado al array y actualizar la tabla
        this.results.push(result);
        this.updateResultsTable();
    }

    // Función que actualiza la tabla de clasificación según el tiempo (de menor a mayor)
    updateResultsTable() {
        // Ordenar resultados por tiempo ascendente
        this.results.sort((a, b) => a.time - b.time);

        // Construir el HTML para las filas de la tabla
        const rowsHtml = this.results.map(result => `
            <tr>
                <td>${result.driver}</td>
                <td>${result.team}</td>
                <td>${result.time.toFixed(2)} s</td>
            </tr>
        `).join('');

        // Actualizar el contenido del <table> en el Shadow DOM
        const table = this.shadowRoot.querySelector('table');
        table.innerHTML = `
            <thead class="thead-dark">
                <tr>
                    <th>Driver</th>
                    <th>Equipo</th>
                    <th>Tiempo (s)</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        `;
    }

    // Muestra un popup de carga en el componente
    showLoadingPopup() {
        let overlay = this.shadowRoot.getElementById('loading-popup');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loading-popup';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.background = 'rgba(0, 0, 0, 0.5)';
            overlay.style.display = 'flex';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';
            overlay.style.zIndex = '1000';
            overlay.innerHTML = `<div style="background: #fff; padding: 20px; border-radius: 8px;">Cargando...</div>`;
            this.shadowRoot.appendChild(overlay);
        } else {
            overlay.style.display = 'flex';
        }
    }

    // Oculta el popup de carga
    hideLoadingPopup() {
        const overlay = this.shadowRoot.getElementById('loading-popup');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
}

async function obtenerDatosPartidaYLongitud(partidaId) {
    try {
        // Obtener los datos de la partida
        const partida = await getPartida(partidaId);

        if (!partida) {
            throw new Error("No se encontró la partida con el id proporcionado.");
        }

        // Extraer detalles del driver y del equipo
        const driver = partida.equipo?.driver || 'Driver desconocido';
        const team = partida.equipo?.nombre || 'Equipo desconocido';
        const configuracionVehiculos = partida.configuracion?.configuracionVehiculos || {};
        const velocidadPromedio = configuracionVehiculos.velocidadPromedio;
        const consumoCombustibleEstrategia = configuracionVehiculos.consumoCombustibleEstrategia;
        const pressureValue = configuracionVehiculos.pressureValue;
        const aeroValue = configuracionVehiculos.aeroValue;

        // Extraer la pista seleccionada
        const pistaSeleccionada = (partida.pista && partida.pista.length > 0)
            ? partida.pista[0].pistaSeleccionada
            : null;
        
        let longitudPista = null;
        if (pistaSeleccionada) {
            const circuitos = await getCircuitos();
            const circuitoEncontrado = circuitos.find(c => c.id === pistaSeleccionada);
            if (!circuitoEncontrado) {
                console.error('No se encontró circuito con id:', pistaSeleccionada);
            } else {
                longitudPista = circuitoEncontrado.longitud_km;
            }
        }

        // Imprimir en consola los datos extraídos
        console.log("Driver:", driver);
        console.log("Equipo:", team);
        console.log("Velocidad Promedio:", velocidadPromedio);
        console.log("Consumo de Combustible Estrategia:", consumoCombustibleEstrategia);
        console.log("Pressure Value:", pressureValue);
        console.log("Aero Value:", aeroValue);
        console.log("Pista Seleccionada:", pistaSeleccionada);
        console.log("Longitud del circuito:", longitudPista);

        // Retornar un objeto con los datos extraídos, en caso de necesitarlos posteriormente
        return {
            driver,
            team,
            velocidadPromedio,
            consumoCombustibleEstrategia,
            pressureValue,
            aeroValue,
            pistaSeleccionada,
            longitudPista,
        };
    } catch (error) {
        console.error("Error al obtener datos de la partida y la longitud de la pista:", error);
        return null;
    }
}

async function calcularTiempoDeRecorrido(partidaId) {
    const datos = await obtenerDatosPartidaYLongitud(partidaId);
    if (!datos) {
        console.error('No se pudieron extraer los datos para el cálculo.');
        return;
    }
    if (!datos.longitudPista || !datos.velocidadPromedio) {
        console.error('Datos insuficientes para calcular el tiempo de recorrido.');
        return;
    }
    // Cálculo del tiempo base (en segundos), asumiendo que velocidadPromedio está en km/h
    const baseTimeSeconds = (datos.longitudPista / datos.velocidadPromedio) * 3600;
    // Se aplican los modificadores: se asume que aeroValue y pressureValue mejoran el desempeño (reducen el tiempo)
    // y que un mayor consumoCombustibleEstrategia puede aumentar el tiempo.
    const modifier = 1 - ((datos.aeroValue + datos.pressureValue) * 0.01) + (datos.consumoCombustibleEstrategia * 0.01);
    const totalTimeSeconds = baseTimeSeconds * modifier;
    console.log("Tiempo estimado de recorrido (segundos):", totalTimeSeconds);
    return totalTimeSeconds;
}

customElements.define('classification-start-component', ClassificationStartComponent);
