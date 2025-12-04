import axiosInstance from 'src/utils/axios';
 
const API_URL = import.meta.env.VITE_MAP;
 
const userService = {
    getAllUsers: () =>
        axiosInstance.get(`${API_URL}/auth/user/all`)
          .then(response => response.data)
          .catch(error => {
            console.error('Error fetching users:', error);
            throw error;
          }),
 
          register: (registerRequest) =>
            axiosInstance.post(`${API_URL}/auth/register`, registerRequest)
              .then(response => response.data)
              .catch(error => {
                  console.error('Error during registration:', error);
                  if (error.response && error.response.data) {
                      throw error.response.data; // Renvoyer les erreurs de validation
                  } else {  
                      throw new Error('An unexpected error occurred during registration');
                  }
              }),
              login: (loginRequest) =>
                axiosInstance.post(`${API_URL}/auth/login`, loginRequest)
                    .then(response => response.data)
                    .catch(error => {
                        console.error('Error during login:', error);
                        if (error.response && error.response.data) {
                            throw error.response.data; // Renvoyer les erreurs de validation
                        } else {
                            throw new Error('An unexpected error occurred during login');
                        }
                    }),
                    verifyUser: (token) =>
                        axiosInstance.get(`${API_URL}/auth/verify`, { params: { token } })
                            .then(response => {
                                console.log('User verified successfully:', response.data);
                            })
                            .catch(error => {
                                console.error('Error during verification:', error);
                                if (error.response && error.response.data) {
                                    throw error.response.data;
                                } else {
                                    throw new Error('An unexpected error occurred during verification');
                                }
                            }),
 
                            createPassword: (token, newPasswordRequest) =>
                                axiosInstance.post(`${API_URL}/auth/create-password`, newPasswordRequest, { params: { token } })
                                    .then(response => response.data)
                                    .catch(error => {
                                        console.error('Error creating password:', error);
                                        if (error.response && error.response.data) {
                                            throw error.response.data;
                                        } else {
                                            throw new Error('An unexpected error occurred while creating the password');
                                        }
                                    }),
 
              getAllRoles: () =>
                axiosInstance.get(`${API_URL}/auth/roles`)
                  .then(response => response.data)
                  .catch(error => {
                      console.error('Error fetching roles:', error);
                      throw error;
                  }),
                  createRole: (idCursus, roleRequest) =>
                    axiosInstance.post(`${API_URL}/auth/roles/ajouter/${idCursus}`, roleRequest)
                        .then(response => response.data)
                        .catch(error => {
                            console.error('Error creating role:', error);
                            if (error.response && error.response.data) {
                                throw error.response.data; // Renvoyer les erreurs de validation
                            } else {
                                throw new Error('An unexpected error occurred while creating the role');
                            }
                        }),
 
                  getAllCursus: () =>
                    axiosInstance.get(`${API_URL}/auth/cursus`)
                      .then(response => response.data)
                      .catch(error => {
                          console.error('Error fetching cursus:', error);
                          throw error;
                      }),
 
                      getAllPermissions: () =>
                        axiosInstance.get(`${API_URL}/auth/permissions`)
                            .then(response => response.data)
                            .catch(error => {
                                console.error('Error fetching permissions:', error);
                                throw error;
                            }),
                            getRoleById: (roleId) =>
                                axiosInstance.get(`${API_URL}/auth/roles/${roleId}`)
                                    .then(response => response.data)
                                    .catch(error => {
                                        console.error('Error fetching role:', error);
                                        throw error;
                                    }),
                                    getPermissionsByRoleId: (roleId) =>
                                        axiosInstance.get(`${API_URL}/auth/permissions/role/${roleId}`)
                                            .then(response => response.data)
                                            .catch(error => {
                                                console.error('Error fetching permissions by role ID:', error);
                                                throw error;
                                            }),
                                            getPermissionsNotInRole: (roleId) =>
                                                axiosInstance.get(`${API_URL}/auth/permissions/role/${roleId}/not`)
                                                    .then(response => response.data)
                                                    .catch(error => {
                                                        console.error('Error fetching permissions not in role:', error);
                                                        throw error;
                                                    }),
 
                                               // Dans userService.js
                                               assignPermissionToRole: (roleId, permissionIds) => {
                                                // Aplanir les IDs des permissions
                                                const params = permissionIds.map(id => `permissionId=${id}`).join('&');
                                             
                                                return axiosInstance.post(`${API_URL}/auth/roles/${roleId}?${params}`, null)
                                                  .then(response => response.data)
                                                  .catch(error => {
                                                    console.error('Error:', error);
                                                    console.error('Error response:', error.response);
                                                  });
                                              },
                                           
                                              changePassword: (token, changePasswordRequest) =>
                                                axiosInstance.post(`${API_URL}/auth/change-password`, changePasswordRequest, {
                                                    headers: {
                                                        Authorization: `Bearer ${token}`, // Ajoutez l'en-tête d'autorisation ici
                                                    },
                                                })
                                                .then(response => response.data)
                                                .catch(error => {
                                                    console.error('Error changing password:', error);
                                                    if (error.response && error.response.data) {
                                                        throw error.response.data; // Renvoyer les erreurs de validation
                                                    } else {
                                                        throw new Error('An unexpected error occurred while changing the password');
                                                    }
                                                }),
 
                                                requestPasswordReset: (email) =>
                                                    axiosInstance.post(`${API_URL}/auth/mdp/forgot-password`, null, {
                                                        params: { email }
                                                    })
                                                    .then(response => response.data)
                                                    .catch(error => {
                                                        console.error('Error requesting password reset:', error);
                                                        if (error.response && error.response.data) {
                                                            throw error.response.data;
                                                        } else {
                                                            throw new Error('An unexpected error occurred while requesting password reset');
                                                        }
                                                    }),
                                           
                                                verifyResetCode: (email, resetCode) =>
                                                    axiosInstance.post(`${API_URL}/auth/mdp/verify-reset-code`, null, {
                                                        params: { email, resetCode }
                                                    })
                                                    .then(response => response.data)
                                                    .catch(error => {
                                                        console.error('Error verifying reset code:', error);
                                                        if (error.response && error.response.data) {
                                                            throw error.response.data;
                                                        } else {
                                                            throw new Error('An unexpected error occurred while verifying reset code');
                                                        }
                                                    }),
                                           
                                                resetPassword: (email, resetCode, newPassword) =>
                                                    axiosInstance.post(`${API_URL}/auth/mdp/reset-password`, { email, resetCode, newPassword })
                                                    .then(response => response.data)
                                                    .catch(error => {
                                                        console.error('Error resetting password:', error);
                                                        if (error.response && error.response.data) {
                                                            throw error.response.data;
                                                        } else {
                                                            throw new Error('An unexpected error occurred while resetting password');
                                                        }
                                                    }),


                                                    getRolesByCursus: (cursusId) =>
                                                        axiosInstance.get(`${API_URL}/auth/roles/cursus/${cursusId}`)
                                                            .then(response => response.data)
                                                            .catch(error => {
                                                                console.error('Error fetching roles by cursus ID:', error);
                                                                throw error;
                                                            }),

                                                            updateUser: (userId, userDetails) =>
                                                                axiosInstance.put(`${API_URL}/auth/user/${userId}`, userDetails)
                                                                    .then(response => response.data)
                                                                    .catch(error => {
                                                                        console.error('Error updating user:', error);
                                                                        if (error.response && error.response.data) {
                                                                            throw error.response.data; 
                                                                        } else {
                                                                            throw new Error('An unexpected error occurred while updating the user');
                                                                        }
                                                                    }),
                                            };
 
export default userService;  