import axios from 'axios';

const API_CONFIG = {
  SOUTENANCE: "http://localhost:8021"
};

export const chatbotService = {
  sendMessage: async (content, username = 'Utilisateur') => {
    try {
      console.log('📤 Envoi message chatbot:', { content, username });
      
      const response = await axios.post(
        `${API_CONFIG.SOUTENANCE}/api/chatbot/message`, 
        {
          content: content,
          username: username
        }, 
        {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('📥 Réponse chatbot brute:', response.data);
      
      // 🔥 CORRECTION : Extraction cohérente de la réponse
      let responseData = response.data;
      
      // Si c'est un objet avec une propriété response
      if (responseData && typeof responseData === 'object' && responseData.response) {
        return responseData.response;
      }
      
      // Si c'est directement une string
      if (typeof responseData === 'string') {
        return responseData;
      }
      
      // Fallback
      return JSON.stringify(responseData);
      
    } catch (error) {
      console.error('❌ Erreur détaillée chatbot:', error);
      
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Impossible de se connecter au serveur.');
      } else if (error.response?.status === 500) {
        throw new Error('Erreur serveur interne.');
      } else {
        throw new Error('Erreur de communication avec le chatbot');
      }
    }
  }
};