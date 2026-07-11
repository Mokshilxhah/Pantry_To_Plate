import axios from 'axios';
import useToastStore from '../store/toastStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const alertsService = {
  // Get alerts list
  getAlerts: async (token, status = 'active', category = 'all') => {
    try {
      const response = await axios.get(`${API_BASE}/alerts`, {
        params: { status, category },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  },

  // Resolve (mark read) alert
  resolveAlert: async (token, id) => {
    try {
      const response = await axios.put(`${API_BASE}/alerts/${id}`, { isRead: true }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      useToastStore.getState().success('Alert resolved!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to resolve alert';
      useToastStore.getState().error(message);
      throw error;
    }
  },

  // Delete alert
  deleteAlert: async (token, id) => {
    try {
      const response = await axios.delete(`${API_BASE}/alerts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      useToastStore.getState().success('Alert removed.');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete alert';
      useToastStore.getState().error(message);
      throw error;
    }
  }
};

export default alertsService;
