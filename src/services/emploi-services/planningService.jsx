import axiosInstance from 'src/utils/axios';
 
const API_URL = import.meta.env.VITE_MAP;
 
const planningService = {
 
      getPlanningByAnnee: (idAnnee) =>
        axiosInstance.get(`${API_URL}/planning/planningContr/annee/${idAnnee}`)
          .then(response => response.data)
          .catch(error => {
            console.error('Erreur lors de la récupération des plannings:', error);
            throw error;
          }),

          getPlanningBySemestreAndCursus: (semestreId,cursusId) =>
            axiosInstance.get(`${API_URL}/planning/planningContr/semestre/${semestreId}/cursus/${cursusId}`)
              .then(response => response.data)
              .catch(error => {
                console.error('Erreur lors de la récupération des plannings:', error);
                throw error;
              }),
          getPlanningByIdClasse: (idClasse) =>
            axiosInstance.get(`${API_URL}/planning/planningContr/classeSemestre/${idClasse}`)
              .then(response => response.data)
              .catch(error => {
                console.error(`Erreur lors de la récupération du planning pour la classe ${idClasse} :`, error);
                throw error;
              }),
          getModulesNonClotureByClasseAndSemestre: (classeId, anneeId) =>
            axiosInstance.get(`${API_URL}/planning/planningContr/modules/non-cloture/classe/${classeId}/annee/${anneeId}`)
              .then(response => response.data)
              .catch(error => {
                console.error(`Erreur lors de la récupération des modules non clôturés pour la classe ${classeId} et l'année ${anneeId}:`, error);
                throw error;
              }),
 
              incrementNbHeureAdd: (planningId, incrementValue) =>
                axiosInstance.post(`${API_URL}/planning/planningContr/increment/${planningId}/${incrementValue}`)
                  .then(response => {
                    console.log('Incrémentation réussie:', response);
                  })
                  .catch(error => {
                    console.error(`Erreur lors de l'incrémentation de nbHeureAdd pour le planning ${planningId}:`, error);
                    throw error;
                  }),
                 
                
                      getPlanningByEmployeAndSemestre: (employeId, semestreId,cursusId) =>
                        axiosInstance.get(`${API_URL}/planning/planningContr/employe/${employeId}/semestre/${semestreId}/cursus/${cursusId}`)
                          .then(response => response.data)
                          .catch(error => {
                            console.error(`Erreur lors de la récupération du planning pour l'employé ${employeId} et de semestre ${semestreId} et de cursus ${cursusId}:`, error);
                            throw error;
                          }),
                    };
                
 
 
 
export default planningService;
 