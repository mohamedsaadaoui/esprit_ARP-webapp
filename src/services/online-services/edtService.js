import axiosInstance from "src/utils/axios";

import { EDT_TOKEN } from "src/config-global";

const API_URL = import.meta.env.VITE_MAP;

const edtService = {
  getEmploisEtudiantByClasseAndDate: async (className, startDate) => {
    const url = `${API_URL}/edt/generate-pdf?className=${className}&controle=true&startDate=${startDate}`;

    const response = await axiosInstance.get(url, {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${EDT_TOKEN}`,
      },
    });

    return response;
  },
};

export default edtService;
