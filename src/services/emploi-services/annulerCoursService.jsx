import axiosInstance from 'src/utils/axios';
 
const API_URL = import.meta.env.VITE_MAP;
 
const annulerCoursService = {
  // Récupérer tous les motifs d'annulation
  getAllMotifs: () =>
    axiosInstance.get(`${API_URL}/assiduite/motifs/all`)
      .then(response => response.data)
      .catch(error => {
        console.error('Erreur lors de la récupération des motifs :', error);
        throw error;
      }),
 
  annulerCours: (idCours, idMotif,description) =>
    axiosInstance.post(`${API_URL}/assiduite/courAnnule/annuler`, null, {
      params: { idCours, idMotif,description }
    })
    .then(response => response.data)
    .catch(error => {
      console.error('Erreur lors de l\'annulation du cours :', error);
      throw error;
    }),
 
  getAllCoursAnnules: () =>
    axiosInstance.get(`${API_URL}/assiduite/courAnnule/all`)
      .then(response => response.data)
      .catch(error => {
        console.error('Erreur lors de la récupération des cours annulés :', error);
        throw error;
      }),
 
      restaurerEtModifierCours: (idAnnulation, nouvelleDateCours, idPlageHoraire) =>
        axiosInstance.put(`${API_URL}/assiduite/courAnnule/restaurerEtModifier/${idAnnulation}`, null, {
            params: { nouvelleDateCours, idPlageHoraire }
        })
        .then(response => response.data)
        .catch(error => {
            if (error.response) {
                throw new Error(error.response.data); 
            } else if (error.request) {
                
                throw new Error('Pas de réponse du serveur');
            } else {
               
                throw new Error('Erreur de configuration de la requête');
            }
        }),

        updateMotif: (idAnnulation, idMotif) =>
          axiosInstance.put(`${API_URL}/assiduite/courAnnule/updateMotif/${idAnnulation}/${idMotif}`)
            .then(response => response.data)
            .catch(error => {
              console.error('Erreur lors de la mise à jour du motif :', error);
              throw error;
            }),

            
            getCoursAnnulesBySemestre: (idSemestre) =>
              axiosInstance
                .get(`${API_URL}/assiduite/courAnnule/semestre/${idSemestre}`)
                .then(response => response.data)
                .catch(error => {
                  console.error(`Erreur lors de la récupération des cours annulés pour le semestre ${idSemestre} :`, error);
                  throw error;
                }),
          };
 
export default annulerCoursService;