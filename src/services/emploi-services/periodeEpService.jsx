import axiosInstance from 'src/utils/axios';

const API_URL = import.meta.env.VITE_MAP ;
const periodeEpService = {
  getAllPeriodes: () =>
    axiosInstance.get(`${API_URL}/setting/periodeEpreuve/liste`)
      .then(response => response.data)
      .catch(error => {
        console.error('Erreur lors de la récupération des périodes:', error);
        throw error;
      }),

      addPeriode: async (periodeEpreuve, semestreId) => {
        try {
            const response = await axiosInstance.post(`${API_URL}/setting/periodeEpreuve/ajouter/${semestreId}`, periodeEpreuve);
            console.log("Succès:", response.data.message);
            return response.data; // { success: true, message: "...", data: {...} }
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Erreur lors de l'ajout";
            console.error("Erreur:", errorMsg);
            throw new Error(errorMsg); // Propager le message d'erreur
        }
    },

    updatePeriode: async (id, semestreId, periodeEpreuve) => {
      try {
          const response = await axiosInstance.put(`${API_URL}/setting/periodeEpreuve/${id}/${semestreId}`, periodeEpreuve);
          console.log("Succès:", response.data.message);
          return response.data;
      } catch (error) {
          const errorMsg = error.response?.data?.message || "Erreur lors de la mise à jour";
          console.error("Erreur:", errorMsg);
          throw new Error(errorMsg);
      }
  },

  deletePeriode: async (id) => {
    try {
        const response = await axiosInstance.delete(`${API_URL}/setting/periodeEpreuve/${id}`);
        console.log("Succès:", response.data.message);
        return response.data;
    } catch (error) {
        const errorMsg = error.response?.data?.message || "Erreur lors de la suppression";
        console.error("Erreur:", errorMsg);
        throw new Error(errorMsg);
    }
},
      getPeriodesBySemestreId: (semestreId) =>
        axiosInstance.get(`${API_URL}/setting/periodeEpreuve/semestre/${semestreId}`)
          .then(response => response.data)
          .catch(error => {
            console.error(`Erreur lors de la récupération des périodes pour le semestre ID: ${semestreId}`, error);
            throw error;
          }),
};

export default periodeEpService;