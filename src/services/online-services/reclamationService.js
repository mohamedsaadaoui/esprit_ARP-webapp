import axiosInstance from "src/utils/axios";

const API_URL = import.meta.env.VITE_MAP;

const reclamationService = {

    addReclamation: async (data) => {
    const url = `${API_URL}/reclamation/add`;
    const response = await axiosInstance.post(url, data);
    return response.data;
  },

  getReclamationsByEtudiant: async (etudiantId) => {
    const url = `${API_URL}/reclamation/etudiant?etudiantId=${etudiantId}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  updateReclamationStatus: async (id, statusData) => {
    const url = `${API_URL}/reclamation/${id}/status`;
    const response = await axiosInstance.put(url, statusData);
    return response.data;
  },
  getEtudiantModulesBySemestreAndClasse: async () => {
    const url = `${API_URL}/absence/planning?idClasseSemestre=3089&idSemestre=1`;
    const response = await axiosInstance.get(url);
    return { response };
},  

getAllActiveTypeReclamation: async () => {
    const url = `${API_URL}/reclamation/allTypeReclamation`;
    const response = await axiosInstance.get(url);
    return { response };
},  
};

export default reclamationService;
