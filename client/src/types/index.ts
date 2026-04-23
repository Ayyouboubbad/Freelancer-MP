export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'client' | 'freelancer' | 'admin';
  avatar: string;
  bio: string;
  country: string;
  languages: string[];
  skills: string[];
  xp: number;
  level: 'beginner' | 'pro' | 'expert';
  totalEarnings: number;
  completedOrders: number;
  responseTime: string;
  isAvailable: boolean;
  isVerified: boolean;
  isBlocked: boolean;
  wishlist: string[];
  createdAt: string;
}

export interface GigPackage {
  name: 'basic' | 'standard' | 'premium';
  title: string;
  description: string;
  price: number;
  deliveryDays: number;
  revisions: number;
  features: string[];
}

export interface Gig {
  _id: string;
  seller: User;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
  packages: GigPackage[];
  faqs: { question: string; answer: string }[];
  images: string[];
  video: string;
  averageRating: number;
  totalReviews: number;
  totalOrders: number;
  impressions: number;
  clicks: number;
  isActive: boolean;
  isPaused: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface Order {
  _id: string;
  client: User;
  freelancer: User;
  gig: Gig;
  package: GigPackage;
  price: number;
  platformFee: number;
  freelancerEarnings: number;
  status: 'pending' | 'active' | 'delivered' | 'revision' | 'completed' | 'cancelled' | 'disputed';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  deadline: string;
  deliveredAt?: string;
  revisionCount: number;
  revisionNote: string;
  requirements: string;
  delivery?: { files: string[]; note: string; deliveredAt: string };
  cancelledBy: string;
  cancelReason: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  order: string;
  gig: string;
  reviewer: User;
  reviewee: string;
  rating: number;
  comment: string;
  isReported: boolean;
  isHidden: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  lastMessage?: Message;
  lastMessageAt: string;
  unreadCounts: Record<string, number>;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: User;
  text: string;
  attachments: string[];
  isRead: boolean;
  createdAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  type: string;
  title: string;
  body: string;
  link: string;
  isRead: boolean;
  relatedOrder?: string;
  createdAt: string;
}

export interface Dispute {
  _id: string;
  order: Order;
  raisedBy: User;
  against: User;
  reason: string;
  evidence: string[];
  status: 'open' | 'under_review' | 'resolved_client' | 'resolved_freelancer' | 'closed';
  resolution: string;
  resolvedBy?: User;
  resolvedAt?: string;
  createdAt: string;
}

export interface Analytics {
  totalUsers: number;
  totalFreelancers: number;
  totalClients: number;
  totalGigs: number;
  totalOrders: number;
  completedOrders: number;
  totalReviews: number;
  openDisputes: number;
  totalRevenue: number;
  ordersPerMonth: { _id: { year: number; month: number }; count: number; revenue: number }[];
}

export interface PublicProfile extends Pick<User, 'name' | 'avatar' | 'bio' | 'country' | 'languages' | 'skills' | 'xp' | 'level' | 'totalEarnings' | 'completedOrders' | 'responseTime' | 'isAvailable' | 'isVerified' | 'role' | 'createdAt'> {
  _id: string;
  gigs: Gig[];
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

