import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

// Auto-retry on network errors (up to 2 retries)
api.interceptors.request.use(
  (config) => {
    config._retryCount = config._retryCount || 0;
    const token = localStorage.getItem('hms_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    // Network error or 5xx — retry up to 2 times
    if (!error.response || error.response.status >= 500) {
      if (config._retryCount < 2) {
        config._retryCount += 1;
        await new Promise(res => setTimeout(res, 600 * config._retryCount));
        return api(config);
      }
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('hms_token');
      localStorage.removeItem('hms_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  initiateLogin:    (data) => api.post('/auth/login/initiate', data),
  verifyLogin:      (data) => api.post('/auth/login/verify', data),
  initiateRegister: (data) => api.post('/auth/register/initiate', data),
  verifyRegister:   (data) => api.post('/auth/register/verify', data),
  resendOtp:        (data) => api.post('/auth/resend-otp', data),
  forgotPassword:   (email) => api.post('/auth/forgot-password', { email }),
  resetPassword:    (data) => api.post('/auth/reset-password', data),
  login:            (data) => api.post('/auth/login/initiate', data),
  register:         (data) => api.post('/auth/register/initiate', data),
  getMe:            ()     => api.get('/auth/me'),
  updateProfile:    (data) => api.put('/auth/profile', data),
  changePassword:   (data) => api.put('/auth/change-password', data),
  logout:           ()     => api.post('/auth/logout'),
};

export const usersAPI = {
  getAll:   (params) => api.get('/users', { params }),
  getOne:   (id)     => api.get(`/users/${id}`),
  approve:  (id)     => api.put(`/users/${id}/approve`),
  update:   (id,data)=> api.put(`/users/${id}`, data),
  delete:   (id)     => api.delete(`/users/${id}`),
  getStats: ()       => api.get('/users/stats'),
};

export const appointmentsAPI = {
  getAll:   (params)         => api.get('/appointments', { params }),
  create:   (data)           => api.post('/appointments', data),
  update:   (id,data)        => api.put(`/appointments/${id}`, data),
  delete:   (id)             => api.delete(`/appointments/${id}`),
  getSlots: (doctorId, date) => api.get(`/appointments/slots/${doctorId}/${date}`),
};

export const medicinesAPI = {
  getAll:   (params) => api.get('/medicines', { params }),
  getOne:   (id)     => api.get(`/medicines/${id}`),
  create:   (data)   => api.post('/medicines', data),
  update:   (id,data)=> api.put(`/medicines/${id}`, data),
  delete:   (id)     => api.delete(`/medicines/${id}`),
};

export const ordersAPI = {
  getAll:       (params)              => api.get('/orders', { params }),
  create:       (data, isFD=false)    => api.post('/orders', data, isFD ? { headers:{'Content-Type':'multipart/form-data'} } : {}),
  updateStatus: (id,data)             => api.put(`/orders/${id}/status`, data),
};

export const recordsAPI = {
  getAll:  (params)   => api.get('/records', { params }),
  getOne:  (id)       => api.get(`/records/${id}`),
  create:  (formData) => api.post('/records', formData, { headers:{'Content-Type':'multipart/form-data'} }),
  update:  (id,data)  => api.put(`/records/${id}`, data),
  delete:  (id)       => api.delete(`/records/${id}`),
};

export const remindersAPI = {
  getAll:       (params)  => api.get('/reminders', { params }),
  create:       (data)    => api.post('/reminders', data),
  update:       (id,data) => api.put(`/reminders/${id}`, data),
  logAdherence: (id,data) => api.post(`/reminders/${id}/adherence`, data),
  delete:       (id)      => api.delete(`/reminders/${id}`),
};

export const alertsAPI = {
  getAll:  (params) => api.get('/alerts', { params }),
  create:  (data)   => api.post('/alerts', data),
  resolve: (id,data)=> api.put(`/alerts/${id}/resolve`, data),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics'),
};

export const paymentsAPI = {
  initiate: (data) => api.post('/payments/initiate', data),
  confirm:  (data) => api.post('/payments/confirm', data),
  history:  ()     => api.get('/payments/history'),
};

export const facilityAPI = {
  getRooms:       (params) => api.get('/facility/rooms', { params }),
  createRoom:     (data)   => api.post('/facility/rooms', data),
  updateRoom:     (id,data)=> api.put(`/facility/rooms/${id}`, data),
  deleteRoom:     (id)     => api.delete(`/facility/rooms/${id}`),
  getSchedules:   (params) => api.get('/facility/schedules', { params }),
  createSchedule: (data)   => api.post('/facility/schedules', data),
  updateSchedule: (id,data)=> api.put(`/facility/schedules/${id}`, data),
  deleteSchedule: (id)     => api.delete(`/facility/schedules/${id}`),
  getMessages:    (params) => api.get('/facility/chat/messages', { params }),
  sendMessage:    (data)   => api.post('/facility/chat/send', data),
  getChatUsers:   ()       => api.get('/facility/chat/users'),
};

export const leavesAPI = {
  getAll:   (params)  => api.get('/leavetasks/leaves', { params }),
  apply:    (data)    => api.post('/leavetasks/leaves', data),
  review:   (id,data) => api.put(`/leavetasks/leaves/${id}/review`, data),
  cancel:   (id)      => api.put(`/leavetasks/leaves/${id}/cancel`),
  getToday: ()        => api.get('/leavetasks/leaves/today'),
};

export const tasksAPI = {
  getAll:  (params) => api.get('/leavetasks/tasks', { params }),
  getMine: ()       => api.get('/leavetasks/tasks'),
  create:  (data)   => api.post('/leavetasks/tasks', data),
  update:  (id,data)=> api.put(`/leavetasks/tasks/${id}`, data),
  delete:  (id)     => api.delete(`/leavetasks/tasks/${id}`),
};

export const salaryAPI = {
  getAll:       (params) => api.get('/salary', { params }),
  getMySummary: ()       => api.get('/salary/my-summary'),
  generate:     (data)   => api.post('/salary/generate', data),
  bulkGenerate: (data)   => api.post('/salary/bulk', data),
  credit:       (id)     => api.put(`/salary/${id}/credit`),
  update:       (id,data)=> api.put(`/salary/${id}`, data),
};

export default api;
