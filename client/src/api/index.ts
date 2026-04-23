import api from './axiosInstance';

export const authAPI = {
  register:       (data: object)   => api.post('/auth/register', data),
  login:          (data: object)   => api.post('/auth/login', data),
  logout:         ()               => api.post('/auth/logout'),
  getMe:          ()               => api.get('/auth/me'),
  updateProfile:  (data: FormData) => api.put('/auth/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: (data: object)   => api.put('/auth/change-password', data),
};

export const gigAPI = {
  getGigs:   (params?: object) => api.get('/gigs', { params }),
  searchGigs:(params?: object) => api.get('/gigs/search', { params }),
  getMyGigs: ()               => api.get('/gigs/my'),
  getGig:    (id: string)     => api.get(`/gigs/${id}`),
  createGig: (data: FormData) => api.post('/gigs', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateGig: (id: string, data: FormData) => api.put(`/gigs/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteGig: (id: string)     => api.delete(`/gigs/${id}`),
};

export const orderAPI = {
  placeOrder:        (data: object)              => api.post('/orders', data),
  getMyOrders:       (params?: object)           => api.get('/orders/my', { params }),
  getOrder:          (id: string)                => api.get(`/orders/${id}`),
  deliverOrder:      (id: string, data: FormData) => api.post(`/orders/${id}/deliver`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateOrderStatus: (id: string, data: object)  => api.put(`/orders/${id}/status`, data),
};

export const reviewAPI = {
  createReview:  (data: object) => api.post('/reviews', data),
  getGigReviews: (gigId: string, params?: object) => api.get(`/reviews/gig/${gigId}`, { params }),
  reportReview:  (id: string, data: object) => api.put(`/reviews/${id}/report`, data),
};

export const messageAPI = {
  getOrCreateConversation: (data: object) => api.post('/messages/conversations', data),
  getConversations:        ()             => api.get('/messages/conversations'),
  getMessages:             (conversationId: string, params?: object) => api.get(`/messages/conversations/${conversationId}`, { params }),
  sendMessage:             (data: FormData) => api.post('/messages/send', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const notificationAPI = {
  getNotifications: (params?: object) => api.get('/notifications', { params }),
  markAllRead:      ()                => api.put('/notifications/read-all'),
  markRead:         (id: string)      => api.put(`/notifications/${id}/read`),
  deleteNotification:(id: string)    => api.delete(`/notifications/${id}`),
};

export const wishlistAPI = {
  toggleWishlist: (gigId: string) => api.post(`/wishlist/${gigId}`),
  getWishlist:    ()              => api.get('/wishlist'),
};

export const disputeAPI = {
  openDispute: (data: object) => api.post('/disputes', data),
  getDispute:  (id: string)   => api.get(`/disputes/${id}`),
};

export const adminAPI = {
  getUsers:               (params?: object) => api.get('/admin/users', { params }),
  toggleBlockUser:        (id: string)      => api.put(`/admin/users/${id}/block`),
  changeUserRole:         (id: string, data: object) => api.put(`/admin/users/${id}/role`, data),
  getAdminGigs:           (params?: object) => api.get('/admin/gigs', { params }),
  featureGig:             (id: string)      => api.put(`/admin/gigs/${id}/feature`),
  getDisputes:            (params?: object) => api.get('/admin/disputes', { params }),
  resolveDispute:         (id: string, data: object) => api.put(`/admin/disputes/${id}/resolve`, data),
  toggleReviewVisibility: (id: string)      => api.put(`/admin/reviews/${id}/toggle-visibility`),
  getAnalytics:           ()                => api.get('/admin/analytics'),
  getLogs:                (params?: object) => api.get('/admin/logs', { params }),
};

export const userAPI = {
  getPublicProfile: (id: string) => api.get(`/users/${id}`),
};
