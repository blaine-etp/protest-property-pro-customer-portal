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
            foreignKeyName: "fk_applications_property_id"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_applications_user_id"
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
          contact_id: string | null
          contingency_fee_percent: number | null
          created_at: string
          due_date: string | null
          id: string
          notes: string | null
          paid_date: string | null
          protest_id: string | null
          status: string
          tax_year: number
          total_assessed_value: number | null
          total_fee_amount: number | null
          total_market_value: number | null
          total_protest_amount: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bill_number?: string
          contact_id?: string | null
          contingency_fee_percent?: number | null
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_date?: string | null
          protest_id?: string | null
          status?: string
          tax_year: number
          total_assessed_value?: number | null
          total_fee_amount?: number | null
          total_market_value?: number | null
          total_protest_amount?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bill_number?: string
          contact_id?: string | null
          contingency_fee_percent?: number | null
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_date?: string | null
          protest_id?: string | null
          status?: string
          tax_year?: number
          total_assessed_value?: number | null
          total_fee_amount?: number | null
          total_market_value?: number | null
          total_protest_amount?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_bills_contact_id"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bills_protest_id"
            columns: ["protest_id"]
            isOneToOne: false
            referencedRelation: "protests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bills_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      blog_post_tags: {
        Row: {
          created_at: string
          id: string
          post_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_blog_post_tags_post_id"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_blog_post_tags_tag_id"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category: string
          content: string
          created_at: string
          excerpt: string | null
          featured: boolean
          id: string
          post_type: string
          published_at: string | null
          read_time_minutes: number | null
          status: string
          thumbnail_image_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          id?: string
          post_type?: string
          published_at?: string | null
          read_time_minutes?: number | null
          status?: string
          thumbnail_image_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          id?: string
          post_type?: string
          published_at?: string | null
          read_time_minutes?: number | null
          status?: string
          thumbnail_image_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_blog_posts_author_id"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
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
            foreignKeyName: "fk_communication_properties_communication_id"
            columns: ["communication_id"]
            isOneToOne: false
            referencedRelation: "communications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_communication_properties_property_id"
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
            foreignKeyName: "fk_communications_contact_id"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          company: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          mailing_address: string | null
          mailing_address_2: string | null
          mailing_city: string | null
          mailing_state: string | null
          mailing_zip: string | null
          notes: string | null
          phone: string | null
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          mailing_address?: string | null
          mailing_address_2?: string | null
          mailing_city?: string | null
          mailing_state?: string | null
          mailing_zip?: string | null
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          mailing_address?: string | null
          mailing_address_2?: string | null
          mailing_city?: string | null
          mailing_state?: string | null
          mailing_zip?: string | null
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      counties: {
        Row: {
          appraisal_district_address: string | null
          appraisal_district_city: string | null
          appraisal_district_name: string | null
          appraisal_district_phone: string | null
          appraisal_district_website: string | null
          appraisal_district_zip: string | null
          canonical_url: string | null
          county_code: string | null
          county_info_content: string | null
          courthouse_image_alt: string | null
          courthouse_image_url: string | null
          created_at: string
          current_tax_year: number | null
          featured: boolean
          hearing_period_end: string | null
          hearing_period_start: string | null
          hero_image_alt: string | null
          hero_image_url: string | null
          how_to_content: string | null
          id: string
          landscape_image_alt: string | null
          landscape_image_url: string | null
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          name: string
          og_description: string | null
          og_image: string | null
          og_title: string | null
          page_content: string | null
          page_title: string | null
          protest_deadline: string | null
          slug: string
          state: string
          status: string
          structured_data: Json | null
          twitter_description: string | null
          twitter_image: string | null
          twitter_title: string | null
          updated_at: string
        }
        Insert: {
          appraisal_district_address?: string | null
          appraisal_district_city?: string | null
          appraisal_district_name?: string | null
          appraisal_district_phone?: string | null
          appraisal_district_website?: string | null
          appraisal_district_zip?: string | null
          canonical_url?: string | null
          county_code?: string | null
          county_info_content?: string | null
          courthouse_image_alt?: string | null
          courthouse_image_url?: string | null
          created_at?: string
          current_tax_year?: number | null
          featured?: boolean
          hearing_period_end?: string | null
          hearing_period_start?: string | null
          hero_image_alt?: string | null
          hero_image_url?: string | null
          how_to_content?: string | null
          id?: string
          landscape_image_alt?: string | null
          landscape_image_url?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          name: string
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page_content?: string | null
          page_title?: string | null
          protest_deadline?: string | null
          slug: string
          state?: string
          status?: string
          structured_data?: Json | null
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Update: {
          appraisal_district_address?: string | null
          appraisal_district_city?: string | null
          appraisal_district_name?: string | null
          appraisal_district_phone?: string | null
          appraisal_district_website?: string | null
          appraisal_district_zip?: string | null
          canonical_url?: string | null
          county_code?: string | null
          county_info_content?: string | null
          courthouse_image_alt?: string | null
          courthouse_image_url?: string | null
          created_at?: string
          current_tax_year?: number | null
          featured?: boolean
          hearing_period_end?: string | null
          hearing_period_start?: string | null
          hero_image_alt?: string | null
          hero_image_url?: string | null
          how_to_content?: string | null
          id?: string
          landscape_image_alt?: string | null
          landscape_image_url?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          name?: string
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page_content?: string | null
          page_title?: string | null
          protest_deadline?: string | null
          slug?: string
          state?: string
          status?: string
          structured_data?: Json | null
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      county_pages: {
        Row: {
          content: string | null
          county_id: string
          created_at: string
          featured: boolean
          id: string
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          page_type: string
          slug: string
          sort_order: number | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          county_id: string
          created_at?: string
          featured?: boolean
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          page_type: string
          slug: string
          sort_order?: number | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          county_id?: string
          created_at?: string
          featured?: boolean
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          page_type?: string
          slug?: string
          sort_order?: number | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_county_pages_county_id"
            columns: ["county_id"]
            isOneToOne: false
            referencedRelation: "counties"
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
            foreignKeyName: "fk_credit_transactions_referral_relationship_id"
            columns: ["referral_relationship_id"]
            isOneToOne: false
            referencedRelation: "referral_relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_credit_transactions_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      customer_documents: {
        Row: {
          contact_id: string | null
          created_at: string
          document_type: string
          file_path: string
          generated_at: string
          generation_date: string | null
          id: string
          owner_id: string | null
          property_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          document_type?: string
          file_path: string
          generated_at?: string
          generation_date?: string | null
          id?: string
          owner_id?: string | null
          property_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          document_type?: string
          file_path?: string
          generated_at?: string
          generation_date?: string | null
          id?: string
          owner_id?: string | null
          property_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_customer_documents_contact"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_customer_documents_owner"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_customer_documents_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      evidence_uploads: {
        Row: {
          category: string | null
          contact_id: string | null
          content_type: string
          created_at: string
          description: string | null
          file_path: string
          file_size: number
          id: string
          original_filename: string
          property_id: string
          protest_id: string | null
          tax_year: number
          updated_at: string
          uploaded_at: string
        }
        Insert: {
          category?: string | null
          contact_id?: string | null
          content_type: string
          created_at?: string
          description?: string | null
          file_path: string
          file_size: number
          id?: string
          original_filename: string
          property_id: string
          protest_id?: string | null
          tax_year?: number
          updated_at?: string
          uploaded_at?: string
        }
        Update: {
          category?: string | null
          contact_id?: string | null
          content_type?: string
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number
          id?: string
          original_filename?: string
          property_id?: string
          protest_id?: string | null
          tax_year?: number
          updated_at?: string
          uploaded_at?: string
        }
        Relationships: []
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
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_owners_created_by_user_id"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      pending_signups: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          county: string | null
          created_at: string
          email: string
          first_name: string | null
          form_data: Json | null
          formatted_address: string | null
          id: string
          last_name: string | null
          phone: string | null
          place_id: string | null
          postal_code: string | null
          signup_pid: string | null
          state: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          county?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          form_data?: Json | null
          formatted_address?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          place_id?: string | null
          postal_code?: string | null
          signup_pid?: string | null
          state?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          county?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          form_data?: Json | null
          formatted_address?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          place_id?: string | null
          postal_code?: string | null
          signup_pid?: string | null
          state?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          agree_to_updates: boolean | null
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
          updated_at: string
          user_id: string
        }
        Insert: {
          agree_to_updates?: boolean | null
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
          updated_at?: string
          user_id: string
        }
        Update: {
          agree_to_updates?: boolean | null
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
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          agent_status_source: string
          agent_status_tax_year: number | null
          agent_status_updated_at: string | null
          assessed_value: number | null
          auto_appeal_enabled: boolean
          contact_id: string | null
          county: string | null
          county_pid: string | null
          created_at: string
          estimated_savings: number | null
          etp_pid: string | null
          formatted_address: string | null
          google_address_components: Json | null
          id: string
          include_all_properties: boolean | null
          is_active_agent: boolean | null
          latitude: number | null
          longitude: number | null
          owner_id: string | null
          parcel_number: string | null
          place_id: string | null
          secondary_contact_id: string | null
          situs_address: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_status_source?: string
          agent_status_tax_year?: number | null
          agent_status_updated_at?: string | null
          assessed_value?: number | null
          auto_appeal_enabled?: boolean
          contact_id?: string | null
          county?: string | null
          county_pid?: string | null
          created_at?: string
          estimated_savings?: number | null
          etp_pid?: string | null
          formatted_address?: string | null
          google_address_components?: Json | null
          id?: string
          include_all_properties?: boolean | null
          is_active_agent?: boolean | null
          latitude?: number | null
          longitude?: number | null
          owner_id?: string | null
          parcel_number?: string | null
          place_id?: string | null
          secondary_contact_id?: string | null
          situs_address: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_status_source?: string
          agent_status_tax_year?: number | null
          agent_status_updated_at?: string | null
          assessed_value?: number | null
          auto_appeal_enabled?: boolean
          contact_id?: string | null
          county?: string | null
          county_pid?: string | null
          created_at?: string
          estimated_savings?: number | null
          etp_pid?: string | null
          formatted_address?: string | null
          google_address_components?: Json | null
          id?: string
          include_all_properties?: boolean | null
          is_active_agent?: boolean | null
          latitude?: number | null
          longitude?: number | null
          owner_id?: string | null
          parcel_number?: string | null
          place_id?: string | null
          secondary_contact_id?: string | null
          situs_address?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_properties_contact_id"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_properties_owner_id"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_properties_secondary_contact_id"
            columns: ["secondary_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_properties_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      property_agent_status_events: {
        Row: {
          changed_by_user_id: string | null
          created_at: string
          external_payload: Json | null
          external_reference: string | null
          id: string
          new_agent_status_source: string
          new_is_active_agent: boolean | null
          notes: string | null
          previous_agent_status_source: string | null
          previous_is_active_agent: boolean | null
          property_id: string
          tax_year: number
        }
        Insert: {
          changed_by_user_id?: string | null
          created_at?: string
          external_payload?: Json | null
          external_reference?: string | null
          id?: string
          new_agent_status_source: string
          new_is_active_agent?: boolean | null
          notes?: string | null
          previous_agent_status_source?: string | null
          previous_is_active_agent?: boolean | null
          property_id: string
          tax_year?: number
        }
        Update: {
          changed_by_user_id?: string | null
          created_at?: string
          external_payload?: Json | null
          external_reference?: string | null
          id?: string
          new_agent_status_source?: string
          new_is_active_agent?: boolean | null
          notes?: string | null
          previous_agent_status_source?: string | null
          previous_is_active_agent?: boolean | null
          property_id?: string
          tax_year?: number
        }
        Relationships: []
      }
      protests: {
        Row: {
          appeal_status: string | null
          assessed_value: number | null
          county: string | null
          county_confirmation_date: string | null
          created_at: string | null
          document_id: string | null
          documents_generated: boolean | null
          evidence_packet_url: string | null
          exemption_status: string | null
          hearing_date: string | null
          id: string
          market_value: number | null
          offer_amount: number | null
          offer_received_date: string | null
          owner_name: string | null
          property_id: string | null
          protest_amount: number | null
          protest_date: string | null
          recommendation: string | null
          savings_amount: number | null
          situs_address: string | null
          tax_year: number | null
          updated_at: string | null
        }
        Insert: {
          appeal_status?: string | null
          assessed_value?: number | null
          county?: string | null
          county_confirmation_date?: string | null
          created_at?: string | null
          document_id?: string | null
          documents_generated?: boolean | null
          evidence_packet_url?: string | null
          exemption_status?: string | null
          hearing_date?: string | null
          id?: string
          market_value?: number | null
          offer_amount?: number | null
          offer_received_date?: string | null
          owner_name?: string | null
          property_id?: string | null
          protest_amount?: number | null
          protest_date?: string | null
          recommendation?: string | null
          savings_amount?: number | null
          situs_address?: string | null
          tax_year?: number | null
          updated_at?: string | null
        }
        Update: {
          appeal_status?: string | null
          assessed_value?: number | null
          county?: string | null
          county_confirmation_date?: string | null
          created_at?: string | null
          document_id?: string | null
          documents_generated?: boolean | null
          evidence_packet_url?: string | null
          exemption_status?: string | null
          hearing_date?: string | null
          id?: string
          market_value?: number | null
          offer_amount?: number | null
          offer_received_date?: string | null
          owner_name?: string | null
          property_id?: string | null
          protest_amount?: number | null
          protest_date?: string | null
          recommendation?: string | null
          savings_amount?: number | null
          situs_address?: string | null
          tax_year?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_protests_document"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "customer_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_protests_document"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_protests_property_id"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
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
            foreignKeyName: "fk_referral_relationships_referee_id"
            columns: ["referee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_referral_relationships_referrer_id"
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
        Relationships: [
          {
            foreignKeyName: "fk_verification_codes_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      document_reports: {
        Row: {
          county: string | null
          document_type: string | null
          file_path: string | null
          generated_at: string | null
          generation_date: string | null
          id: string | null
          property_id: string | null
          situs_address: string | null
          status: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_customer_documents_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Functions: {
      can_access_owner: {
        Args: { owner_id: string }
        Returns: boolean
      }
      can_create_owner: {
        Args: { user_id_to_check: string }
        Returns: boolean
      }
      can_create_profile: {
        Args: { profile_email: string; profile_user_id: string }
        Returns: boolean
      }
      get_user_permissions: {
        Args: { user_uuid: string }
        Returns: string
      }
      is_admin: {
        Args: { _user_id: string }
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
