const en = {
  nav: {
    home: 'Explore', search: 'Search', chat: 'Messages',
    notifications: 'Notifications', profile: 'Profile',
    dashboard: 'Dashboard', admin: 'Admin', logout: 'Sign Out',
    login: 'Sign In', register: 'Join Free',
  },
  home: {
    hero: 'Find Extraordinary Freelance Talent',
    heroSub: 'Connect with expert freelancers for any project. Quality work, delivered on time.',
    searchPlaceholder: 'Search for any service...',
    searchBtn: 'Search',
    featuredGigs: 'Featured Gigs',
    latestGigs: 'Latest Gigs',
    categories: 'Browse Categories',
    viewAll: 'View All',
    noGigs: 'No gigs found.',
  },
  gig: {
    by: 'by',
    orderNow: 'Order Now',
    contactSeller: 'Contact Seller',
    addToWishlist: 'Save',
    removeFromWishlist: 'Saved',
    basic: 'Basic', standard: 'Standard', premium: 'Premium',
    deliveryDays: 'day delivery', revisions: 'revisions',
    faq: 'FAQ', reviews: 'Reviews', about: 'About the Seller',
    noReview: 'No reviews yet.',
  },
  auth: {
    login: 'Sign In', register: 'Create Account',
    email: 'Email', password: 'Password', name: 'Full Name',
    role: 'I want to', asClient: 'Hire freelancers',
    asFreelancer: 'Work as a freelancer',
    forgotPassword: 'Forgot password?',
    noAccount: "Don't have an account?", haveAccount: 'Already have an account?',
  },
  order: {
    place: 'Place Order', myOrders: 'My Orders',
    status: {
      pending: 'Pending', active: 'In Progress', delivered: 'Delivered',
      revision: 'In Revision', completed: 'Completed',
      cancelled: 'Cancelled', disputed: 'Disputed',
    },
    accept: 'Accept Delivery', requestRevision: 'Request Revision',
    cancel: 'Cancel Order', deliver: 'Submit Delivery',
    requirements: 'Order Requirements',
  },
  common: {
    save: 'Save', cancel: 'Cancel', delete: 'Delete',
    edit: 'Edit', loading: 'Loading...', submit: 'Submit',
    back: 'Back', next: 'Next', confirm: 'Confirm',
    search: 'Search', filter: 'Filter', sort: 'Sort',
    all: 'All', yes: 'Yes', no: 'No', or: 'or',
    success: 'Success!', error: 'Error', warning: 'Warning',
  },
};

export type Translations = typeof en;
export default en;
