import axiosInstance from 'src/utils/axios'; 

const API_URL = import.meta.env.VITE_MAP; 

const anneeUniversitaireService = {
  getAllAnneesUniversitaires: () => 
    axiosInstance.get(`${API_URL}/setting/anneeUniv/liste`)
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching university years:', error);
        throw error;
      }),

  updateEtatAnneeUniversitaire: (idAnnee) => 
    axiosInstance.put(`${API_URL}/setting/anneeUniv/updateEtat/${idAnnee}`)
      .then(response => response.data)
      .catch(error => {
        console.error('Error updating university year state:', error);
        throw error;
      }),

  ajouterAnneeUniversitaire: (anneeUniversitaire) => 
    axiosInstance.post(`${API_URL}/setting/anneeUniv/ajouter`, anneeUniversitaire)
        .then(response => response.data)
        .catch(error => {
          console.error('Error adding university year:', error);
          throw error;
          })
    };


export default anneeUniversitaireService;