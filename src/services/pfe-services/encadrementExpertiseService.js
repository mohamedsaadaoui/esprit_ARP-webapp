import axiosInstance from "src/utils/axios";

const API_URL = import.meta.env.VITE_MAP;


const EncadrementExpertiseService = {
  getAllEncadrants: () => {
    const response = axiosInstance.get(`${API_URL}/encadrement-expertise/employe/encadrants`);
    return response;
  },
   getAllExperts: () => {
    const response = axiosInstance.get(`${API_URL}/encadrement-expertise/employe/experts`);
    return response;
  },
   AffectEncadrant: (idEtudiant,idEncadrant) => {
    const response = axiosInstance.post(`${API_URL}/encadrement-expertise/affecter-encadrant/${idEtudiant}/${idEncadrant}`);
    return response;
  },
  AffectExpert: (idEtudiant,idExpert) => {
    const response = axiosInstance.post(`${API_URL}/encadrement-expertise/affecter-expert/${idEtudiant}/${idExpert}`);
    return response;
  },
   DesaffectEncadrant: (idEtudiant) => {
    const response = axiosInstance.delete(`${API_URL}/encadrement-expertise/desaffecter-encadrant/${idEtudiant}`);
    return response;
  },
  DesaffectExpert: (idEtudiant) => {
    const response = axiosInstance.delete(`${API_URL}/encadrement-expertise/desaffecter-expert/${idEtudiant}`);
    return response;
  },
  getEtatEncadrementExpertiseByStudent: (idEtudiant) => {
    const response = axiosInstance.get(`${API_URL}/encadrement-expertise/etat-encadrement/${idEtudiant}`);
    return response;
}
};

export default EncadrementExpertiseService;

