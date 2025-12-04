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
  getSoutenancesByEmploye: (employeId) => api.get(`/soutenances/employe/${employeId}`),
  
  // Évaluations
  getEvaluationById: (id) => api.get(`/evaluations/${id}`),
  createEvaluation: (evaluationData) => api.post('/evaluations', evaluationData),
  updateEvaluation: (id, evaluationData) => api.put(`/evaluations/${id}`, evaluationData),
  getEvaluationsBySoutenance: (soutenanceId) => api.get(`/evaluations/soutenance/${soutenanceId}`),
  getEvaluationsByEmploye: (employeId) => api.get(`/evaluations/employe/${employeId}`),
  
  // Grilles
  getTypesGrille: () => api.get('/grilles/types'),
  getGrilleAcademique: () => api.get('/grilles/academique'),
  getGrilleByType: (typeGrille) => api.get(`/grilles/type/${typeGrille}`),
};

export default api;