/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DbUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'shop_owner' | 'admin';
  status: 'active' | 'suspended';
  created_at: string;
}

export interface DbShop {
  id: number;
  owner_id: number;
  shop_name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  status: 'pending' | 'active' | 'suspended';
  avg_rating: number;
  total_reviews: number;
}

export interface DbService {
  id: number;
  shop_id: number;
  service_name: string;
  vehicle_type: string;
  price: number;
  duration: number; // in minutes
}

export interface DbBooking {
  id: number;
  customer_id: number;
  shop_id: number;
  service_id: number;
  booking_date: string;
  booking_time: string;
  vehicle_id: number;
  display_id: string;
  status_updated_at: string;
  status: 'pending' | 'accepted' | 'dispatched' | 'in_progress' | 'completed' | 'cancelled';
}

export interface DbReview {
  id: number;
  customer_id: number;
  shop_id: number;
  booking_id: number;
  rating: number;
  comment: string;
  created_at: string;
}

export interface DbNotification {
  id: number;
  user_id: number | null; // null for broadcast to all
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface DbVehicle {
  id: number;
  customer_id: number;
  vehicle_type: string;
  brand: string;
  model: string;
  year: number;
  plate_number: string;
}

export interface DbPayment {
  id: number;
  booking_id: number;
  amount: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  paid_at: string | null;
}

export interface SqlLog {
  id: string;
  timestamp: string;
  sql: string;
  description: string;
}

export interface FullDbState {
  users: DbUser[];
  shops: DbShop[];
  services: DbService[];
  bookings: DbBooking[];
  reviews: DbReview[];
  notifications: DbNotification[];
  vehicles: DbVehicle[];
  payments: DbPayment[];
  sqlLogs: SqlLog[];
}
