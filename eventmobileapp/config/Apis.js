import axios from 'axios';

const BASE_URL ='https://b780-171-250-11-112.ngrok-free.app';

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
  // verifyOrganizer: (userId) => `/organizers/${userId}/verify/`, // Thêm nếu cần

  // Category-related
  categories: '/categories/',

  // Event-related
  events: '/events/',
  eventDetails: (eventId) => `/events/${eventId}/`,
  searchEvents: '/events/search/',
  eventReviews: (eventId) => `/events/${eventId}/reviews/`,

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