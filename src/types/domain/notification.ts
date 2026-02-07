export interface Notification {
  id: string;
  user_id: string;
  type: 'message' | 'appointment' | 'system' | 'payment';
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}
