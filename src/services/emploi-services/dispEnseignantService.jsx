import axiosInstance from 'src/utils/axios';

const API_URL = import.meta.env.VITE_MAP;

const dispEnseignantService = {
  listerDisponibilitesParEnseignant: (employeId) =>
    axiosInstance
      .get(`${API_URL}/enseignant/disponibilites/lister/${employeId}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error fetching availabilities by teacher:', error);
        throw error;
      }),

      bloquerPlageHoraire: (disponibilite, employeeId) => 
        axiosInstance
          .post(`${API_URL}/enseignant/disponibilites/bloquer/${employeeId}`, disponibilite)
          .then((response) => response.data)
          .catch((error) => {
            const errorMessage = error.response && error.response.data.error 
              ? error.response.data.error 
              : error.message;
            console.error('Error blocking time slot:', errorMessage);
            throw new Error(errorMessage); 
          }),

  supprimerPlageHoraire: (id) =>
    axiosInstance
      .delete(`${API_URL}/enseignant/disponibilites/supprimer/${id}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error deleting time slot:', error);
        throw error;
      }),

modifierDisponibilite: (id, disponibilite) => 
    axiosInstance
      .put(`${API_URL}/enseignant/disponibilites/modifier/${id}`, disponibilite) 
      .then((response) => response.data)
      .catch((error) => {
        const errorMessage = error.response && error.response.data.error 
          ? error.response.data.error 
          : error.message;
        console.error('Error modifying availability:', errorMessage);
        throw new Error(errorMessage); 
      }),
};

export default dispEnseignantService;