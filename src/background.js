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
