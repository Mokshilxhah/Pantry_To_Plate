import axios from 'axios';
import useToastStore from '../store/toastStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const mealPlanService = {
  // Get weekly plans
  getWeeklyPlans: async (token) => {
    try {
      const response = await axios.get(`${API_BASE}/mealplans/week`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching weekly meal plans:', error);
      throw error;
    }
  },

  // Save manual slot selection
  planMeal: async (token, planData) => {
    try {
      const response = await axios.post(`${API_BASE}/mealplans/plan`, planData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      useToastStore.getState().success(`Scheduled ${planData.name} for ${planData.mealType}!`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to save meal plan';
      useToastStore.getState().error(message);
      throw error;
    }
  },

  // Generate weekly AI suggestions matching pantry
  generateWeeklyPlans: async (token) => {
    try {
      const response = await axios.post(`${API_BASE}/mealplans/generate`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      useToastStore.getState().success('AI Weekly Menu generated successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to generate weekly menu';
      useToastStore.getState().error(message);
      throw error;
    }
  },

  // Clear slot
  clearPlan: async (token, id, slotName) => {
    try {
      const response = await axios.delete(`${API_BASE}/mealplans/plan/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      useToastStore.getState().success(`Cleared ${slotName} slot.`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to clear slot';
      useToastStore.getState().error(message);
      throw error;
    }
  }
};

export default mealPlanService;
