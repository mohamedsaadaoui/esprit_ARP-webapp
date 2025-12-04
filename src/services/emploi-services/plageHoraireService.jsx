import axiosInstance from 'src/utils/axios';

const API_URL = import.meta.env.VITE_MAP;

const plageHoraireService = {
  listerPlagesHorairesParCursus: (cursusId) =>
    axiosInstance
      .get(`${API_URL}/setting/plageHoraire/cursus/${cursusId}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error fetching time slots by cursus:', error);
        throw error;
      }),

      ajouterPlageHoraire: (cursusId, plagehoraire) =>
        axiosInstance.post(`${API_URL}/setting/plageHoraire/${cursusId}`, plagehoraire)
          // eslint-disable-next-line arrow-body-style
          .then(response => {
            // Retourne à la fois la donnée et le message de succès
            return {
              data: response.data,
              message: response.status === 201 
                ? "Plage horaire ajoutée avec succès!" 
                : response.data
            };
          })
          .catch(error => {
            console.error('Erreur lors de l\'ajout de la plage horaire:', error);
            
            // Extrait le message d'erreur de la réponse
            const errorMessage = error.response?.data 
              || error.message 
              || 'Erreur lors de l\'ajout de la plage horaire';
            
            throw new Error(errorMessage);
          }),
  changerEtatPlageHoraire: (plagehoraireId) =>
    axiosInstance
      .put(`${API_URL}/setting/plageHoraire/etat/${plagehoraireId}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error changing time slot state:', error);
        throw error;
      }),

  deletePlageHoraire: (plagehoraireId) =>
    axiosInstance
      .delete(`${API_URL}/setting/plageHoraire/delete/${plagehoraireId}`)
      .then((response) => response.data) // Récupérer les données de la réponse
      .catch((error) => {
        console.error('Error deleting time slot:', error);
        throw error;
      }),
      updatePlageHoraire: (plagehoraireId, updatedPlage) =>
        axiosInstance.put(`${API_URL}/setting/plageHoraire/update/${plagehoraireId}`, updatedPlage)
          // eslint-disable-next-line arrow-body-style
          .then(response => {
            // Retourne à la fois la donnée et le message de succès
            return {
              data: response.data,
              message: response.data || "Plage horaire mise à jour avec succès"
            };
          })
          .catch(error => {
            console.error('Erreur lors de la mise à jour de la plage horaire:', error);
            
            // Extrait le message d'erreur de la réponse
            const errorMessage = error.response?.data 
              || error.message 
              || 'Erreur lors de la mise à jour de la plage horaire';
            
            throw new Error(errorMessage);
          }),

      listerToutesPlagesHoraires: () =>
        axiosInstance
          .get(`${API_URL}/setting/plageHoraire/all`)
          .then((response) => response.data)
          .catch((error) => {
            console.error('Error fetching all time slots:', error);
            throw error;
          }),

          listerActivesPlagesHorairesParCursus: (cursusId) =>
            axiosInstance
              .get(`${API_URL}/setting/plageHoraire/cursus/${cursusId}/actives`)
              .then((response) => response.data)
              .catch((error) => {
                console.error('Error fetching active time slots by cursus:', error);
                throw error;
              }),
};

export default plageHoraireService;
