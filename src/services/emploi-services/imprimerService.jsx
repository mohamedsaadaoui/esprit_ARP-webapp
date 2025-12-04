import axiosInstance from 'src/utils/axios';
 
const API_URL = import.meta.env.VITE_MAP;
 
 
const getFormattedTimestamp = () => {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  const date = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;
  const time = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  return `${date}_${time}`;
};
 
const imprimerService= {
 // Générer un PDF
 generatePdf: async (classId, startDates, controle) => {
  try {
    console.log(`test ${startDates}`);
    const sortedDates = startDates.sort((a, b) => new Date(a) - new Date(b));
    const startDateParam = sortedDates.join(',');
    
    const response = await axiosInstance.get(`${API_URL}/cours/calendrier/generate-pdf`, {
      params: {
        classId,
        controle,
        startDate: startDateParam
      },
      responseType: 'blob' 
    });

    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const timestamp = getFormattedTimestamp();
    const filename = `emploi_du_temps_${timestamp}.pdf`;
    link.setAttribute('download', filename);
   
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Retourner un objet de succès avec le nom du fichier
    return {
      success: true,
      // eslint-disable-next-line object-shorthand
      filename: filename,
      message: 'PDF généré avec succès !'
    };

  } catch (error) {
    if (error.response && error.response.status === 400) {
      // Convertir le blob en texte pour lire le message d'erreur
      const errorBlob = error.response.data;
      const errorText = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsText(errorBlob);
      });
      throw new Error(errorText);
    }
    throw error;
  }
},
sendPdfByEmail: async (classId, startDates, controle, email) => {
  try {
    const sortedDates = startDates.sort((a, b) => new Date(a) - new Date(b));
    const startDateParam = sortedDates.join(',');
    
    // Supprimer responseType: 'blob' pour recevoir du texte
    const response = await axiosInstance.get(`${API_URL}/cours/email/classeSemaine`, {
      params: {
        classId,
        startDate: startDateParam,
        controle,
        email
      }
      // Pas de responseType ici car on attend du texte, pas un blob
    });
    
    // La réponse est directement le texte de succès
    return response.data;
    
  } catch (error) {
    // Gestion des erreurs HTTP
    if (error.response) {
      // Le serveur a répondu avec un code d'erreur
      throw new Error(error.response.data || 'Erreur lors de l\'envoi de l\'email');
    } else if (error.request) {
      // La requête a été faite mais pas de réponse reçue
      throw new Error('Aucune réponse du serveur');
    } else {
      // Erreur dans la configuration de la requête
      throw new Error(error.message || 'Erreur inconnue');
    }
  }
},
 
  generatePdfEns: async (empId, startDates, anneeId, controle) => {
    try {
      console.log(`Données de départ : ${startDates}`);
      const sortedDates = startDates.sort((a, b) => new Date(a) - new Date(b));
      const startDateParam = sortedDates.join(',');
  
      const response = await axiosInstance.get(`${API_URL}/cours/calendrier/generate-pdfEns`, {
        params: {
          empId,
          startDate: startDateParam,
          anneeId,
          controle
        },
        responseType: 'blob'
      });
  
      // Vérifier si la réponse est un PDF (normalement application/pdf)
      if (response.headers['content-type'] === 'application/pdf') {
        console.log("PDF généré avec succès");
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        const timestamp = getFormattedTimestamp();
        const filename = `emploi_du_temps_${timestamp}.pdf`;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        // Si ce n'est pas un PDF, lire le message d'erreur
        const errorText = await new Response(response.data).text();
        throw new Error(errorText);
      }
    } catch (error) {
      if (error.response && error.response.data instanceof Blob) {
        // Cas où le backend retourne une erreur 400 avec un message texte
        const errorText = await new Response(error.response.data).text();
        throw new Error(errorText);
      }
      throw error;
    }
  },
  sendPdfByEmailEns: async (empId, startDates, anneeId, controle, email) => {
    try {
      const sortedDates = startDates.sort((a, b) => new Date(a) - new Date(b));
      const startDateParam = sortedDates.join(',');
      
      const response = await axiosInstance.get(`${API_URL}/cours/email/enseignantSemaine`, {
        params: {
          empId,
          startDate: startDateParam,
          anneeId,
          controle,
          email
        }
        // Pas de responseType car on attend du texte
      });
  
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data || 'Erreur lors de l\'envoi de l\'email');
      } else if (error.request) {
        throw new Error('Aucune réponse du serveur');
      } else {
        throw new Error(error.message || 'Erreur inconnue');
      }
    }
  },
 
 // Générer un PDF pour plusieurs classes
generatePdfMultipleClasse: async (classIds, startDates, controle) => {
  
  console.log("startdate",startDates)
  try {
    const requestData = {
      classIds,
      startDates: [startDates], // Encapsule la date unique dans un tableau
      controle
    };
    const response = await axiosInstance.post(
      `${API_URL}/cours/calendrier/generate-pdf-multipleClasse`,
      requestData,
      {
        responseType: 'blob'
      }
    );

    // Vérifier si c'est bien un PDF
    if (response.headers['content-type'] === 'application/pdf') {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const timestamp = getFormattedTimestamp();
      const filename = `emploi_du_temps_${timestamp}.pdf`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
    } else {
      // Si ce n'est pas un PDF, lire le message d'erreur
      const errorText = await new Response(response.data).text();
      throw new Error(errorText);
    }
  } catch (error) {
    if (error.response && error.response.data instanceof Blob) {
      const errorText = await new Response(error.response.data).text();
      throw new Error(errorText);
    }
    throw error;
  }
},
generatePdfMultipleEns: async (empId, startDates, anneeId, controle) => {
  try {
      // Transformation des dates triées comme dans votre code original
      const sortedDates = Array.isArray(startDates) 
          ? startDates.sort((a, b) => new Date(a) - new Date(b))
          : [startDates];
      
      const requestData = {
          empIds: Array.isArray(empId) ? empId : [empId],
          startDate: sortedDates[0], // Première date seulement
          anneeId,
          controle
      };

      const response = await axiosInstance.post(
          `${API_URL}/cours/calendrier/ens/multiple`,
          requestData,
          {
              responseType: 'blob'
          }
      );

      // Gestion de la réponse identique à votre code
      if (response.headers['content-type'] === 'application/pdf') {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          const timestamp = getFormattedTimestamp();
          const filename = `emploi_du_temps_enseignant_${timestamp}.pdf`;
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          link.remove();
      } else {
          const errorText = await new Response(response.data).text();
          throw new Error(errorText);
      }
  } catch (error) {
      if (error.response?.data instanceof Blob) {
          const errorText = await new Response(error.response.data).text();
          throw new Error(errorText);
      }
      throw error;
  }
},
  sendPdfByEmailMultipleClasse: async (classIds, startDate, controle) => {
    try {
        const requestData = {
            classIds: Array.isArray(classIds) ? classIds : [classIds], // Garantit que c'est un tableau
            startDates: startDate, // Une seule date dans un tableau
            controle
        };

        const response = await axiosInstance.post(
            `${API_URL}/cours/email/plusieursClasseSemaine`,
            requestData
        );

        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data || 'Erreur lors de l\'envoi des emails');
        }
        throw error;
    }
},
sendPdfByEmailMultipleEnseignant: async (empIds, startDate, anneeId, controle) => {
  try {
      const requestData = {
          empIds: Array.isArray(empIds) ? empIds : [empIds],
          startDate: new Date(startDate).toISOString().split('T')[0], // Format YYYY-MM-DD
          anneeId,
          controle
      };

      const response = await axiosInstance.post(
          `${API_URL}/cours/email/plusieursEnseignantSemaine`,
          requestData
      );

      return response.data;
  } catch (error) {
      if (error.response) {
          throw new Error(error.response.data || 'Erreur lors de l\'envoi des emails');
      } else if (error.request) {
          throw new Error('Aucune réponse du serveur');
      } else {
          throw new Error(error.message || 'Erreur inconnue');
      }
  }
}
};
export default imprimerService;