import axiosInstance from 'src/utils/axios';

const API_URL = import.meta.env.VITE_MAP;

const salleService = {
  getAllSalles: () =>
    axiosInstance.get(`${API_URL}/salle/contSalle/all`)
      .then(response => response.data)
      .catch(error => {
        console.error('Erreur lors de la récupération des cursus:', error);
        throw error;
      }),


      addSalle: (salle) =>
        axiosInstance.post(`${API_URL}/salle/contSalle/add`, salle)
          .then(response => response.data)
          .catch(error => {
            console.error('Erreur lors de l\'ajout de la salle:', error);
            throw error;
          }),

          updateSalle: (idsalle, updatedSalle) =>
            axiosInstance
              .put(`${API_URL}/salle/contSalle/update/${idsalle}`, updatedSalle)
              .then(response => response.data)
              .catch(error => {
                console.error('Erreur lors de la modification de la salle:', error);
                throw error;
              }),


  activerDesactiverSalle: (id) =>
    axiosInstance
      .put(`${API_URL}/salle/contSalle/statut/${id}`)
      .then(response => response.data)
      .catch(error => {
        console.error('Erreur lors de l\'activation/désactivation de la salle:', error);
        throw error;
      }),


      deleteSalle: (id) =>
        axiosInstance
          .delete(`${API_URL}/salle/contSalle/delete/${id}`)
          .then(response => response.data)
          .catch(error => {
            console.error('Erreur lors de la suppression de la salle:', error);
            throw error;
          }),

          bloquerPlageHoraire: (disponibilite, salleId) => 
            axiosInstance
              .post(`${API_URL}/salle/disponibiliteSalle/bloquer/${salleId}`, disponibilite)
              .then((response) => response.data)
              .catch((error) => {
                console.error('Error blocking time slot:', error.response ? error.response.data : error.message);
                throw error;
              }),

              getDisponibiliteBySalleId: (salleId) =>
                axiosInstance
                  .get(`${API_URL}/salle/disponibiliteSalle/disponibilite/${salleId}`)
                  .then(response => response.data)
                  .catch(error => {
                    console.error(`Erreur lors de la récupération des disponibilités pour la salle ${salleId}:`, error);
                    throw error;
                  }),
                  modifierDisponibilite: (id, disponibilite) =>
                    axiosInstance
                      .put(`${API_URL}/salle/disponibiliteSalle/modifier/${id}`, disponibilite)
                      .then(response => response.data)
                      .catch(error => {
                        console.error('Erreur lors de la modification de la disponibilité:', error);
                        throw error;
                      }),
                  
                  supprimerDisponibilite: (id) =>
                    axiosInstance
                      .delete(`${API_URL}/salle/disponibiliteSalle/supprimer/${id}`)
                      .then(response => response.data)
                      .catch(error => {
                        console.error('Erreur lors de la suppression de la disponibilité:', error);
                        throw error;
                      }),

                      getSallesByCursusId: (cursusId) =>
                        axiosInstance.get(`${API_URL}/salle/contSalle/byCursus/${cursusId}`)
                          .then(response => response.data)
                          .catch(error => {
                            console.error(`Erreur lors de la récupération des salles pour le cursus ${cursusId}:`, error);
                            throw error;
                          }),
                
};

export default salleService;
