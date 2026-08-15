export type UserRole = 'admin' | 'client';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  createdAt: string;
}

export type OrderStatus = 'pending' | 'reviewing' | 'quoted' | 'payment_pending' | 'in_progress' | 'completed' | 'cancelled';

export interface OrderFile {
  name: string;
  url: string;
}

export interface Order {
  id: string;
  clientUid: string;
  clientName: string;
  clientEmail: string;
  serviceType: string;
  description: string;
  deadline: string;
  status: OrderStatus;
  price?: number;
  shippingAddress?: string;
  referenceUrl?: string;
  files: OrderFile[];
  resultFiles: OrderFile[];
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  software: string[];
  year: string;
}

export interface EngineeringService {
  id: string;
  title: string;
  description: string;
  icon: string;
  capabilities: string[];
  software: string[];
  color: string;
}
