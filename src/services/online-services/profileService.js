import axiosInstance from "src/utils/axios";

const API_URL = import.meta.env.VITE_MAP;

const profileService = {
  getEtudiantData : async (id) => {
    const url = `${API_URL}/profile/${id}`;
    const response = await axiosInstance.get(url);
    return {response} ;
  },
  getNextHolidays : async () => {
    const url = `${API_URL}/profile/next-holidays?cursusId=1`;
    const response = await axiosInstance.get(url);
    return {response} ;
  },
  getStudentRankingParams : async (etudiantId,nomClasse,idAnnee,idSession) => {
    const url = `${API_URL}/profile/ranking?etudiantId=${etudiantId}&nomClasse=${nomClasse}&idAnnee=${idAnnee}&idSession=${idSession}`;
    const response = await axiosInstance.get(url);
    return {response} ;
  },

};
export default profileService;
