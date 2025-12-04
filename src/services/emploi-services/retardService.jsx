import axiosInstance from 'src/utils/axios';

const API_URL = import.meta.env.VITE_MAP;

const retardService = {
  getAllRetards: () =>
    axiosInstance.get(`${API_URL}/assiduite/retardContr/all`)
      .then(response => response.data)
      .catch(error => {
        console.error('Erreur lors de la récupération des retards:', error);
        throw error;
      }),


      deleteRetard: (id) =>
        axiosInstance.delete(`${API_URL}/assiduite/retardContr/delete/${id}`)
          .then(response => response.data)
          .catch(error => {
            console.error(`Erreur lors de la suppression du retard avec ID: ${id}`, error);
            throw error;
          }),


          getRetardById: (id) =>
            axiosInstance
              .get(`${API_URL}/assiduite/retardContr/byId/${id}`)
              .then((response) => response.data)
              .catch((error) => {
                console.error(`Error fetching retard by ID ${id}:`, error);
                throw error;
              }),
       
          createRetard: (retard) =>
            axiosInstance
              .post(`${API_URL}/assiduite/retardContr`, retard)
              .then((response) => response.data)
              .catch((error) => {
                console.error('Error creating retard:', error.response ? error.response.data : error.message);
                throw error;
              }),
       
          updateRetard: (id, retard) =>
            axiosInstance
              .put(`${API_URL}/assiduite/retardContr/update/${id}`, retard)
              .then((response) => response.data)
              .catch((error) => {
                console.error(`Error updating retard with ID ${id}:`, error);
                throw error;
              }),


              getRetardsBySemestre: (idSemestre) =>
                axiosInstance
                  .get(`${API_URL}/assiduite/retardContr/semestre/${idSemestre}`)
                  .then((response) => response.data)
                  .catch((error) => {
                    console.error(`Error fetching retards by semester ${idSemestre}:`, error);
                    throw error;
                  }),
            };

export default retardService;