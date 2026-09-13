import axios from 'axios';
import { API_ENDPOINTS as endpoints } from './endpoints';
import { handleApiError } from './errors';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors for request and response
apiClient.interceptors.response.use(
  response => response,
  error => {
    handleApiError(error);
    return Promise.reject(error);
  }
);

// Function to fetch data from the API
export const fetchData = async (endpoint: any, params: any = {}) => {
  try {
    const response = await apiClient.get((endpoints as any)[endpoint], { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to post data to the API
export const postData = async (endpoint: any, data: any) => {
  try {
    const response = await apiClient.post((endpoints as any)[endpoint], data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to put data to the API
export const putData = async (endpoint: any, data: any) => {
  try {
    const response = await apiClient.put((endpoints as any)[endpoint], data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to delete data from the API
export const deleteData = async (endpoint: any) => {
  try {
    const response = await apiClient.delete((endpoints as any)[endpoint]);
    return response.data;
  } catch (error) {
    throw error;
  }
};