
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: string
          timezone: string
          created_at: string
          updated_at: string
          is_deleted: boolean
        }
        Insert: {
          id: string
          email: string
          first_name?: string
          last_name?: string
          role?: string
          timezone?: string
          created_at?: string
          updated_at?: string
          is_deleted?: boolean
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: string
          timezone?: string
          created_at?: string
          updated_at?: string
          is_deleted?: boolean
        }
      }
      providers: {
        Row: {
          id: string
          user_id: string
          professional_title: string
          professional_category: string
          npi: string | null
          years_experience: number
          bio: string
          tagline: string
          image_url: string
          hourly_rate: number
          sliding_scale: boolean
          min_fee: number | null
          max_fee: number | null
          address_street: string | null
          address_city: string | null
          address_state: string | null
          address_zip: string | null
          address_country: string | null
          address_lat: number | null
          address_lng: number | null
          phone: string | null
          website: string | null
          subscription_tier: string
          subscription_status: string
          moderation_status: string
          is_published: boolean
          business_name: string | null
          tax_id: string | null
          stripe_account_id: string | null
          stripe_status: string | null
          profile_slug: string | null
          pronouns: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          professional_title?: string
          professional_category?: string
          npi?: string | null
          years_experience?: number
          bio?: string
          tagline?: string
          image_url?: string
          hourly_rate?: number
          sliding_scale?: boolean
          min_fee?: number | null
          max_fee?: number | null
          address_street?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zip?: string | null
          address_country?: string | null
          address_lat?: number | null
          address_lng?: number | null
          phone?: string | null
          website?: string | null
          subscription_tier?: string
          subscription_status?: string
          moderation_status?: string
          is_published?: boolean
          business_name?: string | null
          tax_id?: string | null
          stripe_account_id?: string | null
          stripe_status?: string | null
          profile_slug?: string | null
          pronouns?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['providers']['Insert']>
      }
      appointments: {
        Row: {
          id: string
          provider_id: string
          client_id: string
          date_time: string
          status: string
          provider_timezone: string | null
          client_timezone: string | null
          created_at: string
        }
        Insert: {
          id: string
          provider_id: string
          client_id: string
          date_time: string
          status?: string
          provider_timezone?: string | null
          client_timezone?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          receiver_id: string
          content: string
          is_read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          receiver_id: string
          content: string
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      conversations: {
        Row: {
          id: string
          participant_1_id: string
          participant_2_id: string
          last_message_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          participant_1_id: string
          participant_2_id: string
          last_message_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          link: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      provider_education: {
        Row: {
          id: string
          provider_id: string
          degree: string
          university: string
          year: string
        }
        Insert: {
          id?: string
          provider_id: string
          degree: string
          university: string
          year: string
        }
        Update: Partial<Database['public']['Tables']['provider_education']['Insert']>
      }
      provider_licenses: {
        Row: {
          id: string
          provider_id: string
          state: string
          number: string
          verified: boolean
        }
        Insert: {
          id?: string
          provider_id: string
          state: string
          number: string
          verified?: boolean
        }
        Update: Partial<Database['public']['Tables']['provider_licenses']['Insert']>
      }
      provider_specialties: {
        Row: {
          id: string
          provider_id: string
          specialty_id: string
        }
        Insert: {
          id?: string
          provider_id: string
          specialty_id: string
        }
        Update: Partial<Database['public']['Tables']['provider_specialties']['Insert']>
      }
      provider_languages: {
        Row: {
          id: string
          provider_id: string
          language: string
        }
        Insert: {
          id?: string
          provider_id: string
          language: string
        }
        Update: Partial<Database['public']['Tables']['provider_languages']['Insert']>
      }
      provider_schedules: {
        Row: {
          id: string
          provider_id: string
          day: string
          active: boolean
          start_time: string | null
          end_time: string | null
        }
        Insert: {
          id?: string
          provider_id: string
          day: string
          active: boolean
          start_time?: string | null
          end_time?: string | null
        }
        Update: Partial<Database['public']['Tables']['provider_schedules']['Insert']>
      }
      provider_blocked_dates: {
        Row: {
          id: string
          provider_id: string
          date: string
        }
        Insert: {
          id?: string
          provider_id: string
          date: string
        }
        Update: Partial<Database['public']['Tables']['provider_blocked_dates']['Insert']>
      }
      specialties: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id: string
          name: string
          slug: string
        }
        Update: Partial<Database['public']['Tables']['specialties']['Insert']>
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action_type: string
          resource_type: string
          resource_id: string | null
          ip_address: string | null
          user_agent: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action_type: string
          resource_type: string
          resource_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>
      }
    }
  }
}
