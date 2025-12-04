import axiosInstance from 'src/utils/axios';

const API_URL = import.meta.env.VITE_MAP;

const sahService = {
  getAllSah: () =>
    axiosInstance.get(`${API_URL}/assiduite/sortie/all`)
      .then(response => response.data)
      .catch(error => {
        console.error('Erreur lors de la récupération des sorties :', error);
        throw error;
      }),


      deleteSortieAvantHeure: (id) =>
        axiosInstance.delete(`${API_URL}/assiduite/sortie/supprimer/${id}`)
          .then(response => response.data)
          .catch(error => {
            console.error('Erreur lors de la suppression de la sortie avant heure :', error);
            throw error;
          }),



          ajouterSortieAvantHeure: (sortieAvantHeureDTO) =>
            axiosInstance
              .post(`${API_URL}/assiduite/sortie/ajouter`, sortieAvantHeureDTO)
              .then((response) => response.data)
              .catch((error) => {
                console.error('Error adding sortie avant heure:', error.response ? error.response.data : error.message);
                throw error;
              }),
         
          modifierDureeSortie: (id, sortieAvantHeureDTO) =>
            axiosInstance
              .put(`${API_URL}/assiduite/sortie/modifier/${id}`, sortieAvantHeureDTO)
              .then((response) => response.data)
              .catch((error) => {
                console.error('Error modifying sortie duration:', error);
                throw error;
              }),
         
          
         
          getSortiesParEnseignant: (idEmploye) =>
            axiosInstance
              .get(`${API_URL}/assiduite/sortie/enseignant/${idEmploye}`)
              .then((response) => response.data)
              .catch((error) => {
                console.error('Error fetching sorties by teacher:', error);
                throw error;
              }),

              getSortiesAvantHeureBySemestre: (idSemestre) =>
                axiosInstance
                    .get(`${API_URL}/assiduite/sortie/semestre/${idSemestre}`)
                    .then((response) => response.data)
                    .catch((error) => {
                        console.error('Error fetching sorties before hour by semester:', error);
                        throw error;
                    }),


};

export default sahService;