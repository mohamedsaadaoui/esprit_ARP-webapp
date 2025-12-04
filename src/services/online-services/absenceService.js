
import axiosInstance from "src/utils/axios";

const API_URL = import.meta.env.VITE_MAP;

const absenceService = {
  getEtudiantData: async (etudiantId, startDate, endDate) => {
    const url = `${API_URL}/absence/student`;
    const response = await axiosInstance.get(url, {
      params: {
        etudiantId,
        startDate,
        endDate,
      },
    });
    return {response};
  },
 /// URGENT
  getEtudiantModulesBySemestreAndClasse: async () => {
    const url = `${API_URL}/absence/planning?idClasseSemestre=3089&idSemestre=2`;
    const response = await axiosInstance.get(url);
    return {response};
  },

  
  getTauxAbsenceByModule: async (etudiantId,codeModule,startDate,endDate) => {
    const url = `${API_URL}/absence/taux-absence?etudiantId=${etudiantId}&codeModule=${codeModule}&startDate=${startDate}&endDate=${endDate}`;
    const response = await axiosInstance.get(url);
    return {response};
  },
  addJustificationToAbsence: async ({ absenceId, description, dateJustification, document }) => {
    const url = `${API_URL}/absence/justification`;

    const formData = new FormData();
    formData.append("absenceId", absenceId);
    formData.append("description", description);
    if (dateJustification) {
      formData.append("dateJustification", dateJustification);
    }
    if (document) {
      formData.append("document", document);
    }

    const response = await axiosInstance.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return { response };
  },
};



export default absenceService;
