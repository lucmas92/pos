/**
 * Tipi generati automaticamente da Supabase
 * Questi dovrebbero essere generati con: npx supabase gen types typescript
 * Per ora li definiamo manualmente
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'manager' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'manager' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'manager' | 'admin'
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          display_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          category_id: string
          name: string
          description: string | null
          price: number
          quantity_available: number
          is_active: boolean
          is_kit: boolean
          image_url: string | null
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          description?: string | null
          price: number
          quantity_available?: number
          is_active?: boolean
          is_kit?: boolean
          image_url?: string | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          description?: string | null
          price?: number
          quantity_available?: number
          is_active?: boolean
          is_kit?: boolean
          image_url?: string | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          name: string
          price_modifier: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          price_modifier?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          name?: string
          price_modifier?: number
          is_active?: boolean
          created_at?: string
        }
      }
      kit_items: {
        Row: {
          id: string
          kit_product_id: string
          included_product_id: string
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          kit_product_id: string
          included_product_id: string
          quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          kit_product_id?: string
          included_product_id?: string
          quantity?: number
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: number
          guest_name: string | null
          covers: number
          total_amount: number
          status: 'pending' | 'completed' | 'cancelled'
          notes: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          order_number?: never // Generated always as identity
          guest_name?: string | null
          covers: number
          total_amount: number
          status?: 'pending' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          order_number?: never
          guest_name?: string | null
          covers?: number
          total_amount?: number
          status?: 'pending' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          variant_id: string | null
          quantity: number
          unit_price: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          variant_id?: string | null
          quantity: number
          unit_price: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          variant_id?: string | null
          quantity?: number
          unit_price?: number
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'manager' | 'admin'
      order_status: 'pending' | 'completed' | 'cancelled'
    }
  }
}
