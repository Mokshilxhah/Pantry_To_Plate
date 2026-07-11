import axios from 'axios';
import useToastStore from '../store/toastStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const chatService = {
  // Fetch shared feed messages
  getMessages: async (token) => {
    try {
      const response = await axios.get(`${API_BASE}/chat/messages`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  },

  // Post message to the shared kitchen thread
  sendMessage: async (token, messageData) => {
    try {
      const response = await axios.post(`${API_BASE}/chat/messages`, messageData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to send message';
      useToastStore.getState().error(message);
      throw error;
    }
  },

  // Vote on active kitchen poll option
  votePoll: async (token, messageId, optionIndex) => {
    try {
      const response = await axios.post(`${API_BASE}/chat/messages/${messageId}/vote`, {
        option_index: optionIndex
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to register vote';
      useToastStore.getState().error(message);
      throw error;
    }
  },

  // Upload file/image to chat attachment directory
  uploadFile: async (token, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`${API_BASE}/chat/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to upload file';
      useToastStore.getState().error(message);
      throw error;
    }
  }
};

export default chatService;
