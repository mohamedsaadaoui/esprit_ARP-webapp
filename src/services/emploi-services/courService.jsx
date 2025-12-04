import axiosInstance from 'src/utils/axios';
 
const API_URL = import.meta.env.VITE_MAP;
 
const courService = {
  ajouterCour: (cour, idPlageHoraire) =>
    axiosInstance
      .post(`${API_URL}/cours/cours/ajouter?idPlageHoraire=${idPlageHoraire}`, cour)
      .then((response) => response.data)
      .catch((error) => {
        console.error("Erreur lors de l'ajout du cours:", error);
        throw error;
      }),
 
      getCourById: (id) =>
        axiosInstance
          .get(`${API_URL}/cours/cours/cours/${id}`)
          .then((response) => response.data)
          .catch((error) => {
            console.error('Error fetching course by ID:', error.response ? error.response.data : error.message);
            throw error;
          }),
          getBoundsByCursusId: (cursusId) =>
            axiosInstance
              .get(`${API_URL}/cours/cours/bounds/${cursusId}`)
              .then((response) => response.data)
              .catch((error) => {
                console.error('Erreur lors de la récupération des bornes horaires par cursus ID :', error.response ? error.response.data : error.message);
                throw error;
              }),
 
              dupliquerCours: async (idCours, dateSemaine) => {
                try {
                    const response = await axiosInstance.post(
                        `${API_URL}/cours/cours/dupliquer/cours/${idCours}/semaine/${dateSemaine}`
                    );
                    return response.data;
                } catch (error) {
                    console.log("error", error.response?.data?.message);
                    const errorMsg = error.response?.data ||  "Erreur lors de la duplication du cours" ;
                    console.error("Erreur lors de la duplication du cours:", errorMsg);
                    throw new Error(errorMsg);
                }
            },
 
        dupliquerCoursSurPlusieursSemaines: async (coursOriginal, weeks, idPlageHoraire) => {
          try {
              const response = await axiosInstance.post(
                  `${API_URL}/cours/cours/dupliquerPlusieursSemaines/${idPlageHoraire}/semaine/${weeks}`,
                  coursOriginal
              );
              return response.data;
          } catch (error) {
              console.log("error", error);
              // Extraire le message d'erreur de la réponse ou utiliser un message par défaut
              const errorMsg = error|| "Erreur lors de la duplication des cours sur plusieurs semaines";
              console.error("Erreur lors de la duplication des cours sur plusieurs semaines:", errorMsg);
              throw new Error(errorMsg); // Propager l'erreur avec le message
          }
      },
 
      listerTousLesCours: () =>
    axiosInstance
      .get(`${API_URL}/cours/cours/all`)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error fetching all courses:', error);
        throw error;
      }),
      modifierCour: (id, cour) =>
        axiosInstance
          .put(`${API_URL}/cours/cours/modifier/${id}`, cour, {
            headers: {
              'Content-Type': 'application/json',
            },
          })
          .then((response) => response.data)
          .catch((error) => {
            console.error('Error modifying course:', error);
            throw error;
          }),
  supprimerCour: (id) =>
    axiosInstance
      .delete(`${API_URL}/cours/cours/supprimer/${id}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error deleting course:', error);
        throw error;
      }),
  
 
      listerCoursParEnseignantEtSemestre: (idEnseignant, idSemestre) =>
    axiosInstance
      .get(`${API_URL}/cours/cours/all/${idEnseignant}/semestre/${idSemestre}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error fetching courses by teacher and semester:', error);
        throw error;
      }),
 
 
  listerCoursParClasseEtSemestre: (idClasse, idSemestre) =>
    axiosInstance
      .get(`${API_URL}/cours/cours/classe/${idClasse}/semestre/${idSemestre}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error fetching courses by class and semester:', error);
        throw error;
      }),
 
 
  listerCoursParSalleEtSemestre: (idSalle, idSemestre) =>
    axiosInstance
      .get(`${API_URL}/cours/cours/salle/${idSalle}/semestre/${idSemestre}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error fetching courses by room and semester:', error);
        throw error;
      }),
 
      listerTousLesModules: () =>
        axiosInstance
          .get(`${API_URL}/cours/modules/All`)
          .then((response) => response.data)
          .catch((error) => {
            console.error('Error fetching all modules:', error);
            throw error;
          }),
 
          listerCoursParEnseignantEtModule: (idEnseignant, idModule) =>
            axiosInstance
              .get(`${API_URL}/cours/cours/enseignant/${idEnseignant}/module/${idModule}`)
              .then((response) => response.data)
              .catch((error) => {
                console.error('Error fetching courses by teacher and module:', error);
                throw error;
              }),
 
              listerCoursParEnseignant: (idEnseignant) =>
                axiosInstance
                  .get(`${API_URL}/cours/cours/enseignant/${idEnseignant}`)
                  .then((response) => response.data)
                  .catch((error) => {
                    console.error('Error fetching courses by teacher:', error);
                    throw error;
                  }),
                 
 
                  listerToutesLesClasses: () =>
                    axiosInstance
                      .get(`${API_URL}/cours/classes/all`)
                      .then((response) => response.data)
                      .catch((error) => {
                        console.error('Error fetching all classes:', error);
                        throw error;
                      }),
 
 
                      listerClassesParSemestre: (idSemestre) =>
                        axiosInstance
                          .get(`${API_URL}/cours/classeSemestre/semestre/${idSemestre}`)
                          .then((response) => response.data)
                          .catch((error) => {
                            console.error('Error fetching classes by semester:', error);
                            throw error;
                          }),
                          listerClassesParSemestreEtCursus: (idSemestre, idCursus) =>
                            axiosInstance
                              .get(`${API_URL}/cours/classeSemestre/semestre/${idSemestre}/cursus/${idCursus}`)
                              .then((response) => response.data)
                              .catch((error) => {
                                console.error('Error fetching classes by semester and cursus:', error);
                                throw error;
                              }),
 
                          getSallesDisponibles: (idPlageHoraire, dateCours) =>
                            axiosInstance
                              .get(`${API_URL}/cours/cours/salles/disponibles/${idPlageHoraire}/${dateCours}`)
                              .then((response) => response.data)
                              .catch((error) => {
                                console.error('Error fetching available rooms:', error);
                                throw error;
                              }),


                              getSallesDisponiblesByCursus: (idCursus, idPlageHoraire, dateCours) =>
                                axiosInstance
                                  .get(`${API_URL}/cours/cours/salles/disponibles/cursus/${idCursus}/${idPlageHoraire}/${dateCours}`)
                                  .then((response) => response.data)
                                  .catch((error) => {
                                    console.error('Error fetching available rooms:', error);
                                    throw error;
                                  }),
                       
                              
                          affecterSalleAuCours: (idCours, idSalle) =>
                            axiosInstance
                              .post(`${API_URL}/cours/cours/${idCours}/affecterSalle/${idSalle}`)
                              .then((response) => response.data)
                              .catch((error) => {
                                console.error('Error assigning room to course:', error);
                                throw error;
                              }),
                              listerCoursActifParEnseignant: async (idEnseignant) => {
                                try {
                                  const response = await axiosInstance.get(
                                    `${API_URL}/cours/cours/enseignant/${idEnseignant}/etat/true`
                                  );
                                  return response.data;
                                } catch (error) {
                                  console.error('Error fetching active courses by teacher:', error);
                                  throw new Error(error || "Erreur lors de la récupération des cours actifs par enseignant");
                                }
                              },
                              listerCoursActifParClasseEtSemestre: async (idClasse) => {
                                try {
                                  const response = await axiosInstance.get(
                                    `${API_URL}/cours/cours/classeSemestre/${idClasse}`
                                  );
                                  return response.data;
                                } catch (error) {
                                  console.error('Error fetching active courses by class and semester:', error);
                                  throw new Error(error || "Erreur lors de la récupération des cours actifs par classe et semestre");
                                }
                              },
                               listerCoursActifParClasseEtSemestreEtCursus :async (idClasse, idCursus) => {
                                try {
                                    const response = await axiosInstance.get(`${API_URL}/cours/classeSemestre/${idClasse}/${idCursus}`);
                                    return response.data;
                                } catch (error) {
                                    console.error('Error fetching active courses by class and semester:', error);
                                    throw new Error(error.response?.data?.message || "Erreur lors de la récupération des cours actifs par classe et semestre");
                                }
                            },
                              getCoursBySalle: (idSalle) =>
                                axiosInstance
                                  .get(`${API_URL}/cours/cours/salle/${idSalle}`)
                                  .then((response) => response.data)
                                  .catch((error) => {
                                      console.error('Error fetching courses by room:', error.response ? error.response.data : error.message);
                                      throw error;
                                  }),
                           
                                  getCoursBySalleActif: (idSalle) =>
                                    axiosInstance
                                      .get(`${API_URL}/cours/cours/salle/Actif/${idSalle}`)
                                      .then((response) => response.data)
                                      .catch((error) => {
                                          console.error('Error fetching courses by room:', error.response ? error.response.data : error.message);
                                          throw error;
                                      }),
                                      getBoundsEnsByCursusId: (anneeId, empId) =>
                                        axiosInstance
                                          .get(`${API_URL}/cours/cours/boundsEns/${empId}/${anneeId}`)
                                          .then((response) => response.data)
                                          .catch((error) => {
                                            console.error('Error fetching bounds by cursus id:', error.response ? error.response.data : error.message);
                                            throw error;
                                          }),    
  
                                          getBoundsSalleByCursusId: (salleId) =>
                                            axiosInstance
                                              .get(`${API_URL}/cours/cours/boundsSalle/${salleId}`)
                                              .then((response) => response.data)
                                              .catch((error) => {
                                                console.error('Error fetching bounds by cursus id:', error.response ? error.response.data : error.message);
                                                throw error;
                                              }),    

                                          getEmployesWithCours: (semestreId, cursusId) =>
                                            axiosInstance
                                              .get(`${API_URL}/cours/cours/bySemestreAndCursus`, {
                                                params: {
                                                  // eslint-disable-next-line object-shorthand
                                                  semestreId: semestreId,
                                                  // eslint-disable-next-line object-shorthand
                                                  cursusId: cursusId
                                                }
                                              })
                                              .then((response) => response.data)
                                              .catch((error) => {
                                                console.error('Erreur lors de la récupération des employés avec cours :',
                                                  error.response ? error.response.data : error.message);
                                                throw error;
                                              }),
                                          

                                          
                                          
                                          importCourses: async (idSemestre, file, date) => {
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            formData.append('date', date);
                                        
                                            try {
                                              const response = await axiosInstance.post(`${API_URL}/cours/cours/import/${idSemestre}`, formData, {
                                                headers: {
                                                  'Content-Type': 'multipart/form-data',
                                                },
                                              });
                                              return response.data;
                                            } catch (error) {
                                              console.error("Erreur lors de l'importation des cours:", error.response ? error.response.data : error.message);
                                              throw error;
                                            }
                                          },
};
 
export default courService;