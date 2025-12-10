import axios from 'axios';
import axiosInstance from 'src/utils/axios';

const DISP_SALLE_BASE = 'http://localhost:8222/api/salle/disponibiliteSalle'
const API_BASE = 'http://localhost:8222/api/soutenance';

const soutenanceService = {
  // ==================== MÉTHODES SOUTENANCE ====================

  // added by jawhar for clear integration lately
  getAllEnseignants: () => {
    const response = axiosInstance.get(`http://localhost:8222/api/employe/enseignants`);
    return response;
  },

  // Nouvelle méthode : Planifier une soutenance
  planifierSoutenance: (payload) => {
    return axios.post(
      "http://localhost:8222/api/soutenance/planifier",
      payload
    );
  },

  getSallesDisponibles: (dateDebut, heureDebut, heureFin, cursusId) =>
    axiosInstance.get(`${DISP_SALLE_BASE}/disponiblesByDate`, {
      params: {
        dateDebut: dateDebut,
        heureDebut: heureDebut,
        heureFin: heureFin,
        cursusId: cursusId
      }
    })
      .then(response => response.data)
      .catch(error => {
        console.error('Erreur lors de la récupération des salles disponibles:', error);
        throw error;
      }),

  // 1️⃣ Récupérer toutes les soutenances
  getAllSoutenances: () => axios.get(`${API_BASE}`),

  // 2️⃣ Mettre à jour une soutenance
  updateSoutenance: (id, data) => axios.put(`${API_BASE}/${id}`, data),

  // 3️⃣ Récupérer toutes les soutenances avec leurs membres
  // eslint-disable-next-line consistent-return
  getAllSoutenancesWithMembres: async () => {
    try {
      const response = await axios.get(`${API_BASE}/avec-membres`);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur récupération soutenances avec membres:', err);
      // return soutenanceService.getAllSoutenances();
    }
  },

  // 4️⃣ Méthode spécifique pour la planification
  getSallesDisponiblesPourCreneau: async (dateDebut, heureDebut, heureFin, cursusId) => {
    try {
      const response = await axios.get(`${DISP_SALLE_BASE}/disponiblesByDate`, {
        params: { dateDebut, heureDebut, heureFin, cursusId },
        timeout: 10000
      });

      return response.data;
    } catch (err) {
      console.error('❌ Erreur récupération salles créneau:', err);
      throw err;
    }
  },

  // 5️⃣ Supprimer une soutenance
  deleteSoutenance: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/${id}`);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur suppression soutenance:', err);
      throw err;
    }
  },

  // 6️⃣ Récupérer toutes les salles depuis msedtsalle
  getDisponibiliteSalles: async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      console.log('🔑 Token:', token ? `✅ ${token.substring(0, 20)}...` : '❌ manquant');

      const response = await axios.get(`${DISP_SALLE_BASE}/toutesDisponibilites`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data;
    } catch (err) {
      console.error('❌ Erreur récupération salles', err.response?.status, err.response?.data);
      return [];
    }
  },


  // ==================== MÉTHODES membres + président JURY ====================

  // 8️⃣ Récupérer tous les membres d'une soutenance (président + membres)
  getMembresBySoutenance: async (soutenanceId) => {
    try {
      const response = await axios.get(`${API_BASE}/api/jury/${soutenanceId}/membres`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        params: {
          _t: new Date().getTime()
        }
      });


      // Debug détaillé
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach((membre, index) => {
          console.log(`👤 Membre ${index}:`, {
            roleJury: membre.roleJury,
            idEmploye: membre.idEmploye?.idEmploye,
            nomComplet: membre.idEmploye ? `${membre.idEmploye.prenom} ${membre.idEmploye.nom}` : 'N/A'
          });
        });
      }

      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('❌ Erreur récupération membres jury:', error);
      console.error('❌ Status erreur:', error.response?.status);
      console.error('❌ Détails erreur:', error.response?.data);
      console.error('❌ Message erreur:', error.message);
      console.error('❌ URL appelée:', error.config?.url);
      return [];
    }
  },


  // 1️⃣1️⃣ Ajouter des membres à une soutenance
  ajouterMembres: async (soutenanceId, employeIds, role = 'MEMBRE') => {
    try {

      const response = await axios.post(
        `${API_BASE}/api/jury/${soutenanceId}/membres?role=${role}`,
        employeIds
      );

      return response.data;
    } catch (error) {
      console.error('❌ Erreur ajout membres:', error);
      console.error('❌ Détails erreur:', error.response?.data);
      throw error;
    }
  },

  // 1️⃣2️⃣ Affecter un président
  affecterPresident: async (soutenanceId, employeId) => {
    try {
      console.log(`👑 Affectation président: soutenance=${soutenanceId}, employe=${employeId}`);

      const response = await axios.post(
        `${API_BASE}/api/jury/${soutenanceId}/president/${employeId}`
      );

      return response.data;
    } catch (error) {
      console.error('❌ Erreur affectation président:', error);
      console.error('❌ Détails erreur:', error.response?.data);
      throw error;
    }
  },

  // 1️⃣3️⃣ Supprimer un membre du jury
  supprimerMembre: async (soutenanceId, employeId) => {
    try {

      const response = await axios.delete(
        `${API_BASE}/api/jury/${soutenanceId}/membres/${employeId}`
      );

      return response.data;
    } catch (error) {
      console.error('❌ Erreur suppression membre:', error);
      throw error;
    }
  },


};

export default soutenanceService;