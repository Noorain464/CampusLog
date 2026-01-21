import AsyncStorage from '@react-native-async-storage/async-storage';
const API_BASE_URL = 'http://192.168.1.5:3000/api';

// Get stored token
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Store token
export const setToken = async (token) => {
  try {
    await AsyncStorage.setItem('authToken', token);
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

// Remove token
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const token = await getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: async (name, email, password, role = 'student') => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
  },

  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  updatePushToken: async (token) => {
    return apiRequest('/auth/token', { // Ensure this route exists in your backend
      method: 'PUT',
      body: JSON.stringify({ pushToken: token }),
    });
  },

  getProfile: async () => {
    return apiRequest('/auth/profile', {
      method: 'GET',
    });
  },
};

// Inventory API
export const inventoryAPI = {
  getAllItems: async () => {
    return apiRequest('/inventory', {
      method: 'GET',
    });
  },

  getItemById: async (id) => {
    return apiRequest(`/inventory/${id}`, {
      method: 'GET',
    });
  },

  addItem: async (item) => {
    return apiRequest('/inventory', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  updateItem: async (id, item) => {
    return apiRequest(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  },

  deleteItem: async (id) => {
    return apiRequest(`/inventory/${id}`, {
      method: 'DELETE',
    });
  },
};

// Transaction API
export const transactionAPI = {
  requestItem: async (itemId) => {
    return apiRequest('/request', {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    });
  },

  getMyTransactions: async () => {
    return apiRequest('/transactions/my', {
      method: 'GET',
    });
  },

  getAllRequests: async (status) => {
    const query = status ? `?status=${status}` : '';
    return apiRequest(`/requests${query}`, {
      method: 'GET',
    });
  },

  getPendingRequests: async () => {
    return apiRequest('/requests/pending', {
      method: 'GET',
    });
  },

  approveRequest: async (transactionId) => {
    return apiRequest('/request/approve', {
      method: 'POST',
      body: JSON.stringify({ transactionId }),
    });
  },

  rejectRequest: async (transactionId) => {
    return apiRequest('/request/reject', {
      method: 'POST',
      body: JSON.stringify({ transactionId }),
    });
  },

  returnItem: async (transactionId) => {
    return apiRequest('/request/return', {
      method: 'POST',
      body: JSON.stringify({ transactionId }),
    });
  },
};

