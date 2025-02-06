import { getVehiculos, getPilotos, getEquipos } from '../api/fetchApi.js';

document.addEventListener("DOMContentLoaded", async () => {
  // La funcionalidad para mostrar el navbar mediante el botón "Admin" se ha removido,
  // de modo que el navbar se mostrará siempre.
  
  const btnCarsDropdown = document.getElementById("btnCarsDropdown");
  const carsComponent = document.querySelector("cars-component");
  const videoBackground = document.querySelector("video");
  const navbarBrand = document.querySelector(".navbar-brand img");
  const btnDrivers = document.getElementById("btnDriversDropdown");
  const driversComponent = document.querySelector("pilotos-component");
  const btnTeams = document.getElementById("btnTeams");
  const teamsComponent = document.querySelector("teams-component");
  const CreateCar = document.querySelector("create-car-component");
  const btnCircuits = document.getElementById("btnCircuits");
  const circuitsComponent = document.querySelector("circuits-component");
  const backgroundAudio = document.getElementById("backgroundAudio"); // Audio de fondo
  const audioControl = document.querySelector(".audio-control"); // Barra de música
  const dropdownMenu = document.getElementById("carsDropdownMenu");
  const btnPolePosition = document.getElementById("btnPolePosition");
  const qualifyingComponent = document.querySelector("simulation-component");

  // Define los selectores de los elementos que se inician ocultos.
  const initialHiddenSelectors = `
    cars-component, 
    pilotos-component, 
    create-car-component, 
    teams-component, 
    circuits-component, 
    edit-car-component, 
    delete-car-component,
    simulation-component
  `;
  
  // Selecciona y oculta cada uno de ellos
  document.querySelectorAll(initialHiddenSelectors).forEach(el => {
    el.style.display = "none";
  });

  try {
    const cars = await getVehiculos();
    const equipos = await getEquipos();
    if (dropdownMenu) {
      dropdownMenu.innerHTML = `
        <li class="all-teams">
          <a href="#" class="dropdown-item">
            <div class="car-info">
              <p class="car-name">All Teams</p>
              <p class="car-team">Ver todos los equipos</p>
            </div>
          </a>
        </li>
      `;
      
      // Agregar el evento click para "All Teams"
      const allTeamsLink = dropdownMenu.querySelector('.all-teams a');
      allTeamsLink.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Pausar la música
        if (!backgroundAudio.paused) {
          backgroundAudio.pause();
        }

        // Ocultar otros componentes (incluyendo circuits-component)
        document.querySelectorAll("simulation-component, create-car-component, edit-car-component, delete-car-component, pilotos-component, teams-component, circuits-component")
          .forEach(el => el.style.display = "none");

        // Mostrar el componente de Cars
        carsComponent.style.display = "block";

        // Ocultar el video de fondo
        if (videoBackground) {
          videoBackground.style.display = "none";
        }

        // Ocultar la barra de música
        if (audioControl) {
          audioControl.style.display = "none";
        }

        // Permitir scroll y desplazar la vista
        document.body.style.overflow = "auto";
        carsComponent.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      // Continuar con el resto de los coches
      cars.forEach(car => {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.classList.add("dropdown-item");
        link.href = "#";
        // Buscar el equipo basado en el id almacenado en car.equipo
        const team = equipos.find(eq => eq.id === car.equipo);
        const teamName = team ? team.nombre : car.equipo;
        link.innerHTML = `
          <img src="${car.imagen}" alt="${car.modelo}" class="car-preview">
          <div class="car-info">
            <p class="car-name">${car.modelo}</p>
            <p class="car-team">${teamName}</p>
          </div>
        `;
        
        link.addEventListener("click", (e) => {
          e.preventDefault();
          if (carsComponent && typeof carsComponent.showCarDetails === "function") {
            carsComponent.showCarDetails(car);
          } else {
            carsComponent.style.display = "block";
            carsComponent.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
        
        li.appendChild(link);
        dropdownMenu.appendChild(li);
      });
    }
  } catch (error) {
    console.error("Error fetching vehicles: ", error);
  }

  // Evento para mostrar el componente de Cars
  btnCarsDropdown.addEventListener("click", (e) => {
    e.preventDefault();

    // Pausar la música
    if (!backgroundAudio.paused) {
      backgroundAudio.pause();
    }

    // Ocultar otros componentes (incluyendo circuits-component)
    document.querySelectorAll("simulation-component, create-car-component, edit-car-component, delete-car-component, pilotos-component, teams-component, circuits-component")
      .forEach(el => el.style.display = "none");

    // Mostrar el componente de Cars
    carsComponent.style.display = "block";

    // Ocultar el video de fondo
    if (videoBackground) {
      videoBackground.style.display = "none";
    }

    // Ocultar la barra de música
    if (audioControl) {
      audioControl.style.display = "none";
    }

    // Permitir scroll y desplazar la vista hacia el componente de Cars
    document.body.style.overflow = "auto";
    carsComponent.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Evento para activar el componente de Drivers al hacer clic en el botón "Drivers"
  if (btnDrivers) {
    btnDrivers.addEventListener("click", (e) => {
      e.preventDefault();

      // Pausar la música si está sonando
      if (backgroundAudio && !backgroundAudio.paused) {
        backgroundAudio.pause();
      }

      // Ocultar otros componentes
      document.querySelectorAll(
        "simulation-component, create-car-component, edit-car-component, delete-car-component, cars-component, teams-component, circuits-component"
      ).forEach(el => el.style.display = "none");

      // Mostrar el componente de drivers (pilotos-component)
      driversComponent.style.display = "block";

      // Opcional: ocultar el video de fondo y la barra de música
      if (videoBackground) {
        videoBackground.style.display = "none";
      }
      if (audioControl) {
        audioControl.style.display = "none";
      }

      // Permitir scroll y desplazar la vista hacia el componente de drivers
      document.body.style.overflow = "auto";
      driversComponent.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
  // Desplegable para drivers (pilotos)
  try {
    const drivers = await getPilotos();
    const equipos = await getEquipos(); // Obtenemos la lista de equipos
    const dropdownMenuDrivers = document.getElementById("driversDropdownMenu");
    if (dropdownMenuDrivers) {
      // Insertar opción para "Todos los Pilotos"
      dropdownMenuDrivers.innerHTML = `
        <li class="all-drivers">
          <a href="#" class="dropdown-item">
            <div class="driver-info">
              <p class="driver-name" style="margin: 0; font-size: 16px;">All Drivers</p>
              <p class="driver-team" style="margin: 0; font-size: 14px; color: #666;">Ver todos los pilotos</p>
            </div>
          </a>
        </li>
      `;
      
      // Evento para "Todos los Pilotos"
      const allDriversLink = dropdownMenuDrivers.querySelector(".all-drivers a");
      allDriversLink.addEventListener("click", (e) => {
        e.preventDefault();
        if (!backgroundAudio.paused) {
          backgroundAudio.pause();
        }
        document.querySelectorAll("simulation-component, create-car-component, edit-car-component, delete-car-component, cars-component, teams-component, circuits-component")
          .forEach(el => el.style.display = "none");
        driversComponent.style.display = "block";
        if (videoBackground) videoBackground.style.display = "none";
        if (audioControl) audioControl.style.display = "none";
        document.body.style.overflow = "auto";
        driversComponent.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      
      // Recorrer la lista de drivers
      drivers.forEach(driver => {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.classList.add("dropdown-item");
        link.href = "#";
        link.style.display = "flex";
        link.style.alignItems = "center";
        link.style.padding = "10px 15px";
        
        // Usar el id almacenado en driver.equipo para buscar el nombre del equipo
        const team = equipos.find(eq => eq.id === driver.equipo);
        const teamName = team ? team.nombre : driver.equipo;
        
        link.innerHTML = `
          <img src="${driver.foto}" alt="${driver.nombre}" 
            style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%; margin-right: 15px;">
          <div class="driver-info" style="flex-grow: 1;">
            <p style="margin: 0; font-size: 16px; font-weight: 500;">${driver.nombre}</p>
            <p style="margin: 0; font-size: 14px; color: #666;">${teamName}</p>
          </div>
        `;
        
        link.addEventListener("click", (e) => {
          e.preventDefault();
          if (driversComponent && typeof driversComponent.showDriverDetails === "function") {
            driversComponent.showDriverDetails(driver);
          } else {
            driversComponent.style.display = "block";
            driversComponent.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
        
        // Agregar hover effect
        link.addEventListener("mouseover", () => {
          link.style.backgroundColor = "";
        });
        
        link.addEventListener("mouseout", () => {
          link.style.backgroundColor = "";
        });
        
        li.appendChild(link);
        dropdownMenuDrivers.appendChild(li);
      });
    }
  } catch (error) {
    console.error("Error fetching drivers: ", error);
  }

  // Evento para mostrar el componente de Teams
  btnTeams.addEventListener("click", (e) => {
    e.preventDefault();

    // Pausar la música
    if (!backgroundAudio.paused) {
      backgroundAudio.pause();
    }

    // Ocultar otros componentes (incluyendo circuits-component)
    document.querySelectorAll("simulation-component, create-car-component, edit-car-component, delete-car-component, cars-component, pilotos-component, circuits-component")
      .forEach(el => el.style.display = "none");

    // Mostrar el componente de Teams
    teamsComponent.style.display = "block";

    // Ocultar el video de fondo
    if (videoBackground) {
      videoBackground.style.display = "none";
    }

    // Ocultar la barra de música
    if (audioControl) {
      audioControl.style.display = "none";
    }

    // Permitir scroll y desplazar la vista
    document.body.style.overflow = "auto";
    carsComponent.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Evento para mostrar el componente de Circuits
  if (btnCircuits && circuitsComponent) {
    btnCircuits.addEventListener("click", (e) => {
      e.preventDefault();

      // Pausar la música
      if (!backgroundAudio.paused) {
        backgroundAudio.pause();
      }

      // Ocultar otros componentes
      document.querySelectorAll("simulation-component, cars-component, create-car-component, edit-car-component, delete-car-component, pilotos-component, teams-component")
        .forEach(el => el.style.display = "none");

      // Mostrar el componente de Circuits
      circuitsComponent.style.display = "block";

      // Ocultar el video de fondo
      if (videoBackground) {
        videoBackground.style.display = "none";
      }

      // Ocultar la barra de música
      if (audioControl) {
        audioControl.style.display = "none";
      }

      // Permitir scroll y desplazar la vista hacia el componente de Circuits
      document.body.style.overflow = "auto";
      circuitsComponent.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // Evento para volver a la página principal al hacer clic en el logo
  navbarBrand.addEventListener("click", (e) => {
    e.preventDefault();

    // Ocultar todos los componentes (incluyendo circuits-component)
    document.querySelectorAll("simulation-component, cars-component, create-car-component, edit-car-component, delete-car-component, pilotos-component, teams-component, circuits-component")
      .forEach(el => el.style.display = "none");

    // Mostrar el video de fondo
    if (videoBackground) {
      videoBackground.style.display = "block";
    }

    // Reanudar la música si está pausada
    if (backgroundAudio.paused) {
      backgroundAudio.play();
    }

    // Mostrar la barra de música
    if (audioControl) {
      audioControl.style.display = "flex";
    }

    // Quitar el scroll volviendo a ocultarlo
    document.body.style.overflow = "hidden";
  });

  // Evento para mostrar el componente de pole position
  btnPolePosition.addEventListener("click", (e) => {
    e.preventDefault();


    // Pausar la música
    if (!backgroundAudio.paused) {
      backgroundAudio.pause();
    }

    // Ocultar otros componentes (incluyendo circuits-component)
    document.querySelectorAll("cars-component, create-car-component, edit-car-component, delete-car-component, pilotos-component, teams-component, circuits-component")
      .forEach(el => el.style.display = "none");

    // Mostrar el componente de pole position
    qualifyingComponent.style.display = "block";


    // Ocultar el video de fondo
    if (videoBackground) {
      videoBackground.style.display = "none";
    }

    // Ocultar la barra de música
    if (audioControl) {
      audioControl.style.display = "none";
    }

    // Permitir scroll y desplazar la vista hacia el componente de pole position
    document.body.style.overflow = "auto";
    qualifyingComponent.scrollIntoView({ behavior: "smooth", block: "start" });

  });

  // Ocultar la barra de música al hacer clic en cualquiera de los enlaces del navbar
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (audioControl) {
        audioControl.style.display = "none";
      }
    });
  });

  // ===============================
  // NUEVA LÓGICA PARA ADMIN / USER
  // ===============================

  // Declaramos isAdmin con valor por defecto false
  let isAdmin = false;

  // Función para actualizar la visibilidad de las opciones en cada componente
  function updateAdminOptions(isAdmin) {
    const components = [teamsComponent, driversComponent, carsComponent, circuitsComponent];
    components.forEach(component => {
      if (component && component.shadowRoot) {
        // Se asume que en el shadow DOM de cada componente existe un contenedor de opciones con la clase "dropdown"
        const dropdown = component.shadowRoot.querySelector(".dropdown");
        if (dropdown) {
          if (isAdmin) {
            dropdown.classList.remove("d-none");
          } else {
            dropdown.classList.add("d-none");
          }
        }
      }
    });
  }

  // Mostrar las opciones de admin (o no) al cargar la página
  updateAdminOptions(isAdmin);

  // Función para mostrar un popup de error (en lugar de un alert)
  function showErrorPopup(message) {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "10000";

    const popup = document.createElement("div");
    popup.style.backgroundColor = "#fff";
    popup.style.padding = "20px";
    popup.style.borderRadius = "8px";
    popup.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.2)";
    popup.innerHTML = `
      <p style="margin-bottom: 20px;">${message}</p>
      <button style="padding: 5px 10px; border: none; background-color: rgb(218, 3, 3); color: #fff; border-radius: 4px; cursor: pointer;">OK</button>
    `;

    overlay.appendChild(popup);

    // Al hacer clic en el botón o sobre el overlay se quita el popup
    popup.querySelector("button").addEventListener("click", () => {
      document.body.removeChild(overlay);
    });
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        document.body.removeChild(overlay);
      }
    });

    document.body.appendChild(overlay);
  }

  // Función para mostrar un popup con un campo de contraseña en lugar de un prompt
  function showPasswordPopup(callback) {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "10000";

    const popup = document.createElement("div");
    popup.style.backgroundColor = "#fff";
    popup.style.padding = "20px";
    popup.style.borderRadius = "8px";
    popup.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.2)";
    popup.innerHTML = `
      <h3 style="margin-top: 0; margin-bottom: 10px;">Ingrese contraseña para Admin</h3>
      <input type="password" id="adminPasswordInput" placeholder="Contraseña" style="width: 100%; padding: 8px; margin-bottom: 15px;" />
      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button id="adminCancelBtn" style="padding: 5px 10px; border: none; background-color: #ccc; border-radius: 4px; cursor: pointer;">Cancelar</button>
        <button id="adminSubmitBtn" style="padding: 5px 10px; border: none; background-color: rgb(218, 3, 3); color: #fff; border-radius: 4px; cursor: pointer;">Aceptar</button>
      </div>
    `;
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    const cancelBtn = popup.querySelector("#adminCancelBtn");
    cancelBtn.addEventListener("click", () => {
      document.body.removeChild(overlay);
    });

    const submitBtn = popup.querySelector("#adminSubmitBtn");
    submitBtn.addEventListener("click", () => {
      const passwordInput = popup.querySelector("#adminPasswordInput").value;
      document.body.removeChild(overlay);
      callback(passwordInput === "1234");
    });
  }

  // Selección de botones de autenticación en index.html
  const btnAdmin = document.getElementById("btnAdmin");
  const btnUser = document.getElementById("btnUser");

  // Configuración para el botón Admin: Se muestra un popup personalizado para ingresar la contraseña
  if (btnAdmin) {
    btnAdmin.addEventListener("click", (e) => {
      e.preventDefault();
      showPasswordPopup((isValid) => {
        if (isValid) {
          isAdmin = true;
          updateAdminOptions(isAdmin);
        } else {
          showErrorPopup("Contraseña incorrecta. Acceso denegado.");
          isAdmin = false;
          updateAdminOptions(isAdmin);
        }
      });
    });
  }

  // Configuración para el botón User: desactiva el modo Admin
  if (btnUser) {
    btnUser.addEventListener("click", (e) => {
      e.preventDefault();
      isAdmin = false;
      updateAdminOptions(isAdmin);
    });
  }
});