export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      order_items: {
        Row: {
          color: string | null
          created_at: string
          id: string
          order_id: string
          placement: string | null
          print_type: string | null
          product_id: string | null
          product_name: string
          quantity: number
          size: string | null
          unit_price: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          order_id: string
          placement?: string | null
          print_type?: string | null
          product_id?: string | null
          product_name: string
          quantity?: number
          size?: string | null
          unit_price?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          order_id?: string
          placement?: string | null
          print_type?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          size?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_timeline: {
        Row: {
          id: string
          order_id: string
          status: string
          timestamp: string
        }
        Insert: {
          id?: string
          order_id: string
          status: string
          timestamp?: string
        }
        Update: {
          id?: string
          order_id?: string
          status?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_timeline_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          file_url: string | null
          id: string
          notes: string | null
          status: string
          total_price: number
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          status?: string
          total_price?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          status?: string
          total_price?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments: number | null
          content: string
          created_at: string
          id: string
          likes: number | null
          media: string[] | null
          pod_design_preview: string | null
          pod_print_type: string | null
          pod_product_id: string | null
          reposts: number | null
          user_avatar: string | null
          user_id: string | null
          username: string
        }
        Insert: {
          comments?: number | null
          content: string
          created_at?: string
          id?: string
          likes?: number | null
          media?: string[] | null
          pod_design_preview?: string | null
          pod_print_type?: string | null
          pod_product_id?: string | null
          reposts?: number | null
          user_avatar?: string | null
          user_id?: string | null
          username?: string
        }
        Update: {
          comments?: number | null
          content?: string
          created_at?: string
          id?: string
          likes?: number | null
          media?: string[] | null
          pod_design_preview?: string | null
          pod_print_type?: string | null
          pod_product_id?: string | null
          reposts?: number | null
          user_avatar?: string | null
          user_id?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_pod_product_id_fkey"
            columns: ["pod_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          base_price: number
          category: string
          colors: string[] | null
          created_at: string
          id: string
          image: string | null
          name: string
          sizes: string[] | null
          supported_print_types: string[] | null
          turnaround: string | null
        }
        Insert: {
          active?: boolean | null
          base_price: number
          category: string
          colors?: string[] | null
          created_at?: string
          id?: string
          image?: string | null
          name: string
          sizes?: string[] | null
          supported_print_types?: string[] | null
          turnaround?: string | null
        }
        Update: {
          active?: boolean | null
          base_price?: number
          category?: string
          colors?: string[] | null
          created_at?: string
          id?: string
          image?: string | null
          name?: string
          sizes?: string[] | null
          supported_print_types?: string[] | null
          turnaround?: string | null
        }
        Relationships: []
      }
      vendor_pricing: {
        Row: {
          created_at: string
          id: string
          price_1_to_10: number | null
          price_11_to_50: number | null
          price_51_to_200: number | null
          print_type: string
          product_type: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          price_1_to_10?: number | null
          price_11_to_50?: number | null
          price_51_to_200?: number | null
          print_type: string
          product_type: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          price_1_to_10?: number | null
          price_11_to_50?: number | null
          price_51_to_200?: number | null
          print_type?: string
          product_type?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_pricing_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          capabilities: string[] | null
          categories: string[] | null
          city: string | null
          created_at: string
          email: string
          id: string
          name: string
          onboarding_complete: boolean | null
          rush_fee: number | null
          turnaround_days: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          capabilities?: string[] | null
          categories?: string[] | null
          city?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          onboarding_complete?: boolean | null
          rush_fee?: number | null
          turnaround_days?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          capabilities?: string[] | null
          categories?: string[] | null
          city?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          onboarding_complete?: boolean | null
          rush_fee?: number | null
          turnaround_days?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
