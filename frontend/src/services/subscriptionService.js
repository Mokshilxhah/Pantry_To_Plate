import axios from 'axios';
import useToastStore from '../store/toastStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const subscriptionService = {
  // Get User Subscription
  getUserSubscription: async (token) => {
    try {
      const response = await axios.get(`${API_BASE}/auth/subscription/get/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      useToastStore.getState().error('Failed to fetch subscription details');
      throw error;
    }
  },

  // Get Available Plans
  getAvailablePlans: async () => {
    try {
      const response = await axios.get(`${API_BASE}/auth/subscription/plans/`);
      return response.data;
    } catch (error) {
      useToastStore.getState().error('Failed to fetch subscription plans');
      throw error;
    }
  },

  // Check Feature Access
  checkFeatureAccess: async (featureName, token) => {
    try {
      const response = await axios.post(
        `${API_BASE}/auth/subscription/check-feature/`,
        { feature_name: featureName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error checking feature access:', error);
      throw error;
    }
  },

  // Check Member Limit
  checkMemberLimit: async (token) => {
    try {
      const response = await axios.get(
        `${API_BASE}/auth/subscription/check-member-limit/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      useToastStore.getState().error('Failed to check member limit');
      throw error;
    }
  },

  // Initiate Demo Payment & Upgrade
  upgradePlan: async (planName, token) => {
    try {
      const response = await axios.post(
        `${API_BASE}/auth/subscription/upgrade/`,
        { plan_name: planName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      useToastStore.getState().success(response.data.message || 'Plan upgraded successfully!');
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error ||
        'Failed to upgrade plan. Please try again.';
      useToastStore.getState().error(message);
      throw error;
    }
  },

  // Get Payment History
  getPaymentHistory: async (token) => {
    try {
      const response = await axios.get(`${API_BASE}/auth/payments/history/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      useToastStore.getState().error('Failed to fetch payment history');
      throw error;
    }
  },

  // Get Invoices
  getInvoices: async (token) => {
    try {
      const response = await axios.get(`${API_BASE}/auth/invoices/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      useToastStore.getState().error('Failed to fetch invoices');
      throw error;
    }
  },

  // Cancel Subscription
  cancelSubscription: async (token) => {
    try {
      const response = await axios.post(
        `${API_BASE}/auth/subscription/cancel/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      useToastStore.getState().success(response.data.message || 'Subscription cancelled');
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error ||
        'Failed to cancel subscription';
      useToastStore.getState().error(message);
      throw error;
    }
  },
};

export default subscriptionService;
