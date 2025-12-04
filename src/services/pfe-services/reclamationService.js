import axiosInstance from "src/utils/axios";

const API_URL = import.meta.env.VITE_MAP;


const ReclamationService = {
  getAllReclamation: (annee) => {
    const response = axiosInstance.get(`${API_URL}/encadrement-expertise/list-reclamation/${annee}`);
    return response;
  },
  getDetailReclamationById: (idReclamation) => {
    const response = axiosInstance.get(`${API_URL}/encadrement-expertise/reclamation/${idReclamation}`);
    return response;
  },
 traiterReclamation: (idReclamation, commentaire) => axiosInstance.put(
    `${API_URL}/encadrement-expertise/traiter-demande-changement`,
    {
      idReclamation,
      commentaire,
    }),
  demandeChangement: (reclamationData) => axiosInstance.post(
    `${API_URL}/encadrement-expertise/demande-changement-encadrant`,
    reclamationData
  )
    
};

export default ReclamationService;

