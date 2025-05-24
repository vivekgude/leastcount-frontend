import axios, { AxiosError } from 'axios';
import { ApiError } from '@/types';

interface ErrorResponse {
  message: string;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const handleApiError = (error: AxiosError<ErrorResponse>): ApiError => {
  if (error.response) {
    return {
      message: error.response.data?.message || 'An error occurred',
      statusCode: error.response.status,
    };
  }
  return {
    message: 'Network error occurred',
    statusCode: 500,
  };
};

export default api; 