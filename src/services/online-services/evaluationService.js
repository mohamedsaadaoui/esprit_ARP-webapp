import axiosInstance from "src/utils/axios";

const API_URL = import.meta.env.VITE_MAP;

const evaluationService = {
  async getEvaluationByEtudiant(etudiantId) {
    const url = `${API_URL}/evaluation/etudiant?etudiantId=${etudiantId}`;
    const response = await axiosInstance.get(url);
    return { response };
  },

  async createEvaluation(evaluationData) {
    const url = `${API_URL}/evaluation/submit`;
    const response = await axiosInstance.post(url, evaluationData);
    return { response };
  },

  async getEvaluationDetailsEtudiant(etudiantId, typeEvaluationId, anneeUniversitaireId) {
    const url = `${API_URL}/evaluation/details?etudiantId=${etudiantId}&typeEvaluationId=${typeEvaluationId}&anneeUniversitaireId=${anneeUniversitaireId}`;
    const response = await axiosInstance.get(url);
    return { response };
  },

  async getEvalCriteria(typeEvaluationId) {
    const url = `${API_URL}/evaluation/criteria/${typeEvaluationId}`;
    const response = await axiosInstance.get(url);
    return { response };
  },

  async getAllTypeEvals() {
    const url = `${API_URL}/evaluation/typeEvaluation/all`;
    const response = await axiosInstance.get(url);
    return { response };
  },


  // urgent 
  getEtudiantModulesBySemestreAndClasse: async () => {
    const url = `${API_URL}/absence/planning?idClasseSemestre=3089&idSemestre=1`;
    const response = await axiosInstance.get(url);
    return { response };
},  

  async getEmployePlanningByClasse(nomClasse) {
  const url = `${API_URL}/evaluation/employe-planning?classe=${nomClasse}`;
  const response = await axiosInstance.get(url);
  return { response };
}

};

export default evaluationService;
