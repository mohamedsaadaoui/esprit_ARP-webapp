import axiosInstance from 'src/utils/axios';

const API_URL = import.meta.env.VITE_MAP;

const jourFerieService = {
  getAllJoursFeries: (anneeUniversitaireId) =>
    axiosInstance.get(`${API_URL}/setting/jourferie/liste/${anneeUniversitaireId}`) // Passer le paramètre dans l'URL
      .then(response => response.data)
      .catch(error => {
        console.error('Erreur lors de la récupération des jours fériés:', error);
        throw error;
      }),


      ajouterJourFerie: (anneeUniversitaireId, jourFerie) =>
        axiosInstance.post(`${API_URL}/setting/jourferie/ajouter/${anneeUniversitaireId}`, jourFerie)
          .then(response => response.data)
          .catch(error => {
            console.error('Erreur lors de l’ajout du jour férié:', error);
            
            // Extrait le message d'erreur de la réponse
            const errorMessage = error.response?.data?.error 
              || error.response?.data?.message 
              || error.message 
              || 'Erreur lors de l’ajout du jour férié';
            
            throw new Error(errorMessage);
          }),

          supprimerJourFerie: (jourFerieId) =>
            axiosInstance
              .delete(`${API_URL}/setting/jourferie/supprimer/${jourFerieId}`)
              .then(response => {
                console.log('Jour férié supprimé avec succès');
                return response.data;
              })
              .catch(error => {
                console.error('Erreur lors de la suppression du jour férié:', error);
                throw error;
              }),
          
};

export default jourFerieService;


