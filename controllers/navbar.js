import { getVehiculos } from '../api/fetchApi.js';

document.addEventListener("DOMContentLoaded", async () => {
  const btnCarsDropdown = document.getElementById("btnCarsDropdown");
  const carsComponent = document.querySelector("cars-component");
  const videoBackground = document.querySelector("video");
  const navbarBrand = document.querySelector(".navbar-brand img");
  const btnDrivers = document.getElementById("btnDrivers");
  const driversComponent = document.querySelector("pilotos-component");
  const btnTeams = document.getElementById("btnTeams");
  const teamsComponent = document.querySelector("teams-component");
  const CreateCar = document.querySelector("create-car-component");
  const backgroundAudio = document.getElementById("backgroundAudio"); // Audio de fondo
  const audioControl = document.querySelector(".audio-control"); // Barra de música
  const dropdownMenu = document.getElementById("carsDropdownMenu");

  // Asegura que el componente no se muestre inicialmente
  carsComponent.style.display = "none";
  driversComponent.style.display = "none";
  CreateCar.style.display = "none";
  teamsComponent.style.display = "none";

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

        // Ocultar otros componentes
        document.querySelectorAll("create-car-component, edit-car-component, delete-car-component, pilotos-component, teams-component")
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

  // Al dar click en 'Cars', dirigir a la página completa de vehículos
  btnCarsDropdown.addEventListener("click", (e) => {
    e.preventDefault();

    // Pausar la música
    if (!backgroundAudio.paused) {
      backgroundAudio.pause();
    }

    // Ocultar otros componentes
    document.querySelectorAll("create-car-component, edit-car-component, delete-car-component, pilotos-component, teams-component")
      .forEach(el => el.style.display = "none");

    // Mostrar el componente de Cars (página completa)
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

  btnDrivers.addEventListener("click", (e) => {
    e.preventDefault();

    // Pausar la música al ingresar a "Drivers"

    if (!backgroundAudio.paused) {
      backgroundAudio.pause();
    }

    // Ocultar otros componentes
    document.querySelectorAll("create-car-component, edit-car-component, delete-car-component, cars-component, teams-component")
      .forEach(el => el.style.display = "none");

    // Mostrar el componente de Pilotos
    driversComponent.style.display = "block";


    // Ocultar el video de fondo si está presente
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

  btnTeams.addEventListener("click", (e) => {
    e.preventDefault();

    // Pausar la música al ingresar a "Teams"

    if (!backgroundAudio.paused) {
      backgroundAudio.pause();
    }

    // Ocultar otros componentes
    document.querySelectorAll("create-car-component, edit-car-component, delete-car-component, cars-component, pilotos-component")
      .forEach(el => el.style.display = "none");

    // Mostrar el componente de Pilotos
    teamsComponent.style.display = "block";



    // Ocultar el video de fondo si está presente
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

  // Evento para volver a la página principal al hacer clic en el logo
  navbarBrand.addEventListener("click", (e) => {
    e.preventDefault();

    // Ocultar otros componentes
    document.querySelectorAll("cars-component, create-car-component, edit-car-component, delete-car-component, pilotos-component, teams-component")
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