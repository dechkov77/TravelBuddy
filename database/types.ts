export interface Profile {
  id: string;
  name: string;
  bio: string | null;
  country: string | null;
  travel_interests: string[] | string;
  profile_picture: string | null;
  created_at: string;
  updated_at: string;
}
export interface Trip {
  id: string;
  user_id: string;
  destination: string;
  start_date: string;
  end_date: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}
export interface Buddy {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}
export interface TripParticipant {
  id: string;
  trip_id: string;
  user_id: string;
  joined_at: string;
}
export interface Message {
  id: string;
  trip_id: string;
  user_id: string;
  content: string;
  created_at: string;
}
export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: string;
}
export interface ItineraryItem {
  id: string;
  trip_id: string;
  day: number;
  title: string;
  description: string | null;
  time: string | null;
  location: string | null;
  created_at: string;
}
export interface Expense {
  id: string;
  trip_id: string;
  user_id: string;
  title: string;
  amount: number;
  category: string | null;
  description: string | null;
  split_among: string[] | string | null;
  created_at: string;
}
export interface Recommendation {
  id: string;
  trip_id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  location: string | null;
  rating: number | null;
  created_at: string;
}
export interface JournalEntry {
  id: string;
  trip_id: string;
  user_id: string;
  title: string;
  content: string;
  photos: string | null;
  date: string;
  location: string | null;
  created_at: string;
}
export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}