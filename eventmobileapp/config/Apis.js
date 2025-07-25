import axios from 'axios';

const BASE_URL = 'http://192.168.1.47:8000';

// Định nghĩa các endpoint dựa trên urls.py của backend
export const endpoints = {
  // User-related
  register: '/users/register/',
  login: '/o/token/', // Sử dụng OAuth2 token endpoint
  currentUser: '/users/current-user/',
  googleLogin: '/users/google-login/',
  logout: '/users/logout/',

  // Organizer-related
  requestOrganizer: '/organizers/request-organizer/',
  verifyOrganizer: (userId) => `/organizers/${userId}/verify/`,
  pendingVerification: '/organizers/pending-verification',

  // Category-related
  categories: '/categories/',

  // Event-related
  events: '/events/',
  eventDetails: (eventId) => `/events/${eventId}/`,
  searchEvents: '/events/search/',
  eventReviews: (eventId) => `/events/${eventId}/reviews/`,
  myEvents: '/events/', // Lọc theo organizer trong API
  editEvent: (eventId) => `/events/${eventId}/`,

  // Ticket-related
  eventTickets: (eventId) => `/events/${eventId}/tickets/`,
  tickets: '/tickets/',
  ticketHistory: '/tickets/history/',
  validateTicket: (ticketId) => `/tickets/${ticketId}/validate/`,
  cancelTicket: (ticketId) => `/tickets/${ticketId}/cancel/`,

  // Payment-related
  payments: '/payments/',
  paymentReturn: '/payments/return/',
  paymentIpn: '/payments/ipn/',

  // Review-related
  myReviews: '/my-reviews/',
  updateReview: (reviewId) => `/my-reviews/${reviewId}/update/`,
  deleteReview: (reviewId) => `/my-reviews/${reviewId}/delete/`,
  reviewReplies: (reviewId) => `/reviews/${reviewId}/replies/`,

  // Notification-related
  notifications: '/notifications/', // Giả định endpoint cho thông báo

  // Statistics-related
  statistics: '/statistics/' // Giả định endpoint cho thống kê
};

// Tạo instance axios với xác thực Bearer token
export const authApis = (token) => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Tạo instance axios mặc định với xử lý lỗi
const defaultAxios = axios.create({
  baseURL: BASE_URL,
});

defaultAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default defaultAxios;