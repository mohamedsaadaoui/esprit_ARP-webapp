import axios from 'axios';

const DISP_SALLE_BASE = 'http://localhost:8222/api/salle/disponibiliteSalle'
const API_BASE = ''; // Vide pour utiliser les URLs relatives

const soutenanceService = {
  // ==================== MÉTHODES SOUTENANCE ====================
  
  // 1️⃣ Récupérer toutes les soutenances
  getAllSoutenances: () => axios.get(`${API_BASE}/sout`),

  // 2️⃣ Mettre à jour une soutenance
  updateSoutenance: (id, data) => {
    return axios.put(`${API_BASE}/sout/${id}`, data);
  },

  // 3️⃣ Récupérer toutes les soutenances avec leurs membres
  getAllSoutenancesWithMembres: async () => {
    try {
      console.log('🔄 Récupération des soutenances avec membres...');
      const response = await axios.get(`${API_BASE}/sout/avec-membres`);
      console.log('✅ Soutenances avec membres récupérées:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur récupération soutenances avec membres:', err);
      // Fallback vers l'ancienne méthode
      return soutenanceService.getAllSoutenances();
    }
  },

  // 4️⃣ Méthode spécifique pour la planification
  getSallesDisponiblesPourCreneau: async (dateDebut, heureDebut, heureFin, cursusId) => {
    try {
      console.log('🔄 Récupération salles pour créneau...', { dateDebut, heureDebut, heureFin, cursusId });
      
      const response = await axios.get(`http://localhost:8222/api/salle/disponibiliteSalle/disponiblesByDate`, {
        params: { dateDebut, heureDebut, heureFin, cursusId },
        timeout: 10000
      });
      
      console.log('✅ Salles pour créneau récupérées:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur récupération salles créneau:', err);
      throw err;
    }
  },

  // 5️⃣ Récupération des soutenances par date
  getSoutenancesByDate: async (date) => {
    try {
      console.log('🔄 Récupération soutenances pour date:', date);
      
      // Essayer d'abord le endpoint spécifique
      try {
        const response = await axios.get(`http://localhost:8021/sout/date/${date}`);
        console.log('✅ Soutenances par date récupérées:', response.data);
        return response.data;
      } catch {
        // Fallback: récupérer toutes et filtrer
        const response = await axios.get(`http://localhost:8021/sout`);
        const soutenancesFiltrees = response.data.filter(sout => sout.dateSoutenance === date);
        console.log('✅ Soutenances filtrées par date:', soutenancesFiltrees);
        return soutenancesFiltrees;
      }
    } catch (err) {
      console.error('❌ Erreur récupération soutenances par date:', err);
      throw err;
    }
  },

  // 6️⃣ Récupérer toutes les salles depuis msedtsalle
  getDisponibiliteSalles: async () => {
    try {
      const response = await axios.get(`${DISP_SALLE_BASE}/toutesDisponibilites`);
      return response.data;
    } catch (err) {
      console.error('Erreur récupération salles depuis msedtsalle', err);
      return [];
    }
  },

  // 7️⃣ Récupérer tous les professeurs pour le président
  getAllProfesseurs: async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/disponibilites`);
      return response.data;
    } catch (err) {
      console.error('Erreur récupération professeurs', err);
      return [];
    }
  },

  // ==================== MÉTHODES JURY ====================

  // 8️⃣ Récupérer tous les membres d'une soutenance (président + membres)
  getMembresBySoutenance: async (soutenanceId) => {
    try {
      console.log(`🔍 API Call: GET ${API_BASE}/api/jury/${soutenanceId}/membres`);
      
      const response = await axios.get(`${API_BASE}/api/jury/${soutenanceId}/membres`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        params: {
          _t: new Date().getTime()
        }
      });
      
      console.log('✅ Réponse API - Status:', response.status);
      console.log('✅ Réponse API - Data:', response.data);
      console.log('✅ Réponse API - Type:', typeof response.data);
      console.log('✅ Réponse API - Is Array:', Array.isArray(response.data));
      console.log('✅ Réponse API - Length:', response.data?.length || 0);
      
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

  // 9️⃣ Récupérer seulement le président
  getPresidentBySoutenance: async (soutenanceId) => {
    try {
      const membres = await soutenanceService.getMembresBySoutenance(soutenanceId);
      const president = membres.find(membre => membre.roleJury === 'PRESIDENT');
      console.log('👑 Président trouvé:', president);
      return president;
    } catch (error) {
      console.error('❌ Erreur récupération président:', error);
      throw error;
    }
  },

  // 🔟 Récupérer seulement les membres (sans le président)
  getMembresOnlyBySoutenance: async (soutenanceId) => {
    try {
      const membres = await soutenanceService.getMembresBySoutenance(soutenanceId);
      const membresOnly = membres.filter(membre => membre.roleJury === 'MEMBRE');
      console.log('👥 Membres seulement trouvés:', membresOnly.length);
      return membresOnly;
    } catch (error) {
      console.error('❌ Erreur récupération membres:', error);
      throw error;
    }
  },

  // 1️⃣1️⃣ Ajouter des membres à une soutenance
  ajouterMembres: async (soutenanceId, employeIds, role = 'MEMBRE') => {
    try {
      console.log(`➕ Ajout membres: soutenance=${soutenanceId}, employes=${employeIds}, role=${role}`);
      
      const response = await axios.post(
        `${API_BASE}/api/jury/${soutenanceId}/membres?role=${role}`, 
        employeIds
      );
      
      console.log('✅ Membres ajoutés avec succès:', response.data);
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
      
      console.log('✅ Président affecté avec succès:', response.data);
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
      console.log(`🗑️ Suppression membre: soutenance=${soutenanceId}, employe=${employeId}`);
      
      const response = await axios.delete(
        `${API_BASE}/api/jury/${soutenanceId}/membres/${employeId}`
      );
      
      console.log('✅ Membre supprimé avec succès');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur suppression membre:', error);
      console.error('❌ Détails erreur:', error.response?.data);
      throw error;
    }
  },

  // 1️⃣4️⃣ Mettre à jour le rôle d'un membre
  updateRoleMembre: async (soutenanceId, employeId, nouveauRole) => {
    try {
      console.log(`🔄 Mise à jour rôle: soutenance=${soutenanceId}, employe=${employeId}, role=${nouveauRole}`);
      
      const response = await axios.put(
        `${API_BASE}/api/jury/${soutenanceId}/membres/${employeId}/role`,
        { role: nouveauRole }
      );
      
      console.log('✅ Rôle mis à jour avec succès:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur mise à jour rôle:', error);
      console.error('❌ Détails erreur:', error.response?.data);
      throw error;
    }
  }
};

export default soutenanceService;