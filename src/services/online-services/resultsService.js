import axiosInstance from "src/utils/axios";

const API_URL = import.meta.env.VITE_MAP;

const resultsService = {
  getEtudiantResultBySession : async (id,sessionId) => {
    const url = `${API_URL}/resultat/${id}?session=${sessionId}`;
    const response = await axiosInstance.get(url);
    return {response} ;
  },
  getEtudiantModulesResultBySessionAndAnnee : async (id,annee,sessionId) => {
    const url = `${API_URL}/resultat/modules/details/${id}?anneeId=${annee}&sessionId=${sessionId}`;
    const response = await axiosInstance.get(url);
    return {response} ;
  },
  async getAverageGradesBySessionAndAnnee(codeModule, sessionId, anneeId) {
    const url = `${API_URL}/resultat/average?moduleCode=${codeModule}&sessionId=${sessionId}&anneeId=${anneeId}`;
    const response = await axiosInstance.get(url);
    return {response} ;
  }
  
};
export default resultsService;
