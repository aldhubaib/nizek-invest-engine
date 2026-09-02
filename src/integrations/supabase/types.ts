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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      allocation_requests: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          full_name: string
          fund_id: string
          id: string
          investor_id: string | null
          message: string | null
          ownership_percent: number
          phone: string
          positions: Database["public"]["Enums"]["position_code"][]
          quarterly_capital_call: number
          session_id: string | null
          status: Database["public"]["Enums"]["allocation_status"]
          submitted_at: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          fund_id: string
          id?: string
          investor_id?: string | null
          message?: string | null
          ownership_percent?: number
          phone: string
          positions?: Database["public"]["Enums"]["position_code"][]
          quarterly_capital_call?: number
          session_id?: string | null
          status?: Database["public"]["Enums"]["allocation_status"]
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          fund_id?: string
          id?: string
          investor_id?: string | null
          message?: string | null
          ownership_percent?: number
          phone?: string
          positions?: Database["public"]["Enums"]["position_code"][]
          quarterly_capital_call?: number
          session_id?: string | null
          status?: Database["public"]["Enums"]["allocation_status"]
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "allocation_requests_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allocation_requests_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allocation_requests_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "investor_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      fund_positions: {
        Row: {
          committed_at: string | null
          committed_investor_id: string | null
          created_at: string
          display_name: string
          fund_id: string
          id: string
          ownership_percent: number
          position_code: Database["public"]["Enums"]["position_code"]
          reserved_at: string | null
          status: Database["public"]["Enums"]["position_status"]
          updated_at: string
        }
        Insert: {
          committed_at?: string | null
          committed_investor_id?: string | null
          created_at?: string
          display_name: string
          fund_id: string
          id?: string
          ownership_percent?: number
          position_code: Database["public"]["Enums"]["position_code"]
          reserved_at?: string | null
          status?: Database["public"]["Enums"]["position_status"]
          updated_at?: string
        }
        Update: {
          committed_at?: string | null
          committed_investor_id?: string | null
          created_at?: string
          display_name?: string
          fund_id?: string
          id?: string
          ownership_percent?: number
          position_code?: Database["public"]["Enums"]["position_code"]
          reserved_at?: string | null
          status?: Database["public"]["Enums"]["position_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fund_positions_committed_investor_id_fkey"
            columns: ["committed_investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fund_positions_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
        ]
      }
      funds: {
        Row: {
          code: string
          created_at: string
          id: string
          jurisdiction: string
          name: string
          status: Database["public"]["Enums"]["fund_status"]
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          jurisdiction?: string
          name: string
          status?: Database["public"]["Enums"]["fund_status"]
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          jurisdiction?: string
          name?: string
          status?: Database["public"]["Enums"]["fund_status"]
          updated_at?: string
        }
        Relationships: []
      }
      investor_events: {
        Row: {
          event_type: Database["public"]["Enums"]["investor_event_type"]
          id: string
          investor_id: string
          occurred_at: string
          payload: Json
          session_id: string | null
        }
        Insert: {
          event_type: Database["public"]["Enums"]["investor_event_type"]
          id?: string
          investor_id: string
          occurred_at?: string
          payload?: Json
          session_id?: string | null
        }
        Update: {
          event_type?: Database["public"]["Enums"]["investor_event_type"]
          id?: string
          investor_id?: string
          occurred_at?: string
          payload?: Json
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investor_events_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "investor_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_section_views: {
        Row: {
          active_seconds: number
          first_viewed_at: string
          id: string
          investor_id: string
          max_visible_percent: number
          section_id: Database["public"]["Enums"]["section_key"]
          session_id: string
          updated_at: string
          view_count: number
        }
        Insert: {
          active_seconds?: number
          first_viewed_at?: string
          id?: string
          investor_id: string
          max_visible_percent?: number
          section_id: Database["public"]["Enums"]["section_key"]
          session_id: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          active_seconds?: number
          first_viewed_at?: string
          id?: string
          investor_id?: string
          max_visible_percent?: number
          section_id?: Database["public"]["Enums"]["section_key"]
          session_id?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "investor_section_views_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_section_views_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "investor_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_sessions: {
        Row: {
          active_seconds: number
          created_at: string
          device_type: Database["public"]["Enums"]["device_type"]
          ended_at: string | null
          id: string
          investor_id: string
          last_seen_at: string
          started_at: string
        }
        Insert: {
          active_seconds?: number
          created_at?: string
          device_type?: Database["public"]["Enums"]["device_type"]
          ended_at?: string | null
          id?: string
          investor_id: string
          last_seen_at?: string
          started_at?: string
        }
        Update: {
          active_seconds?: number
          created_at?: string
          device_type?: Database["public"]["Enums"]["device_type"]
          ended_at?: string | null
          id?: string
          investor_id?: string
          last_seen_at?: string
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investor_sessions_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
        ]
      }
      investors: {
        Row: {
          access_token_hash: string
          allocation_requested: boolean
          allocation_status: Database["public"]["Enums"]["allocation_status"]
          company: string | null
          confidentiality_acknowledged: boolean
          confidentiality_acknowledged_at: string | null
          created_at: string
          email: string | null
          engagement_status: Database["public"]["Enums"]["engagement_status"]
          first_viewed_at: string | null
          full_name: string
          id: string
          internal_notes: string
          last_viewed_at: string | null
          phone: string | null
          simulator_used: boolean
          token_issued_at: string
          token_revoked_at: string | null
          total_active_seconds: number
          total_visits: number
          updated_at: string
        }
        Insert: {
          access_token_hash: string
          allocation_requested?: boolean
          allocation_status?: Database["public"]["Enums"]["allocation_status"]
          company?: string | null
          confidentiality_acknowledged?: boolean
          confidentiality_acknowledged_at?: string | null
          created_at?: string
          email?: string | null
          engagement_status?: Database["public"]["Enums"]["engagement_status"]
          first_viewed_at?: string | null
          full_name: string
          id?: string
          internal_notes?: string
          last_viewed_at?: string | null
          phone?: string | null
          simulator_used?: boolean
          token_issued_at?: string
          token_revoked_at?: string | null
          total_active_seconds?: number
          total_visits?: number
          updated_at?: string
        }
        Update: {
          access_token_hash?: string
          allocation_requested?: boolean
          allocation_status?: Database["public"]["Enums"]["allocation_status"]
          company?: string | null
          confidentiality_acknowledged?: boolean
          confidentiality_acknowledged_at?: string | null
          created_at?: string
          email?: string | null
          engagement_status?: Database["public"]["Enums"]["engagement_status"]
          first_viewed_at?: string | null
          full_name?: string
          id?: string
          internal_notes?: string
          last_viewed_at?: string | null
          phone?: string | null
          simulator_used?: boolean
          token_issued_at?: string
          token_revoked_at?: string | null
          total_active_seconds?: number
          total_visits?: number
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_companies: {
        Row: {
          country: string
          created_at: string
          fund_id: string
          id: string
          industry: string
          name: string
          status: Database["public"]["Enums"]["company_status"]
          updated_at: string
        }
        Insert: {
          country?: string
          created_at?: string
          fund_id: string
          id?: string
          industry?: string
          name: string
          status?: Database["public"]["Enums"]["company_status"]
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          fund_id?: string
          id?: string
          industry?: string
          name?: string
          status?: Database["public"]["Enums"]["company_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_companies_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
        ]
      }
      quarterly_reports: {
        Row: {
          cash_balance: number | null
          created_at: string
          document_url: string | null
          expenses: number | null
          id: string
          net_profit_loss: number | null
          period_end: string | null
          period_start: string | null
          portfolio_company_id: string
          report_quarter: number
          report_year: number
          revenue: number | null
          runway_months: number | null
          status: Database["public"]["Enums"]["report_status"]
          submitted_at: string | null
          summary: string
          updated_at: string
        }
        Insert: {
          cash_balance?: number | null
          created_at?: string
          document_url?: string | null
          expenses?: number | null
          id?: string
          net_profit_loss?: number | null
          period_end?: string | null
          period_start?: string | null
          portfolio_company_id: string
          report_quarter: number
          report_year: number
          revenue?: number | null
          runway_months?: number | null
          status?: Database["public"]["Enums"]["report_status"]
          submitted_at?: string | null
          summary?: string
          updated_at?: string
        }
        Update: {
          cash_balance?: number | null
          created_at?: string
          document_url?: string | null
          expenses?: number | null
          id?: string
          net_profit_loss?: number | null
          period_end?: string | null
          period_start?: string | null
          portfolio_company_id?: string
          report_quarter?: number
          report_year?: number
          revenue?: number | null
          runway_months?: number | null
          status?: Database["public"]["Enums"]["report_status"]
          submitted_at?: string | null
          summary?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quarterly_reports_portfolio_company_id_fkey"
            columns: ["portfolio_company_id"]
            isOneToOne: false
            referencedRelation: "portfolio_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      allocation_status:
        | "none"
        | "requested"
        | "under_review"
        | "approved"
        | "committed"
        | "declined"
      app_role: "admin" | "staff"
      company_status: "building" | "active" | "graduated" | "exited" | "closed"
      device_type: "mobile" | "tablet" | "desktop"
      engagement_status:
        | "invited"
        | "opened"
        | "reviewing"
        | "interested"
        | "inactive"
      fund_status: "structuring" | "open" | "closed"
      investor_event_type:
        | "session_start"
        | "session_end"
        | "section_milestone"
        | "positions_selected"
        | "simulator_opened"
        | "assumption_changed"
        | "simulator_snapshot"
        | "allocation_requested"
        | "confidentiality_acknowledged"
      position_code: "A" | "B" | "C" | "D" | "E" | "F"
      position_status: "available" | "reserved" | "committed"
      report_status: "draft" | "submitted" | "published"
      section_key:
        | "hero"
        | "why_nizek"
        | "founder_pipeline"
        | "venture_model"
        | "regional_sourcing"
        | "equity_model"
        | "fund_structure"
        | "advantages"
        | "investment"
        | "simulator"
        | "team"
        | "request_allocation"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      allocation_status: [
        "none",
        "requested",
        "under_review",
        "approved",
        "committed",
        "declined",
      ],
      app_role: ["admin", "staff"],
      company_status: ["building", "active", "graduated", "exited", "closed"],
      device_type: ["mobile", "tablet", "desktop"],
      engagement_status: [
        "invited",
        "opened",
        "reviewing",
        "interested",
        "inactive",
      ],
      fund_status: ["structuring", "open", "closed"],
      investor_event_type: [
        "session_start",
        "session_end",
        "section_milestone",
        "positions_selected",
        "simulator_opened",
        "assumption_changed",
        "simulator_snapshot",
        "allocation_requested",
        "confidentiality_acknowledged",
      ],
      position_code: ["A", "B", "C", "D", "E", "F"],
      position_status: ["available", "reserved", "committed"],
      report_status: ["draft", "submitted", "published"],
      section_key: [
        "hero",
        "why_nizek",
        "founder_pipeline",
        "venture_model",
        "regional_sourcing",
        "equity_model",
        "fund_structure",
        "advantages",
        "investment",
        "simulator",
        "team",
        "request_allocation",
      ],
    },
  },
} as const
