import axios from 'axios';

const API_BASE_URL = 'http://localhost:8096/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const evaluationService = {
  // Soutenances
  getSoutenancesAujourdhui: () => api.get('/soutenances/aujourdhui'),

  // Évaluations
  createEvaluation: (evaluationData) => api.post('/evaluations', evaluationData),

  // Grilles
  getTypesGrille: () => api.get('/grilles/types'),

  // Récupérer une évaluation par ID
  getEvaluationById: async (evaluationId) => {
    try {
      const response = await axios.get(`${API_BASE}/api/evaluations/${evaluationId}`);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur récupération évaluation:', err);
      throw err;
    }
  },

  // Créer/Sauvegarder une évaluation
  saveEvaluation: async (evaluationData) => {
    try {
      const response = await axios.post(`${API_BASE}/api/evaluations`, evaluationData);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur sauvegarde évaluation:', err);
      throw err;
    }
  },
};

export default api;