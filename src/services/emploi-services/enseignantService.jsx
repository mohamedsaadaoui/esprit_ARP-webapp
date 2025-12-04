import axiosInstance from 'src/utils/axios';
 
const API_URL = import.meta.env.VITE_MAP;
 
const enseignantService = {
  getAllEnseignants: () =>
    axiosInstance.get(`${API_URL}/enseignant/enseignants`)
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching teachers:', error);
        throw error;
      }),
 
      getEnseignantsBySemestreEtCursus: (semestreId,cursusId) =>
        axiosInstance.get(`${API_URL}/enseignant/enseignants/semestre/${semestreId}/cursus/${cursusId}`)
          .then(response => response.data)
          .catch(error => {
            console.error('Error fetching teachers:', error);
            throw error;
          }),
      getEnseignantById: (id) =>
        axiosInstance.get(`${API_URL}/enseignant/enseignants/${id}`)  
          .then(response => response.data)
          .catch(error => {
            console.error(`Error fetching teacher with ID ${id}:`, error);
            throw error;
          }),
};
 
export default enseignantService;