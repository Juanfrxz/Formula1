import { getEquipos } from '../../api/fetchApi.js';

class TeamSelectionComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.teams = [];
    this.filteredTeams = [];
    this.shadowRoot.innerHTML = `
      <!-- Bootstrap CSS -->
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
      <style>
        :host {
          display: block;
          padding: 20px;
        }
        /* Usamos container-fluid para ocupar todo el ancho */
        .container-fluid {
          margin-top: 1rem;
        }
        /* Se establecen dimensiones fijas en la tarjeta */
        .card {
          border: 1px solid #ccc;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(174, 2, 2, 0.1);
          overflow: hidden;
          transition: box-shadow 0.3s, border-color 0.3s;
          text-align: center;
          cursor: pointer;
          height: 300px; /* altura fija */
          display: flex;
          flex-direction: column;
        }
        .card:hover {
          box-shadow: 0 0 15px rgba(174, 2, 2, 0.6);
          border-color: #AE0202;
        }
        /* Fija la altura de la imagen y usa object-fit para recortar correctamente */
        .card img {
          width: 100%;
          height: 150px;  /* altura fija para imagen */
          object-fit: cover;
        }
        .card-body {
          padding: 0.5rem;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .list-container {
          max-height: 70vh;
          overflow-y: auto;
          overflow-x: hidden;
        }
        /* Estilos para el popup (similar a circuitselectionComponent) */
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease-in-out;
        }
        .popup-content {
          background: linear-gradient(135deg, #ffffff, #f9f9f9);
          padding: 30px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
          max-width: 400px;
          width: 90%;
          animation: slideDown 0.3s ease-in-out;
        }
        .popup-content p {
          font-size: 1.2rem;
          color: #333;
          margin-bottom: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .close-popup-btn {
          background-color: #007bff;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          font-size: 1rem;
          color: #fff;
          box-shadow: 0 4px 6px rgba(0, 123, 255, 0.4);
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .close-popup-btn:hover {
          background-color: #0056b3;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      </style>
      <div class="container-fluid">
        <h2>Select a Team</h2>
        <input type="text" id="search" class="form-control my-3" placeholder="Search team...">
        <div class="list-container">
          <div id="teams-list" class="row row-cols-5"></div>
        </div>
      </div>
    `;
  }

  async connectedCallback() {
    await this.loadTeams();
    const searchInput = this.shadowRoot.getElementById('search');
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      this.filteredTeams = this.teams.filter(team =>
        team.nombre.toLowerCase().includes(query)
      );
      this.updateTeams();
    });
  }

  async loadTeams() {
    try {
      this.teams = await getEquipos();
      this.filteredTeams = [...this.teams];
      this.updateTeams();
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  }

  updateTeams() {
    const teamsListContainer = this.shadowRoot.getElementById('teams-list');
    teamsListContainer.innerHTML = "";
    this.filteredTeams.forEach(team => {
      const cardWrapper = document.createElement('div');
      cardWrapper.classList.add('col', 'mb-3');

      const card = document.createElement('div');
      card.classList.add('card');
      card.innerHTML = `
        <img src="${team.imagen}" alt="Imagen de ${team.nombre}" class="card-img-top">
        <div class="card-body">
          <h5 class="card-title">${team.nombre}</h5>
          <button class="btn btn-primary select-button">Select</button>
        </div>
      `;
      card.querySelector('.select-button').addEventListener('click', () => this.selectTeam(team));
      cardWrapper.appendChild(card);
      teamsListContainer.appendChild(cardWrapper);
    });
  }

  selectTeam(team) {
    // Dispatch a custom event so that the parent component can listen 
    // and store the selected team's id (along with any additional data)
    const event = new CustomEvent('teamSelected', {
      detail: team,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
    console.log("Selected team:", team.id);
    this.showPopup("Successfully selected team ✅");
  }

  showPopup(message) {
    const popupOverlay = document.createElement('div');
    popupOverlay.className = 'popup-overlay';

    const popupContent = document.createElement('div');
    popupContent.className = 'popup-content';

    const messagePara = document.createElement('p');
    messagePara.textContent = message;
    popupContent.appendChild(messagePara);

    const closeButton = document.createElement('button');
    closeButton.className = 'close-popup-btn';
    closeButton.textContent = 'Close';
    popupContent.appendChild(closeButton);

    popupOverlay.appendChild(popupContent);
    this.shadowRoot.appendChild(popupOverlay);

    closeButton.addEventListener('click', () => {
      this.shadowRoot.removeChild(popupOverlay);
    });

    popupOverlay.addEventListener('click', (e) => {
      if (e.target === popupOverlay) {
        this.shadowRoot.removeChild(popupOverlay);
      }
    });
  }
}

customElements.define('team-selection-component', TeamSelectionComponent);
