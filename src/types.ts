export type CategoryType = 
  | 'All'
  | 'Jazz'
  | 'Quiz Night'
  | 'Open Mic'
  | 'Nightlife'
  | 'Meetups'
  | 'Seminars'
  | 'Food'
  | 'Arts'
  | 'Sports';

export type ServiceCategoryType =
  | 'All Services'
  | 'Sound & Stage'
  | 'Boat & Marine'
  | 'Lakeside Catering'
  | 'Security & Gate'
  | 'Media & Drone'
  | 'Beach Decor';

export interface EntebbeVenue {
  id: string;
  name: string;
  area: string; // e.g. "Kitoro", "Bugonga", "Botanical Beach", "Nakiwogo", "Aero Beach", "Waterfront", "Abaita Ababiri"
  lat: number;
  lng: number;
  address: string;
  vibe: string;
}

export interface EntebbeEvent {
  id: string;
  title: string;
  category: CategoryType;
  venue: EntebbeVenue;
  dateStr: string;
  timeStr: string;
  rawDate: string; // ISO or date string for Google Tasks
  priceUGX: number;
  isFree?: boolean;
  featured?: boolean;
  tags: string[];
  imageUrl: string;
  description: string;
  organizer: string;
  organizerLicense?: string;
  attendeesCount: number;
  liveStatus?: 'LIVE' | 'SOON' | 'UPCOMING';
  musicVibe?: string;
  isSoldOut?: boolean;
  waitlistCount?: number;
}

export interface EntebbeService {
  id: string;
  name: string;
  category: Exclude<ServiceCategoryType, 'All Services'>;
  area: string; // Entebbe parish/zone only
  lat: number;
  lng: number;
  address: string;
  rateUGX: number;
  rateUnit: string; // e.g. "per event", "per hour", "per package"
  rating: number;
  verifiedLicense: string;
  phone: string;
  description: string;
  imageUrl: string;
  highlights: string[];
}

export interface GeoVerificationStatus {
  isVerifiedEntebbe: boolean;
  lat: number;
  lng: number;
  distanceKm: number;
  detectedArea: string;
  method: 'gps' | 'simulated-entebbe' | 'simulated-outside';
  verifiedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: 'urgent' | 'ticket' | 'promo' | 'waitlist';
  eventId?: string;
}

export interface UserTicket {
  id: string;
  userId: string;
  eventId: string;
  eventTitle: string;
  venueName: string;
  area: string;
  eventDate: string;
  ticketType: 'Regular' | 'VIP' | 'Early Bird' | 'Backstage Pass';
  priceUGX: number;
  qrCode: string;
  status: 'valid' | 'used' | 'cancelled';
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'topup' | 'purchase' | 'withdrawal' | 'cashback';
  amountUGX: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  phone?: string;
  role: 'attendee' | 'organiser';
  walletBalance: number;
  createdAt: string;
  entebbeOrganiserVerified?: boolean;
  organiserParish?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
}
