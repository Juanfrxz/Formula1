document.addEventListener("DOMContentLoaded", () => {
  const btnCars = document.getElementById("btnCars");
  const carsComponent = document.querySelector("cars-component");
  const videoBackground = document.querySelector("video");
  const navbarBrand = document.querySelector(".navbar-brand img");
  const backgroundAudio = document.getElementById("backgroundAudio"); // Seleccionamos el audio de fondo
  const audioControl = document.querySelector(".audio-control"); // Seleccionamos la barra de música

  // Asegura que el componente no se muestre inicialmente
  carsComponent.style.display = "none";

  btnCars.addEventListener("click", (e) => {
    e.preventDefault();

    // Pausar la música cuando se ingresa a "Cars"
    if (!backgroundAudio.paused) {
      backgroundAudio.pause();
    }

    // Ocultar todos los demás componentes antes de mostrar el de Cars
    document.querySelectorAll("create-car-component, edit-car-component, delete-car-component")
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
  });

  // Evento para mostrar el video al hacer clic en el logo
  navbarBrand.addEventListener("click", (e) => {
    e.preventDefault();

    // Ocultar todos los componentes
    document.querySelectorAll("cars-component, create-car-component, edit-car-component, delete-car-component")
      .forEach(el => el.style.display = "none");

    // Mostrar el video de fondo
    if (videoBackground) {
      videoBackground.style.display = "block";
    }

    // Reanudar la música cuando se vuelve a la pantalla principal
    if (backgroundAudio.paused) {
      backgroundAudio.play();
    }

    // Mostrar la barra de música al regresar a la página principal
    if (audioControl) {
      audioControl.style.display = "flex";
    }
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
