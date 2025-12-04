import axios from 'axios';

const API_BASE = 'http://localhost:8222/api/enseignant'; // ton backend enseignants

const enseignantService = {
  // 1️⃣ Récupérer tous les enseignants disponibles pour une date/heure/semestre/cursus
  getEnseignantsDisponibles: async (dateDebut, heureDebut, heureFin, semestreId, cursusId) => {
    try {
      const response = await axios.get(`${API_BASE}/disponibilites/disponibles`, {
        params: { dateDebut, heureDebut, heureFin, semestreId, cursusId }
      });
      return response.data;
    } catch (err) {
      console.error('Erreur récupération enseignants disponibles', err);
      return [];
    }
  },

  // 2️⃣ Récupérer toutes les disponibilités d’un enseignant
  getDisponibilitesParEnseignant: async (employeId) => {
    try {
      const response = await axios.get(`${API_BASE}/disponibilites/lister/${employeId}`);
      return response.data;
    } catch (err) {
      console.error('Erreur récupération disponibilités enseignants', err);
      return [];
    }
  },

  // 3️⃣ Bloquer une plage horaire pour un enseignant
  bloquerPlageHoraire: async (employeId, disponibilite) => {
    try {
      const response = await axios.post(`${API_BASE}/disponibilites/bloquer/${employeId}`, disponibilite);
      return response.data;
    } catch (err) {
      console.error('Erreur blocage plage horaire', err);
      return null;
    }
  },

  // 4️⃣ Modifier une disponibilité existante
  modifierDisponibilite: async (id, disponibilite) => {
    try {
      const response = await axios.put(`${API_BASE}/disponibilites/modifier/${id}`, disponibilite);
      return response.data;
    } catch (err) {
      console.error('Erreur modification disponibilité', err);
      return null;
    }
  },

  // 5️⃣ Supprimer une disponibilité
  supprimerDisponibilite: async (id) => {
    try {
      await axios.delete(`${API_BASE}/disponibilites/supprimer/${id}`);
      return true;
    } catch (err) {
      console.error('Erreur suppression disponibilité', err);
      return false;
    }
  }
};

export default enseignantService;
