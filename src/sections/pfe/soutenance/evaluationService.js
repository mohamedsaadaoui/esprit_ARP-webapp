import axios from 'axios';

const API_BASE_URL = 'http://localhost:8099/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Intercepteur pour logging des requêtes
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour logging des réponses
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export const evaluationService = {
  // Soutenances
  getSoutenancesAujourdhui: () => api.get('/soutenances/aujourdhui'),
  
  // Évaluations
  getEvaluationById: (id) => api.get(`/evaluations/${id}`),
  
  createEvaluation: (evaluationData) => {
    console.log('📤 Creating evaluation:', evaluationData);
    return api.post('/evaluations', evaluationData);
  },
  
  updateEvaluation: (id, evaluationData) => api.put(`/evaluations/${id}`, evaluationData),
  
  getEvaluationsBySoutenance: (soutenanceId) => api.get(`/evaluations/soutenance/${soutenanceId}`),
  
  getEvaluationsByEmploye: (employeId) => api.get(`/evaluations/employe/${employeId}`),
  
  // Grilles
  getTypesGrille: () => api.get('/grilles/types'),
  
  getGrilleAcademique: () => api.get('/grilles/academique'),
  
  getGrilleByType: (typeGrille) => api.get(`/grilles/type/${typeGrille}`),
};

// Test de connexion API
export const testApiConnection = async () => {
  try {
    const response = await api.get('/grilles/types');
    console.log('✅ API Connection Test: SUCCESS');
    return true;
  } catch (error) {
    console.error('❌ API Connection Test: FAILED', error);
    return false;
  }
};

export default api;