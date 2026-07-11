import useToastStore from '../store/toastStore';

/**
 * Handle API errors with toast notifications
 * @param {Error|AxiosError} error - The error object
 * @param {string} defaultMessage - Default error message if none available
 * @returns {void}
 */
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  const { error: toastError } = useToastStore.getState();

  let message = defaultMessage;

  if (error?.response?.data?.error) {
    message = error.response.data.error;
  } else if (error?.response?.data?.message) {
    message = error.response.data.message;
  } else if (error?.message) {
    message = error.message;
  }

  toastError(message);
};

/**
 * Handle API success response with toast notification
 * @param {string} message - Success message
 * @param {number} duration - Toast duration in ms
 * @returns {void}
 */
export const handleApiSuccess = (message = 'Operation successful', duration = 3000) => {
  const { success } = useToastStore.getState();
  success(message, duration);
};

/**
 * Handle API response and show appropriate toast
 * @param {AxiosResponse} response - The response object
 * @param {string} successMessage - Custom success message
 * @returns {boolean} - True if response is successful
 */
export const handleApiResponse = (response, successMessage = 'Operation successful') => {
  const { success } = useToastStore.getState();

  if (response?.status >= 200 && response?.status < 300) {
    if (successMessage) {
      success(successMessage);
    }
    return true;
  }
  return false;
};

/**
 * Show network error toast
 * @returns {void}
 */
export const showNetworkError = () => {
  const { error } = useToastStore.getState();
  error('Network error. Please check your internet connection.');
};

/**
 * Show validation error toast
 * @param {Object|Array|string} errors - Error object or message
 * @returns {void}
 */
export const showValidationError = (errors) => {
  const { error } = useToastStore.getState();

  if (typeof errors === 'string') {
    error(errors);
  } else if (Array.isArray(errors)) {
    errors.forEach((err) => error(err));
  } else if (typeof errors === 'object') {
    Object.values(errors).forEach((err) => {
      if (typeof err === 'string') {
        error(err);
      } else if (Array.isArray(err)) {
        error(err[0]);
      }
    });
  }
};

/**
 * Show 404 not found toast
 * @returns {void}
 */
export const show404Error = () => {
  const { error } = useToastStore.getState();
  error('Resource not found (404)');
};

/**
 * Show unauthorized toast
 * @returns {void}
 */
export const showUnauthorizedError = () => {
  const { error } = useToastStore.getState();
  error('Unauthorized. Please login again.');
};

/**
 * Show loading toast (returns ID for later removal)
 * @param {string} message - Loading message
 * @returns {number} - Toast ID for removal
 */
export const showLoadingToast = (message = 'Loading...') => {
  const { addToast } = useToastStore.getState();
  return addToast(message, 'info', 0); // 0 = infinite duration
};

/**
 * Show warning toast
 * @param {string} message - Warning message
 * @returns {void}
 */
export const showWarningToast = (message) => {
  const { warning } = useToastStore.getState();
  warning(message);
};
