import { getVehiculos, getPilotos } from '../api/fetchApi.js';

document.addEventListener("DOMContentLoaded", async () => {
  // Nuevo: Lógica para mostrar el navbar al hacer clic en el botón "Admin"
  const btnAdmin = document.getElementById("btnadmin");
  const navbar = document.querySelector("nav.navbar");
  if (btnAdmin && navbar) {
    btnAdmin.addEventListener("click", (e) => {
      e.preventDefault();
      // Remueve la clase "d-none" para hacer visible el navbar
      navbar.classList.remove("d-none");
    });
  }

  const btnCarsDropdown = document.getElementById("btnCarsDropdown");
  const carsComponent = document.querySelector("cars-component");
  const videoBackground = document.querySelector("video");
  const navbarBrand = document.querySelector(".navbar-brand img");
  const btnDrivers = document.getElementById("btnDrivers");
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
  const qualifyingComponent = document.querySelector("qualifying-component");

  // Define los selectores de los elementos que se inician ocultos.
  const initialHiddenSelectors = `
    cars-component, 
    pilotos-component, 
    create-car-component, 
    teams-component, 
    circuits-component, 
    edit-car-component, 
    delete-car-component,
    qualifying-component
  `;
  
  // Selecciona y oculta cada uno de ellos
  document.querySelectorAll(initialHiddenSelectors).forEach(el => {
    el.style.display = "none";
  });

  try {
    const cars = await getVehiculos();
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
        document.querySelectorAll("qualifying-component, create-car-component, edit-car-component, delete-car-component, pilotos-component, teams-component, circuits-component")
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
        link.innerHTML = `
          <img src="${car.imagen}" alt="${car.modelo}" class="car-preview">
          <div class="car-info">
            <p class="car-name">${car.modelo}</p>
            <p class="car-team">${car.equipo}</p>
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
    document.querySelectorAll("qualifying-component, create-car-component, edit-car-component, delete-car-component, pilotos-component, teams-component, circuits-component")
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
      if (!backgroundAudio.paused) {
        backgroundAudio.pause();
      }
      // Ocultar otros componentes
      document.querySelectorAll("qualifying-component, create-car-component, edit-car-component, delete-car-component, cars-component, teams-component, circuits-component")
        .forEach(el => el.style.display = "none");
      // Mostrar el componente de drivers (pilotos-component)
      driversComponent.style.display = "block";
      if (videoBackground) {
        videoBackground.style.display = "none";
      }
      if (audioControl) {
        audioControl.style.display = "none";
      }
      document.body.style.overflow = "auto";
      driversComponent.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
  // Desplegable para drivers (pilotos)
try {
  const drivers = await getPilotos();
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
      document.querySelectorAll("qualifying-component, create-car-component, edit-car-component, delete-car-component, cars-component, teams-component, circuits-component")
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
      
      // Ajustado el tamaño de la imagen y mejorado el diseño
      link.innerHTML = `
        <img src="${driver.foto}" alt="${driver.nombre}" 
          style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%; margin-right: 15px;">
        <div class="driver-info" style="flex-grow: 1;">
          <p style="margin: 0; font-size: 16px; font-weight: 500;">${driver.nombre}</p>
          <p style="margin: 0; font-size: 14px; color: #666;">${driver.equipo}</p>
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
        link.style.backgroundColor = "#f8f9fa";
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
    document.querySelectorAll("qualifying-component, create-car-component, edit-car-component, delete-car-component, cars-component, pilotos-component, circuits-component")
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
      document.querySelectorAll("qualifying-component, cars-component, create-car-component, edit-car-component, delete-car-component, pilotos-component, teams-component")
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
    document.querySelectorAll("qualifying-component, cars-component, create-car-component, edit-car-component, delete-car-component, pilotos-component, teams-component, circuits-component")
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
});