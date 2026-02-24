import axios from 'axios';

const defaultBaseUrl = import.meta.env.DEV ? 'http://localhost:8000' : '';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultBaseUrl,
});

export const createStudent = (payload) => api.post('/students', payload);
export const fetchStudents = (query = '') =>
  api.get('/students', {
    params: query ? { q: query } : {},
  });
export const updateStudent = (studentId, payload) => api.put(`/students/${studentId}`, payload);
export const deleteStudent = (studentId) => api.delete(`/students/${studentId}`);

export const createInstructor = (payload) => api.post('/instructors', payload);
export const fetchInstructors = () => api.get('/instructors');
export const updateInstructor = (instructorId, payload) => api.put(`/instructors/${instructorId}`, payload);
export const deleteInstructor = (instructorId) => api.delete(`/instructors/${instructorId}`);

export const createAppointment = (payload) => api.post('/appointments', payload);
export const fetchAppointments = (date = '') =>
  api.get('/appointments', {
    params: date ? { date } : {},
  });
export const updateAppointment = (appointmentId, payload) => api.put(`/appointments/${appointmentId}`, payload);
export const deleteAppointment = (appointmentId) => api.delete(`/appointments/${appointmentId}`);

export const analyzeImage = (formData) =>
  api.post('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const generateWorkoutPlan = (payload) => api.post('/generate_plan', payload);

export default api;
