import axiosInstance from 'src/utils/axios';

const API_URL = import.meta.env.VITE_MAP;

const vacanceService = {
  

      getAllVacancesByCursus: (cursusId) =>
        axiosInstance.get(`${API_URL}/setting/vacances/cursus/${cursusId}`)
          .then(response => response.data)
          .catch(error => {
            console.error('Erreur lors de la récupération des vacances par cursus:', error);
            throw error;
          }),



  ajouterVacance: (cursusId, vacance) =>
    axiosInstance.post(`${API_URL}/setting/vacances/cursus/${cursusId}`, vacance)
      .then(response => response.data)
      .catch(error => {
        console.error('Erreur lors de l’ajout de la vacance:', error);
        throw error;
      }),


      supprimerVacance: (id) =>
        axiosInstance.delete(`${API_URL}/setting/vacances/delete/${id}`)
          .then(response => {
            console.log('Vacance supprimée avec succès');
            return response.data;
          })
          .catch(error => {
            console.error('Erreur lors de la suppression de la vacance:', error);
            throw error;
          }),


          updateVacanceDates: (vacanceId, updatedDates) =>
            axiosInstance.put(`${API_URL}/setting/vacances/${vacanceId}/dates`, updatedDates)
              .then(response => response.data)
              .catch(error => {
                console.error('Erreur lors de la mise à jour des dates de la vacance:', error);
                throw error;
              }),
     
};

export default vacanceService;
