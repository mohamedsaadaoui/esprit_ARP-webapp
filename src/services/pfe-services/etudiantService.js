   
   import axiosInstance from "src/utils/axios";
   
   const API_URL = import.meta.env.VITE_MAP;
   
   
   const EtudiantService = {
    getAllStudentsWithoutEncadrantByAnnee: (annee) => {
    const response = axiosInstance.get(`${API_URL}/encadrement-expertise/etudiant/sans-encadrant/${annee}`);
    return response;
  },
  getAllStudentsWithoutExpertByAnnee: (annee) => {
    const response = axiosInstance.get(`${API_URL}/encadrement-expertise/etudiant/sans-expert/${annee}`);
    return response;
  },
   getAllStudentsHaveEncadrantByAnnee: (annee) => {
    const response = axiosInstance.get(`${API_URL}/encadrement-expertise/etudiant/avec-encadrant/${annee}`);
    return response;
  },
   getAllStudentsHaveExpertByAnnee: (annee) => {
    const response = axiosInstance.get(`${API_URL}/encadrement-expertise/etudiant/avec-expert/${annee}`);
    return response;
  },
 getStudentById: (idEtudiant) => {
    const response = axiosInstance.get(`${API_URL}/encadrement-expertise/etudiant/${idEtudiant}`);
    return response;
  }

}
   
   export default EtudiantService;