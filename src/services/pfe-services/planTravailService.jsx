import axiosInstance from "src/utils/axios";

const API_URL = import.meta.env.VITE_MAP;

const planTravailService = {

    // Récupérer les plans de travail d'un étudiant
    async getPlanTravailByEtudiant(etudiantId) {
        const url = `${API_URL}/planTravail/etudiant/${etudiantId}`;
        const response = await axiosInstance.get(url);
        return response.data;
    },
    
    // Soumettre un nouveau plan de travail
    async submitPlanTravail(planTravailData) {
        const url = `${API_URL}/planTravail/demande`;
        const response = await axiosInstance.post(url, planTravailData);
        return response.data;
    },
    
    // Mettre à jour un plan de travail
    async updatePlanTravail(id, data) {
        const url = `${API_URL}/planTravail/${id}`;
        const response = await axiosInstance.put(url, data);
        return response.data;
    },
    
    // Annuler un plan de travail
    async annulerPlanTravail(planTravailId) {
        const url = `${API_URL}/planTravail/annuler/${planTravailId}`;
        const response = await axiosInstance.put(url);
        return response.data;
    },
    
    // Mettre à jour le statut d'un plan de travail
    async updatePlanTravailStatus(planTravailId, status) {
        const url = `${API_URL}/planTravail/${planTravailId}/status?action=${status}`;
        const response = await axiosInstance.put(url);
        return response.data;
    },

    async getAllPlansTravail(page = 0, size = 10, search = '') {
        const url = `${API_URL}/planTravail/all?page=${page}&size=${size}&search=${search}`;
        const response = await axiosInstance.get(url);
        return response.data;
    }
};

export default planTravailService;