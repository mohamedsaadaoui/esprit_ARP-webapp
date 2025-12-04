// src/services/userService.js
import axiosInstance from 'src/utils/axios';

import { API_URL } from 'src/config-global';

const userService = {
  login: async (loginRequest) => {
    const url = `${API_URL}/auth/login?loginType=ETUDIANT`;
    try {
      const response = await axiosInstance.post(url, loginRequest);
      return response.data;
    } catch (err) {
      // if server responded with { message, status }
      if (err.response?.data) {
        // reject with that object
        throw err.response.data;
      }
      // otherwise re-throw the original error
      throw err;
    }
  },
};

export default userService;
