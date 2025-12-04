import axiosInstance from 'src/utils/axios';

const API_URL = import.meta.env.VITE_MAP;

const semestreService = {
  listerSemestresParCursusEtAnnee: (cursusId, anneeUniversitaireId) => 
    axiosInstance
      .get(`${API_URL}/setting/semestre/liste`, {
        params: {
          cursusId,
          anneeUniversitaireId
        }
      }) 
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching semesters by cursus and university year:', error);
        throw error;
      }),

  updateEtatSemestre: (semestreId,cursusId) => 
    axiosInstance
      .put(`${API_URL}/setting/semestre/Etat/semestre/${semestreId}/cursus/${cursusId}`)
      .then(response => response.data)
      .catch(error => {
        console.error('Error updating semester state:', error);
        throw error;
      }),

      listerTousLesCursus: () =>
        axiosInstance
          .get(`${API_URL}/setting/cursus/all`)
          .then(response => response.data)
          .catch(error => {
            console.error('Error fetching all cursus:', error);
            throw error;
          }),



          ajouterSemestre: (semestre, cursusId, anneeUniversitaireId) => 
            axiosInstance
              .post(`${API_URL}/setting/semestre/ajouter`, semestre, {
                params: {
                  cursusId,
                  anneeUniversitaireId
                }
              })
              .then(response => response.data)
              .catch(error => {
                console.error('Error adding semester:', error);
                throw error;
              }),

              modifierSemestre: (semestreId, semestre) => 
                axiosInstance
                  .put(`${API_URL}/setting/semestre/modifier/${semestreId}`, semestre)
                  .then(response => response.data)
                  .catch(error => {
                    console.error('Error modifying semester:', error);
                    throw error;
                  }),
            
              supprimerSemestre: (semestreId) => 
                axiosInstance
                  .delete(`${API_URL}/setting/semestre/supprimer/${semestreId}`)
                  .then(response => response.data)
                  .catch(error => {
                    console.error('Error deleting semester:', error);
                    throw error;
                  }),

                  ajouterPeriode: (semestreId, periodeData) => 
                    axiosInstance.post(`${API_URL}/setting/api/periodes/ajouter/${semestreId}`, periodeData)
                      // eslint-disable-next-line arrow-body-style
                      .then(response => {
                        return {
                          data: response.data,
                          message: 'Période ajoutée avec succès'
                        };
                      })
                      .catch(error => {
                        console.error('Erreur lors de l\'ajout de la période:', error);
                        
                        // Extrait le message d'erreur de la réponse
                        const errorMessage = error.response?.data 
                          || error.response?.message 
                          || error.message 
                          || 'Erreur lors de l\'ajout de la période';
                        
                        throw new Error(errorMessage);
                      }),

                      updatePeriode: (periodeId, nom, dateDebut, dateFin) => 
                        axiosInstance.put(`${API_URL}/setting/api/periodes/${periodeId}`, null, {
                          params: { nom, dateDebut, dateFin }
                        })
                        .then(response => response.data) // Retourner directement les données
                        .catch(error => {
                          console.error('Erreur lors de la mise à jour:', error);
                          
                          // Extrait le message d'erreur de la réponse backend
                          const errorMessage = error.response?.data 
                            || error.response?.data?.message
                            || error.message
                            || 'Erreur lors de la mise à jour de la période';
                          
                          // Relancer l'erreur avec le message du backend
                          throw new Error(errorMessage);
                        }),
                      supprimerPeriode: (periodeId) => 
                        axiosInstance
                          .delete(`${API_URL}/setting/api/periodes/${periodeId}`)
                          .then(response => response.data)
                          .catch(error => {
                            console.error('Error deleting period:', error);
                            throw error;
                          }),

                 

};

export default semestreService;