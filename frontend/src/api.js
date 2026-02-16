import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

export const createStudent = (payload) => api.post('/students', payload);
export const fetchStudents = () => api.get('/students');
export const analyzeImage = (formData) =>
  api.post('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export default api;
