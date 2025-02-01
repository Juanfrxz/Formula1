document.addEventListener("DOMContentLoaded", () => {
  const btnCars = document.getElementById("btnCars");
  const carsComponent = document.querySelector("cars-component");
  const videoBackground = document.querySelector("video");
  const navbarBrand = document.querySelector(".navbar-brand img");
  const btnDrivers = document.getElementById("btnDrivers");
  const driversComponent = document.querySelector("pilotos-component");
  const CreateCar = document.querySelector("create-car-component");
  const backgroundAudio = document.getElementById("backgroundAudio"); // Audio de fondo
  const audioControl = document.querySelector(".audio-control"); // Barra de música

  // Asegura que el componente no se muestre inicialmente
  carsComponent.style.display = "none";
  driversComponent.style.display = "none";
  CreateCar.style.display = "none";


  btnCars.addEventListener("click", (e) => {
    e.preventDefault();

    // Pausar la música al ingresar a "Cars"
    if (!backgroundAudio.paused) {
      backgroundAudio.pause();
    }

    // Ocultar otros componentes
    document.querySelectorAll("create-car-component, edit-car-component, delete-car-component, pilotos-component")
      .forEach(el => el.style.display = "none");

    // Mostrar el componente de Cars
    carsComponent.style.display = "block";

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

  btnDrivers.addEventListener("click", (e) => {
    e.preventDefault();

    // Pausar la música al ingresar a "Drivers"

    if (!backgroundAudio.paused) {
      backgroundAudio.pause();
    }

    // Ocultar otros componentes
    document.querySelectorAll("create-car-component, edit-car-component, delete-car-component, cars-component")
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

  // Evento para volver a la página principal al hacer clic en el logo
  navbarBrand.addEventListener("click", (e) => {
    e.preventDefault();

    // Ocultar otros componentes
    document.querySelectorAll("cars-component, create-car-component, edit-car-component, delete-car-component, pilotos-component")
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