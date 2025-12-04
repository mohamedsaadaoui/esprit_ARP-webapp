import axiosInstance from "src/utils/axios";

const API_URL = import.meta.env.VITE_MAP;

const conventionService = {
  // Récupérer les conventions d'un étudiant
  async getConventionsByEtudiant(etudiantId) {
    const url = `${API_URL}/convention/etudiant/${etudiantId}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Soumettre une nouvelle demande de convention
  async demandeConvention(conventionData) {
    const url = `${API_URL}/convention/demande`;
    const response = await axiosInstance.post(url, conventionData);
    return response.data;
  },

async downloadFile(pathConvention) {
  const url = `${API_URL}/docs/minio/urlDoc`;
  return axiosInstance.get(url, {
    params: {
      filename: pathConvention // ou le format que vous utilisez
    }
  });
},

  async uploadSignedConvention(formData) {
    const url = `${API_URL}/convention/upload`;
    const response = await axiosInstance.post(url, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data'
      },
    });
    return response.data;
  },

  // Dans ConventionService.js
   async updateConvention(id, data) {
    const url = `${API_URL}/convention/${id}`;
    const response = await axiosInstance.put(url, data);
    return response.data;
  },

  async updateConventionWithAvenant(conventionId, formData) {
    const url = `${API_URL}/convention/${conventionId}/avenant`;
    const response = await axiosInstance.put(url, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data'
      },
    });
    return response.data;
  },

  async annulerConvention(conventionId) {
    const url = `${API_URL}/convention/annuler/${conventionId}`;
    const response = await axiosInstance.put(url);
    return response.data;
},

  // updateConventionStatus
  async updateConventionStatus(conventionId, status) {
    const url = `${API_URL}/convention/${conventionId}/status?action=${status}`;
    const response = await axiosInstance.put(url);
    return response.data;
  },  
    // Dans ConventionService.js
  
  async getAllEtudiants(page = 0, size = 10, search = '', promotion = '', filiere = '') {
    const url = `${API_URL}/convention/etudiants`;
    const response = await axiosInstance.get(url, {
      params: {
        page,
        size,
        search,
        promotion,
        filiere
      }
    });
    return response.data;
  },

  // Récupérer la liste des entreprises
  async getEntreprises() {
    const url = `${API_URL}/convention/entreprises`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Récupérer les détails d'une convention spécifique
  async getConventionDetails(conventionId) {
    const url = `${API_URL}/convention/details/${conventionId}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },



  // Récupérer les types de convention disponibles
  async getTypesConvention() {
    const url = `${API_URL}/convention/types`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Méthode pour récupérer les modules d'un étudiant (conservée depuis l'exemple)
  async getEtudiantModulesBySemestreAndClasse() {
    const url = `${API_URL}/absence/planning?idClasseSemestre=3089&idSemestre=1`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Méthode pour générer le PDF de la convention
  async genererPdfConvention(conventionId) {
    const url = `${API_URL}/convention/generer-pdf/${conventionId}`;
    const response = await axiosInstance.get(url, {
      responseType: 'blob' // Important pour les fichiers PDF
    });
    return response.data;
  },

  // Méthode pour suivre l'état d'une convention
  async suivreStatutConvention(conventionId) {
    const url = `${API_URL}/convention/statut/${conventionId}`;
    const response = await axiosInstance.get(url);
    return response.data;
  }
};

export default conventionService;