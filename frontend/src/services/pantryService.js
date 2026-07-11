import axios from 'axios';
import useToastStore from '../store/toastStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const pantryService = {
  // Fetch all items
  getItems: async (token) => {
    try {
      const response = await axios.get(`${API_BASE}/pantry/items`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error in getItems:', error);
      throw error;
    }
  },

  // Add new item
  addItem: async (token, itemData) => {
    try {
      const response = await axios.post(`${API_BASE}/pantry/items`, itemData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      useToastStore.getState().success(`Added ${itemData.name} to pantry!`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to add pantry item';
      useToastStore.getState().error(message);
      throw error;
    }
  },

  // Update item
  updateItem: async (token, id, itemData) => {
    try {
      const response = await axios.put(`${API_BASE}/pantry/items/${id}`, itemData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update pantry item';
      useToastStore.getState().error(message);
      throw error;
    }
  },

  // Delete item
  // Delete item
  deleteItem: async (token, id, name) => {
    try {
      const response = await axios.delete(`${API_BASE}/pantry/items/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      useToastStore.getState().success(`Removed ${name || 'item'} from pantry.`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete pantry item';
      useToastStore.getState().error(message);
      throw error;
    }
  },

  // Upload pantry file
  uploadFile: async (token, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`${API_BASE}/pantry/items/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to parse file';
      useToastStore.getState().error(message);
      throw error;
    }
  },

  // Add batch items
  addBatchItems: async (token, items) => {
    try {
      const response = await axios.post(`${API_BASE}/pantry/items`, items, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      useToastStore.getState().success(`Successfully imported ${items.length} items to pantry!`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to batch add items';
      useToastStore.getState().error(message);
      throw error;
    }
  }
};

export default pantryService;
