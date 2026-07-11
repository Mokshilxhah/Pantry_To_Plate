import axios from 'axios';
import useToastStore from '../store/toastStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const authService = {
  // Admin Registration
  registerAdmin: async (email, password, confirmPassword, fullName, kitchenName) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/admin/register/`, {
        email: email.toLowerCase().trim(),
        password,
        confirm_password: confirmPassword,
        full_name: fullName.trim(),
        kitchen_name: kitchenName.trim(),
      });

      if (response.status === 201) {
        useToastStore.getState().success('Admin account created successfully!');
        return response.data;
      }
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Registration failed';
      useToastStore.getState().error(message);
      throw error;
    }
  },

  // Admin Login
  loginAdmin: async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/admin/login/`, {
        email: email.toLowerCase().trim(),
        password,
      });

      if (response.status === 200) {
        useToastStore.getState().success('Login successful!');
        return response.data;
      }
    } catch (error) {
      if (error.response?.status === 401) {
        useToastStore.getState().error('Invalid admin credentials');
      } else {
        useToastStore.getState().error('Login failed. Please try again.');
      }
      throw error;
    }
  },

  // Member Registration
  registerMember: async (email, password, confirmPassword, fullName, inviteCode) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/member/register/`, {
        email: email.toLowerCase().trim(),
        password,
        confirm_password: confirmPassword,
        full_name: fullName.trim(),
        invite_code: inviteCode.toUpperCase().trim(),
      });

      if (response.status === 201) {
        useToastStore.getState().success('Member account created successfully!');
        return response.data;
      }
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Registration failed';
      useToastStore.getState().error(message);
      throw error;
    }
  },

  // Member Login
  loginMember: async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/member/login/`, {
        email: email.toLowerCase().trim(),
        password,
      });

      if (response.status === 200) {
        useToastStore.getState().success('Login successful!');
        return response.data;
      }
    } catch (error) {
      if (error.response?.status === 401) {
        useToastStore.getState().error('Invalid member credentials');
      } else {
        useToastStore.getState().error('Login failed. Please try again.');
      }
      throw error;
    }
  },

  // Check Password Strength
  checkPasswordStrength: async (password) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/password/strength-check/`, {
        password,
      });
      return response.data;
    } catch (error) {
      console.error('Error checking password strength:', error);
      throw error;
    }
  },

  // Request Forgot Password OTP
  requestForgotPassword: async (email) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/password/forgot/`, {
        email: email.toLowerCase().trim(),
      });

      useToastStore.getState().success('OTP sent to your email!');
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error ||
        'Failed to send OTP. Please try again.';
      useToastStore.getState().error(message);
      throw error;
    }
  },

  // Reset Password with OTP
  resetPassword: async (email, otpCode, newPassword, confirmPassword) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/password/reset/`, {
        email: email.toLowerCase().trim(),
        otp_code: otpCode.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      useToastStore.getState().success('Password reset successfully!');
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error ||
        'Password reset failed. Please try again.';
      useToastStore.getState().error(message);
      throw error;
    }
  },

  // Change Password (for logged-in users)
  changePassword: async (currentPassword, newPassword, confirmPassword, token) => {
    try {
      const response = await axios.post(
        `${API_BASE}/auth/password/change/`,
        {
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      useToastStore.getState().success('Password changed successfully!');
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error ||
        'Password change failed. Please try again.';
      useToastStore.getState().error(message);
      throw error;
    }
  },

  // Get Invite Code (for admin)
  getInviteCode: async (token) => {
    try {
      const response = await axios.get(`${API_BASE}/auth/invite-code/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      useToastStore.getState().error('Failed to fetch invite code');
      throw error;
    }
  },
};

export default authService;
