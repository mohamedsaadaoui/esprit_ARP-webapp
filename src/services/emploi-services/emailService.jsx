import axiosInstance from 'src/utils/axios';
 
const API_URL = import.meta.env.VITE_MAP;
 
const emailService = {
  sendSimpleEmail: async (to, subject, body) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/cours/email/send`, { to, subject, body });
      return response.data;
    } catch (error) {
      console.error('Error sending simple email:', error);
      throw error;
    }
  },
 
  sendEmailWithAttachment: async (to, subject, body, attachmentPath) => {
    const formData = new FormData();
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('body', body);
    formData.append('attachmentPath', attachmentPath);
 
    try {
        const response = await axiosInstance.post(`${API_URL}/cours/email/send-with-attachment`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error sending email with attachment:', error);
        throw error;
    }
}
 
 
 
};
 
export default emailService;