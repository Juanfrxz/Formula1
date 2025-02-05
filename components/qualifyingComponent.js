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
        /* Espacio para el navbar (60px) y el modelo ocupa el resto */
        .main-wrapper {
          width: 100%;
          margin-top: 60px;
          overflow: hidden;
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
              xr-spatial-tracking
              execution-while-out-of-viewport
              execution-while-not-rendered
              web-share
              src="https://sketchfab.com/models/c5b5587b06694b6aaf4d986ea6fa5769/embed?autostart=1&annotation_cycle=5">
            </iframe>
            <p style="font-size: 13px; font-weight: normal; margin: 5px; color: #4A4A4A;">
              <a href="https://sketchfab.com/3d-models/aston-martin-f1-amr23-2023-c5b5587b06694b6aaf4d986ea6fa5769?utm_medium=embed&utm_campaign=share-popup&utm_content=c5b5587b06694b6aaf4d986ea6fa5769" target="_blank" rel="nofollow" style="font-weight: bold; color: #1CAAD9;">aston_martin_f1_amr23_2023</a> by 
              <a href="https://sketchfab.com/jr563384?utm_medium=embed&utm_campaign=share-popup&utm_content=c5b5587b06694b6aaf4d986ea6fa5769" target="_blank" rel="nofollow" style="font-weight: bold; color: #1CAAD9;">jr563384</a> on 
              <a href="https://sketchfab.com?utm_medium=embed&utm_campaign=share-popup&utm_content=c5b5587b06694b6aaf4d986ea6fa5769" target="_blank" rel="nofollow" style="font-weight: bold; color: #1CAAD9;">Sketchfab</a>
            </p>
          </div>
        </div>
      </div>
    `;
  }

  initSketchfab() {
    // Se busca el iframe mediante su id para inicializar la API de Sketchfab
    const iframe = this.shadowRoot.querySelector("#sketchfab-iframe");
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