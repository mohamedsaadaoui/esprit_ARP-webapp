import axiosInstance from 'src/utils/axios';

const API_URL = import.meta.env.VITE_MAP;

const cursusService = {
  getAllCursus: () =>
    axiosInstance.get(`${API_URL}/setting/cursus/all`)
      .then(response => response.data)
      .catch(error => {
        console.error('Erreur lors de la récupération des cursus:', error);
        throw error;
      }),
};

export default cursusService;
