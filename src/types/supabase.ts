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
          first_name: string | null
          last_name: string | null
          role: string
          created_at: string
          updated_at: string
          is_deleted: boolean
          timezone: string | null
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
          is_deleted?: boolean
          timezone?: string | null
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
          is_deleted?: boolean
          timezone?: string | null
        }
      }
      providers: {
        Row: {
          id: string
          user_id: string
          professional_title: string | null
          professional_category: string | null
          npi: string | null
          years_experience: number | null
          bio: string | null
          tagline: string | null
          image_url: string | null
          hourly_rate: number | null
          sliding_scale: boolean | null
          min_fee: number | null
          max_fee: number | null
          address_street: string | null
          address_city: string | null
          address_state: string | null
          address_zip: string | null
          phone: string | null
          website: string | null
          pronouns: string | null
          is_published: boolean | null
          subscription_tier: string | null
          subscription_status: string | null
          moderation_status: string | null
          onboarding_complete: boolean | null
          profile_slug: string | null
          business_name: string | null
          tax_id: string | null
          stripe_account_id: string | null
          stripe_status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          professional_title?: string | null
          professional_category?: string | null
          npi?: string | null
          years_experience?: number | null
          bio?: string | null
          tagline?: string | null
          image_url?: string | null
          hourly_rate?: number | null
          sliding_scale?: boolean | null
          min_fee?: number | null
          max_fee?: number | null
          address_street?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zip?: string | null
          phone?: string | null
          website?: string | null
          pronouns?: string | null
          is_published?: boolean | null
          subscription_tier?: string | null
          subscription_status?: string | null
          moderation_status?: string | null
          onboarding_complete?: boolean | null
          profile_slug?: string | null
          business_name?: string | null
          tax_id?: string | null
          stripe_account_id?: string | null
          stripe_status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          professional_title?: string | null
          professional_category?: string | null
          npi?: string | null
          years_experience?: number | null
          bio?: string | null
          tagline?: string | null
          image_url?: string | null
          hourly_rate?: number | null
          sliding_scale?: boolean | null
          min_fee?: number | null
          max_fee?: number | null
          address_street?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zip?: string | null
          phone?: string | null
          website?: string | null
          pronouns?: string | null
          is_published?: boolean | null
          subscription_tier?: string | null
          subscription_status?: string | null
          moderation_status?: string | null
          onboarding_complete?: boolean | null
          profile_slug?: string | null
          business_name?: string | null
          tax_id?: string | null
          stripe_account_id?: string | null
          stripe_status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      specialties: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
      }
      ai_audit_logs: {
        Row: {
          id: string
          user_id: string
          request_type: string
          prompt_used: string
          generated_content: string
          is_flagged: boolean
          flags: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          request_type: string
          prompt_used: string
          generated_content: string
          is_flagged: boolean
          flags: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          request_type?: string
          prompt_used?: string
          generated_content?: string
          is_flagged?: boolean
          flags?: string[]
          created_at?: string
        }
      }
      endorsements: {
        Row: {
          id: string
          endorsed_provider_id: string
          endorser_user_id: string
          endorser_role: 'admin' | 'provider'
          endorsement_type: 'evowell' | 'peer'
          reason: string | null
          created_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          endorsed_provider_id: string
          endorser_user_id: string
          endorser_role: 'admin' | 'provider'
          endorsement_type: 'evowell' | 'peer'
          reason?: string | null
          created_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          endorsed_provider_id?: string
          endorser_user_id?: string
          endorser_role?: 'admin' | 'provider'
          endorsement_type?: 'evowell' | 'peer'
          reason?: string | null
          created_at?: string
          deleted_at?: string | null
        }
      }
      provider_wishlists: {
        Row: {
          id: string
          provider_id: string
          client_id: string
          created_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          client_id: string
          created_at?: string
        }
        Update: {
          id?: string
          provider_id?: string
          client_id?: string
          created_at?: string
        }
      }
      resources: {
        Row: {
          id: string
          provider_id: string
          title: string
          short_description: string
          full_description: string
          type: string
          categories: string[]
          languages: string[]
          access_type: string
          price: number | null
          currency: string
          delivery_type: string
          external_url: string | null
          file_url: string | null
          thumbnail_url: string
          preview_images: string[]
          tags: string[]
          status: string
          moderation_status: string
          visibility: string
          created_at: string
          updated_at: string
          downloads: number
          views: number
        }
        Insert: {
          id?: string
          provider_id: string
          title: string
          short_description: string
          full_description: string
          type: string
          categories: string[]
          languages: string[]
          access_type: string
          price?: number | null
          currency: string
          delivery_type: string
          external_url?: string | null
          file_url?: string | null
          thumbnail_url: string
          preview_images?: string[]
          tags?: string[]
          status: string
          moderation_status: string
          visibility: string
          created_at?: string
          updated_at?: string
          downloads?: number
          views?: number
        }
        Update: {
          id?: string
          provider_id?: string
          title?: string
          short_description?: string
          full_description?: string
          type?: string
          categories?: string[]
          languages?: string[]
          access_type?: string
          price?: number | null
          currency?: string
          delivery_type?: string
          external_url?: string | null
          file_url?: string | null
          thumbnail_url?: string
          preview_images?: string[]
          tags?: string[]
          status?: string
          moderation_status?: string
          visibility?: string
          created_at?: string
          updated_at?: string
          downloads?: number
          views?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_providers: {
        Args: {
          search_query: string | null
          filter_specialty: string | null
          filter_state: string | null
          filter_max_price: number | null
          filter_day: string | null
          result_limit: number
          result_offset: number
        }
        Returns: Json[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}