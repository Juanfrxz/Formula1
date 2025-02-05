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
        .container {
          margin-top: 1rem;
        }
        .card {
          border: 1px solid #ccc;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(174, 2, 2, 0.1);
          overflow: hidden;
          transition: box-shadow 0.3s, border-color 0.3s;
          text-align: center;
          cursor: pointer;
        }
        .card:hover {
          box-shadow: 0 0 15px rgba(174, 2, 2, 0.6);
          border-color: #AE0202;
        }
        .card img {
          width: 100%;
          height: auto;
          max-height: 200px;
          object-fit: cover;
        }
        .card-body {
          padding: 0.5rem;
        }
        .list-container {
          max-height: 70vh;
          overflow-y: auto;
          overflow-x: hidden;
        }
      </style>
      <div class="container">
        <h2>Select a Team</h2>
        <input type="text" id="search" class="form-control my-3" placeholder="Search team...">
        <div class="list-container">
          <div id="teams-list" class="row"></div>
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
      cardWrapper.classList.add('col-md-4', 'mb-3');

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
  }
}

customElements.define('team-selection-component', TeamSelectionComponent);
