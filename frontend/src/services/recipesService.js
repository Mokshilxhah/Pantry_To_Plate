import axios from 'axios';
import useToastStore from '../store/toastStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const recipesService = {
  // Get all recipes for kitchen (supports search and tag filters)
  getRecipes: async (token, params = {}) => {
    try {
      const response = await axios.get(`${API_BASE}/recipes`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
  },

  // Save a custom recipe to database
  addRecipe: async (token, recipeData) => {
    try {
      const response = await axios.post(`${API_BASE}/recipes`, recipeData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      useToastStore.getState().success(`Successfully saved "${recipeData.title}"!`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to save recipe';
      useToastStore.getState().error(message);
      throw error;
    }
  },

  // Delete a recipe from book
  deleteRecipe: async (token, id, title) => {
    try {
      const response = await axios.delete(`${API_BASE}/recipes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      useToastStore.getState().success(`Removed "${title}" from your Recipe Book.`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete recipe';
      useToastStore.getState().error(message);
      throw error;
    }
  },

  // Generate AI recipes based on filters and ingredients
  generateAiRecipes: async (token, params) => {
    try {
      const response = await axios.post(`${API_BASE}/recipes/ai-generate`, params, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to generate AI recipes';
      useToastStore.getState().error(message);
      throw error;
    }
  },

  // Chat with AI Pantry Chef
  chatWithAiChef: async (token, message) => {
    try {
      const response = await axios.post(`${API_BASE}/recipes/ai-chat`, { message }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'AI Chef is busy right now.';
      useToastStore.getState().error(message);
      throw error;
    }
  }
};

export default recipesService;
