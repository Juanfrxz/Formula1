const audio = document.getElementById("backgroundAudio");
    const button = document.getElementById("audioToggle");
    const volumeControl = document.getElementById("volumeControl");
    audio.volume = 0.05; // Volumen inicial

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

// Carga de la página
window.addEventListener('load', function() {
  const loader = document.getElementById('loader');
  setTimeout(() => {
    // Agrega la clase para iniciar la transición de opacidad
    loader.classList.add('fade-out');
    // Espera a que la transición termine antes de ocultar el loader
    setTimeout(() => {
      loader.style.display = 'none';
    }, 500); // 500 ms = duración de la transición
  }, 3000); // Espera 3 segundos antes de iniciar la animación
});
