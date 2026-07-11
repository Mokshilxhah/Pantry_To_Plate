import axios from 'axios';
import useToastStore from '../store/toastStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const shoppingService = {
  // Get shopping list
  getItems: async (token) => {
    try {
      const response = await axios.get(`${API_BASE}/shopping/items`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching shopping items:', error);
      throw error;
    }
  },

  // Add manual item
  addItem: async (token, itemData) => {
    try {
      const response = await axios.post(`${API_BASE}/shopping/items`, itemData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      useToastStore.getState().success(`Added ${itemData.name} to buy list!`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to add item to buy list';
      useToastStore.getState().error(message);
      throw error;
    }
  },

  // Update item (e.g. check off as bought)
  updateItem: async (token, id, itemData) => {
    try {
      const response = await axios.put(`${API_BASE}/shopping/items/${id}`, itemData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update item';
      useToastStore.getState().error(message);
      throw error;
    }
  },

  // Delete item
  deleteItem: async (token, id, name) => {
    try {
      const response = await axios.delete(`${API_BASE}/shopping/items/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      useToastStore.getState().success(`Removed ${name || 'item'} from buy list.`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete item';
      useToastStore.getState().error(message);
      throw error;
    }
  }
};

export default shoppingService;
