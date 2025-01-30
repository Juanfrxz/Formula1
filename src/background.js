// Espera 3 segundos (3000 ms) antes de mostrar el menú
setTimeout(() => {
    const menu = document.getElementById('menu');
    menu.classList.add('show'); // Agrega la clase para mostrar el menú
  }, 1500);
  
  const audio = document.getElementById("backgroundAudio");
    const button = document.getElementById("audioToggle");
    const volumeControl = document.getElementById("volumeControl");

    // Botón de Play/Pause
    button.addEventListener("click", () => {
      if (audio.paused) {
        audio.play();
        button.textContent = "🔊"; // Cambia el icono cuando está sonando
      } else {
        audio.pause();
        button.textContent = "🔇"; // Cambia el icono cuando está pausado
      }
    });

    // Control de volumen
    volumeControl.addEventListener("input", (event) => {
      audio.volume = event.target.value;
    });