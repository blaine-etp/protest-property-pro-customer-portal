export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          id: string
          is_owner_verified: boolean | null
          property_id: string
          signature: string | null
          signup_pid: string | null
          status: string | null
          submitted_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          is_owner_verified?: boolean | null
          property_id: string
          signature?: string | null
          signup_pid?: string | null
          status?: string | null
          submitted_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          is_owner_verified?: boolean | null
          property_id?: string
          signature?: string | null
          signup_pid?: string | null
          status?: string | null
          submitted_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_applications_property"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_applications_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      bills: {
        Row: {
          bill_number: string
          contingency_fee_percent: number | null
          created_at: string
          due_date: string | null
          id: string
          notes: string | null
          owner_id: string
          paid_date: string | null
          status: string
          tax_year: number
          total_assessed_value: number | null
          total_fee_amount: number | null
          total_market_value: number | null
          total_protest_amount: number | null
          updated_at: string
        }
        Insert: {
          bill_number?: string
          contingency_fee_percent?: number | null
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          owner_id: string
          paid_date?: string | null
          status?: string
          tax_year: number
          total_assessed_value?: number | null
          total_fee_amount?: number | null
          total_market_value?: number | null
          total_protest_amount?: number | null
          updated_at?: string
        }
        Update: {
          bill_number?: string
          contingency_fee_percent?: number | null
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          owner_id?: string
          paid_date?: string | null
          status?: string
          tax_year?: number
          total_assessed_value?: number | null
          total_fee_amount?: number | null
          total_market_value?: number | null
          total_protest_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_bills_owner"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_properties: {
        Row: {
          communication_id: string
          created_at: string
          id: string
          property_id: string
        }
        Insert: {
          communication_id: string
          created_at?: string
          id?: string
          property_id: string
        }
        Update: {
          communication_id?: string
          created_at?: string
          id?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_comm_props_communication"
            columns: ["communication_id"]
            isOneToOne: false
            referencedRelation: "communications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_comm_props_property"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      communications: {
        Row: {
          contact_id: string
          created_at: string
          follow_up_date: string | null
          id: string
          inquiry_type: string
          message: string | null
          priority: string
          resolution_notes: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          follow_up_date?: string | null
          id?: string
          inquiry_type?: string
          message?: string | null
          priority?: string
          resolution_notes?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          follow_up_date?: string | null
          id?: string
          inquiry_type?: string
          message?: string | null
          priority?: string
          resolution_notes?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_communications_contact"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          invoice_id: string | null
          referral_relationship_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          invoice_id?: string | null
          referral_relationship_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          invoice_id?: string | null
          referral_relationship_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_referral_relationship_id_fkey"
            columns: ["referral_relationship_id"]
            isOneToOne: false
            referencedRelation: "referral_relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      customer_documents: {
        Row: {
          created_at: string
          document_type: string
          file_path: string
          generated_at: string
          id: string
          property_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_type?: string
          file_path: string
          generated_at?: string
          id?: string
          property_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_type?: string
          file_path?: string
          generated_at?: string
          id?: string
          property_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      document_properties: {
        Row: {
          created_at: string
          document_id: string
          id: string
          property_id: string
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          property_id: string
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_doc_props_document"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "customer_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_doc_props_property"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      owners: {
        Row: {
          contact_info: Json | null
          created_at: string
          created_by_user_id: string | null
          entity_relationship: string | null
          form_entity_name: string | null
          form_entity_type: string | null
          id: string
          mailing_address: string | null
          mailing_address_2: string | null
          mailing_city: string | null
          mailing_state: string | null
          mailing_zip: string | null
          name: string
          notes: string | null
          owner_type: string
          property_id: string | null
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          contact_info?: Json | null
          created_at?: string
          created_by_user_id?: string | null
          entity_relationship?: string | null
          form_entity_name?: string | null
          form_entity_type?: string | null
          id?: string
          mailing_address?: string | null
          mailing_address_2?: string | null
          mailing_city?: string | null
          mailing_state?: string | null
          mailing_zip?: string | null
          name: string
          notes?: string | null
          owner_type?: string
          property_id?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          contact_info?: Json | null
          created_at?: string
          created_by_user_id?: string | null
          entity_relationship?: string | null
          form_entity_name?: string | null
          form_entity_type?: string | null
          id?: string
          mailing_address?: string | null
          mailing_address_2?: string | null
          mailing_city?: string | null
          mailing_state?: string | null
          mailing_zip?: string | null
          name?: string
          notes?: string | null
          owner_type?: string
          property_id?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "owners_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "owners_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          agree_to_updates: boolean | null
          authentication_token: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          is_authenticated: boolean | null
          is_trust_entity: boolean | null
          last_name: string
          lifetime_savings: number | null
          mailing_address: string | null
          mailing_address_2: string | null
          mailing_city: string | null
          mailing_state: string | null
          mailing_zip: string | null
          permissions: string | null
          phone: string | null
          referral_code: string | null
          referral_credit_balance: number | null
          role: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agree_to_updates?: boolean | null
          authentication_token?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          is_authenticated?: boolean | null
          is_trust_entity?: boolean | null
          last_name: string
          lifetime_savings?: number | null
          mailing_address?: string | null
          mailing_address_2?: string | null
          mailing_city?: string | null
          mailing_state?: string | null
          mailing_zip?: string | null
          permissions?: string | null
          phone?: string | null
          referral_code?: string | null
          referral_credit_balance?: number | null
          role?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agree_to_updates?: boolean | null
          authentication_token?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          is_authenticated?: boolean | null
          is_trust_entity?: boolean | null
          last_name?: string
          lifetime_savings?: number | null
          mailing_address?: string | null
          mailing_address_2?: string | null
          mailing_city?: string | null
          mailing_state?: string | null
          mailing_zip?: string | null
          permissions?: string | null
          phone?: string | null
          referral_code?: string | null
          referral_credit_balance?: number | null
          role?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          county_pid: string | null
          created_at: string
          estimated_savings: number | null
          etp_pid: string | null
          id: string
          include_all_properties: boolean | null
          owner_id: string | null
          parcel_number: string | null
          secondary_contact_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          county_pid?: string | null
          created_at?: string
          estimated_savings?: number | null
          etp_pid?: string | null
          id?: string
          include_all_properties?: boolean | null
          owner_id?: string | null
          parcel_number?: string | null
          secondary_contact_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          county_pid?: string | null
          created_at?: string
          estimated_savings?: number | null
          etp_pid?: string | null
          id?: string
          include_all_properties?: boolean | null
          owner_id?: string | null
          parcel_number?: string | null
          secondary_contact_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_properties_contact"
            columns: ["secondary_contact_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_properties_owner"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_properties_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      protests: {
        Row: {
          appeal_status: string | null
          assessed_value: number | null
          auto_appeal_enabled: boolean | null
          bill_id: string | null
          contingency_fee_percent: number | null
          created_at: string
          exemption_status: string | null
          hearing_date: string | null
          id: string
          market_value: number | null
          property_id: string
          protest_amount: number | null
          protest_date: string | null
          resolution_date: string | null
          savings_amount: number | null
          tax_year: number | null
          updated_at: string
        }
        Insert: {
          appeal_status?: string | null
          assessed_value?: number | null
          auto_appeal_enabled?: boolean | null
          bill_id?: string | null
          contingency_fee_percent?: number | null
          created_at?: string
          exemption_status?: string | null
          hearing_date?: string | null
          id?: string
          market_value?: number | null
          property_id: string
          protest_amount?: number | null
          protest_date?: string | null
          resolution_date?: string | null
          savings_amount?: number | null
          tax_year?: number | null
          updated_at?: string
        }
        Update: {
          appeal_status?: string | null
          assessed_value?: number | null
          auto_appeal_enabled?: boolean | null
          bill_id?: string | null
          contingency_fee_percent?: number | null
          created_at?: string
          exemption_status?: string | null
          hearing_date?: string | null
          id?: string
          market_value?: number | null
          property_id?: string
          protest_amount?: number | null
          protest_date?: string | null
          resolution_date?: string | null
          savings_amount?: number | null
          tax_year?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_appeal_status_property"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_protests_bill"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_relationships: {
        Row: {
          completion_date: string | null
          created_at: string
          credit_awarded_amount: number | null
          id: string
          referee_email: string
          referee_first_name: string | null
          referee_id: string
          referee_last_name: string | null
          referral_code: string
          referrer_id: string
          signup_date: string
          status: string
          updated_at: string
        }
        Insert: {
          completion_date?: string | null
          created_at?: string
          credit_awarded_amount?: number | null
          id?: string
          referee_email: string
          referee_first_name?: string | null
          referee_id: string
          referee_last_name?: string | null
          referral_code: string
          referrer_id: string
          signup_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          completion_date?: string | null
          created_at?: string
          credit_awarded_amount?: number | null
          id?: string
          referee_email?: string
          referee_first_name?: string | null
          referee_id?: string
          referee_last_name?: string | null
          referral_code?: string
          referrer_id?: string
          signup_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_relationships_referee_id_fkey"
            columns: ["referee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referral_relationships_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      verification_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          used: boolean
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string
          id?: string
          used?: boolean
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          used?: boolean
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_create_profile: {
        Args: { profile_user_id: string; profile_email: string }
        Returns: boolean
      }
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
