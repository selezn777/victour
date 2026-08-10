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
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      booking_items: {
        Row: {
          adults: number
          booking_id: string
          children: number
          date: string
          date_end: string | null
          guide_id: string | null
          id: string
          price_snapshot_usd: number
          tour_id: string
        }
        Insert: {
          adults: number
          booking_id: string
          children?: number
          date: string
          date_end?: string | null
          guide_id?: string | null
          id?: string
          price_snapshot_usd: number
          tour_id: string
        }
        Update: {
          adults?: number
          booking_id?: string
          children?: number
          date?: string
          date_end?: string | null
          guide_id?: string | null
          id?: string
          price_snapshot_usd?: number
          tour_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_items_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_items_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_items_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          admin_notified_at: string | null
          adults_total: number
          children_total: number
          contact_channel: string
          contact_value: string
          created_at: string
          currency: string
          discount_pct: number
          exchange_rate_snapshot: Json | null
          guest_name: string
          hotel: string
          id: string
          notes: string | null
          prepayment_usd: number
          status: string
          subtotal_usd: number
          surcharge_usd: number
          total_usd: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notified_at?: string | null
          adults_total?: number
          children_total?: number
          contact_channel: string
          contact_value: string
          created_at?: string
          currency?: string
          discount_pct?: number
          exchange_rate_snapshot?: Json | null
          guest_name: string
          hotel: string
          id?: string
          notes?: string | null
          prepayment_usd?: number
          status?: string
          subtotal_usd?: number
          surcharge_usd?: number
          total_usd?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notified_at?: string | null
          adults_total?: number
          children_total?: number
          contact_channel?: string
          contact_value?: string
          created_at?: string
          currency?: string
          discount_pct?: number
          exchange_rate_snapshot?: Json | null
          guest_name?: string
          hotel?: string
          id?: string
          notes?: string | null
          prepayment_usd?: number
          status?: string
          subtotal_usd?: number
          surcharge_usd?: number
          total_usd?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      guide_availability: {
        Row: {
          date: string
          guide_id: string
          id: string
          note: string | null
          status: string
        }
        Insert: {
          date: string
          guide_id: string
          id?: string
          note?: string | null
          status: string
        }
        Update: {
          date?: string
          guide_id?: string
          id?: string
          note?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "guide_availability_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
        ]
      }
      guides: {
        Row: {
          bio: Json | null
          created_at: string
          id: string
          instagram: string | null
          is_active: boolean
          name: string
          phone: string | null
          sort_order: number
          telegram: string | null
          whatsapp: string | null
        }
        Insert: {
          bio?: Json | null
          created_at?: string
          id?: string
          instagram?: string | null
          is_active?: boolean
          name: string
          phone?: string | null
          sort_order?: number
          telegram?: string | null
          whatsapp?: string | null
        }
        Update: {
          bio?: Json | null
          created_at?: string
          id?: string
          instagram?: string | null
          is_active?: boolean
          name?: string
          phone?: string | null
          sort_order?: number
          telegram?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      pricing_tiers: {
        Row: {
          guest_count: number
          id: string
          price_adult_usd: number
          price_child_usd: number | null
          tour_id: string
        }
        Insert: {
          guest_count: number
          id?: string
          price_adult_usd: number
          price_child_usd?: number | null
          tour_id: string
        }
        Update: {
          guest_count?: number
          id?: string
          price_adult_usd?: number
          price_child_usd?: number | null
          tour_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_tiers_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      surcharges: {
        Row: {
          amount_vnd: number
          code: string
          is_active: boolean
          name: Json
          unit: string
        }
        Insert: {
          amount_vnd: number
          code: string
          is_active?: boolean
          name: Json
          unit?: string
        }
        Update: {
          amount_vnd?: number
          code?: string
          is_active?: boolean
          name?: Json
          unit?: string
        }
        Relationships: []
      }
      tours: {
        Row: {
          created_at: string
          duration_days: number
          duration_label: Json
          excludes: Json
          hero_image_url: string | null
          id: string
          includes: Json
          is_dalat_two_day: boolean
          itinerary: Json
          short_description: Json
          slug: string
          sort_order: number
          ticket_options: Json
          title: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_days?: number
          duration_label: Json
          excludes?: Json
          hero_image_url?: string | null
          id?: string
          includes?: Json
          is_dalat_two_day?: boolean
          itinerary?: Json
          short_description: Json
          slug: string
          sort_order?: number
          ticket_options?: Json
          title: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_days?: number
          duration_label?: Json
          excludes?: Json
          hero_image_url?: string | null
          id?: string
          includes?: Json
          is_dalat_two_day?: boolean
          itinerary?: Json
          short_description?: Json
          slug?: string
          sort_order?: number
          ticket_options?: Json
          title?: Json
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_set_booking_status: {
        Args: { p_booking_id: string; p_status: string }
        Returns: undefined
      }
      create_booking: {
        Args: { p_booking: Json; p_items: Json }
        Returns: string
      }
      is_admin: { Args: never; Returns: boolean }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
