class QualifyingComponent extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }
  
    connectedCallback() {
      this.render();
      this.initSketchfab();
    }
  
    render() {
      this.shadowRoot.innerHTML = /*html*/`
        <style>
          :host {
            display: block;
            width: 100%;
            height: 100vh;
          }
          /* Se reserva un espacio para el navbar (60px) y el modelo ocupa el resto */
          .main-wrapper {
            width: 100%;
            margin-top: 60px;
          }
          .model-container {
            width: 100%;
            height: calc(100vh - 60px);
            position: relative;
          }
          .sketchfab-embed-wrapper {
            width: 100%;
            height: 100%;
            position: relative;
          }
          .sketchfab-embed-wrapper iframe {
            width: 100%;
            height: 100%;
            border: none;
          }
        </style>
        <div class="main-wrapper">
          <div class="model-container">
            <div class="sketchfab-embed-wrapper">
              <iframe id="sketchfab-iframe" 
                      title="aston_martin_f1_amr23_2023" 
                      frameborder="0" 
                      allowfullscreen 
                      mozallowfullscreen="true" 
                      webkitallowfullscreen="true" 
                      allow="autoplay; fullscreen; xr-spatial-tracking"
                      src="https://sketchfab.com/models/c5b5587b06694b6aaf4d986ea6fa5769/embed">
              </iframe>
            </div>
          </div>
        </div>
      `;
    }
    
  
    initSketchfab() {
      // Usamos el shadowRoot para buscar el iframe
      const iframe = this.shadowRoot.querySelector("#sketchfab-iframe");
      // Inicializamos la API de Sketchfab con la versión y modelo indicado
      const client = new Sketchfab("1.12.1", iframe);
      client.init("c5b5587b06694b6aaf4d986ea6fa5769", {
        success: (api) => {
          api.start();
          this.sketchfabApi = api;
        },
        error: () => {
          console.error("Error initializing Sketchfab Viewer");
        }
      });
    }
  }
  
  customElements.define("qualifying-component", QualifyingComponent);

  // Evento para mostrar el componente de Pole Position (utilizando el componente "qualifying-component")
  