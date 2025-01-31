const API_URL = 'https://json-server-api-f1-production.up.railway.app';

// Equipos y Pilotos
export const getEquipos = async () => {
    const response = await fetch(`${API_URL}/equipos`);
    return response.json();
};

export const getPilotos = async () => {
    const response = await fetch(`${API_URL}/pilotos`);
    return response.json();
};

export const addEquipo = async (equipo) => {
    const response = await fetch(`${API_URL}/equipos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipo)
    });
    return response.json();
};

export const updateEquipo = async (id, equipo) => {
    const response = await fetch(`${API_URL}/equipos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipo)
    });
    return response.json();
};

export const deleteEquipo = async (id) => {
    await fetch(`${API_URL}/equipos/${id}`, { method: 'DELETE' });
};

export const addPiloto = async (piloto) => {
    const response = await fetch(`${API_URL}/pilotos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(piloto)
    });
    return response.json();
};

export const updatePiloto = async (id, piloto) => {
    const response = await fetch(`${API_URL}/pilotos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(piloto)
    });
    return response.json();
};

export const deletePiloto = async (id) => {
    await fetch(`${API_URL}/pilotos/${id}`, { method: 'DELETE' });
};

// Vehículos
export const getVehiculos = async () => {
    const response = await fetch(`${API_URL}/vehiculos`);
    return response.json();
};

export const addVehiculo = async (vehiculo) => {
    const response = await fetch(`${API_URL}/vehiculos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehiculo)
    });
    return response.json();
};

export const updateVehiculo = async (id, vehiculo) => {
    const response = await fetch(`${API_URL}/vehiculos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehiculo)
    });
    return response.json();
};

export const deleteVehiculo = async (id) => {
    await fetch(`${API_URL}/vehiculos/${id}`, { method: 'DELETE' });
};

export const asignarPilotoAVehiculo = async (id, pilotos) => {
    const response = await fetch(`${API_URL}/vehiculos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pilotos })
    });
    return response.json();
};

// Circuitos
export const getCircuitos = async () => {
    const response = await fetch(`${API_URL}/circuitos`);
    return response.json();
};

export const addCircuito = async (circuito) => {
    const response = await fetch(`${API_URL}/circuitos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(circuito)
    });
    return response.json();
};

export const updateCircuito = async (id, circuito) => {
    const response = await fetch(`${API_URL}/circuitos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(circuito)
    });
    return response.json();
};

export const deleteCircuito = async (id) => {
    await fetch(`${API_URL}/circuitos/${id}`, { method: 'DELETE' });
};

// Estadísticas y Clima
export const getCircuitoStats = async (id) => {
    const response = await fetch(`${API_URL}/circuitos/${id}`);
    return response.json();
};

export const getHistorialGanadores = async (id) => {
    const response = await fetch(`${API_URL}/circuitos/${id}/ganadores`);
    return response.json();
};

export const getClimaPromedio = async (id) => {
    const response = await fetch(`${API_URL}/circuitos/${id}/clima`);
    return response.json();
};

// Configuración de Vehículos
export const setModoConduccion = async (id, modo) => {
    const response = await fetch(`${API_URL}/vehiculos/${id}/rendimiento`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modo })
    });
    return response.json();
};

export const setCargaAerodinamica = async (id, carga) => {
    const response = await fetch(`${API_URL}/vehiculos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cargaAerodinamica: carga })
    });
    return response.json();
};

export const setPresionNeumaticos = async (id, presion) => {
    const response = await fetch(`${API_URL}/vehiculos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presionNeumaticos: presion })
    });
    return response.json();
};

export const setEstrategiaCombustible = async (id, estrategia) => {
    const response = await fetch(`${API_URL}/vehiculos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estrategiaCombustible: estrategia })
    });
    return response.json();
};

export const saveConfiguracionVehiculo = async (id, config) => {
    const response = await fetch(`${API_URL}/vehiculos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
    });
    return response.json();
};
