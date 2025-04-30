export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          email: string | null;
          billing_address: string | null;
          street_address: string | null;
          city: string | null;
          state: string | null;
          zip: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          billing_address?: string | null;
          street_address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          billing_address?: string | null;
          street_address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          job_id: string;
          invoice_number: string;
          amount: number;
          line_items: Json | null;
          issued_at: string;
          due_at: string | null;
          paid_at: string | null;
          payment_method: string | null;
          payment_link: string | null;
          cashtag_qr_url: string | null;
          stripe_session_id: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          invoice_number?: string;
          amount: number;
          line_items?: Json | null;
          issued_at?: string;
          due_at?: string | null;
          paid_at?: string | null;
          payment_method?: string | null;
          payment_link?: string | null;
          cashtag_qr_url?: string | null;
          stripe_session_id?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          invoice_number?: string;
          amount?: number;
          line_items?: Json | null;
          issued_at?: string;
          due_at?: string | null;
          paid_at?: string | null;
          payment_method?: string | null;
          payment_link?: string | null;
          cashtag_qr_url?: string | null;
          stripe_session_id?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'invoices_job_id_fkey';
            columns: ['job_id'];
            referencedRelation: 'jobs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invoices_created_by_fkey';
            columns: ['created_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      jobs: {
        Row: {
          id: string;
          job_code: string;
          client_id: string | null;
          street_address: string;
          city: string;
          state: string;
          zip: string;
          lat: number | null;
          lng: number | null;
          description: string | null;
          scheduled_at: string | null;
          status: string;
          assigned_tech_ids: string[];
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_code?: string;
          client_id?: string | null;
          street_address: string;
          city: string;
          state: string;
          zip: string;
          lat?: number | null;
          lng?: number | null;
          description?: string | null;
          scheduled_at?: string | null;
          status?: string;
          assigned_tech_ids?: string[];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_code?: string;
          client_id?: string | null;
          street_address?: string;
          city?: string;
          state?: string;
          zip?: string;
          lat?: number | null;
          lng?: number | null;
          description?: string | null;
          scheduled_at?: string | null;
          status?: string;
          assigned_tech_ids?: string[];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'jobs_client_id_fkey';
            columns: ['client_id'];
            referencedRelation: 'clients';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: string;
          phone: string | null;
          email: string;
          skills: string[] | null;
          calendar_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role: string;
          phone?: string | null;
          email: string;
          skills?: string[] | null;
          calendar_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: string;
          phone?: string | null;
          email?: string;
          skills?: string[] | null;
          calendar_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      receipts: {
        Row: {
          id: string;
          job_id: string;
          vendor: string;
          receipt_date: string;
          image_url: string | null;
          total_amount: number;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          vendor: string;
          receipt_date: string;
          image_url?: string | null;
          total_amount: number;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          vendor?: string;
          receipt_date?: string;
          image_url?: string | null;
          total_amount?: number;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'receipts_job_id_fkey';
            columns: ['job_id'];
            referencedRelation: 'jobs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'receipts_created_by_fkey';
            columns: ['created_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      template_responses: {
        Row: {
          id: string;
          job_id: string;
          template_id: string;
          response_data: Json;
          completed_by: string | null;
          completed_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          template_id: string;
          response_data: Json;
          completed_by?: string | null;
          completed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          template_id?: string;
          response_data?: Json;
          completed_by?: string | null;
          completed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'template_responses_job_id_fkey';
            columns: ['job_id'];
            referencedRelation: 'jobs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'template_responses_template_id_fkey';
            columns: ['template_id'];
            referencedRelation: 'templates';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'template_responses_completed_by_fkey';
            columns: ['completed_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      templates: {
        Row: {
          id: string;
          name: string;
          type: string;
          json_schema: Json;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          json_schema: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          json_schema?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'templates_created_by_fkey';
            columns: ['created_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      trips: {
        Row: {
          id: string;
          technician_id: string;
          job_id_start: string | null;
          job_id_end: string | null;
          depart_timestamp: string;
          arrive_timestamp: string | null;
          distance_miles: number | null;
          duration_minutes: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          technician_id: string;
          job_id_start?: string | null;
          job_id_end?: string | null;
          depart_timestamp: string;
          arrive_timestamp?: string | null;
          distance_miles?: number | null;
          duration_minutes?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          technician_id?: string;
          job_id_start?: string | null;
          job_id_end?: string | null;
          depart_timestamp?: string;
          arrive_timestamp?: string | null;
          distance_miles?: number | null;
          duration_minutes?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'trips_technician_id_fkey';
            columns: ['technician_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trips_job_id_start_fkey';
            columns: ['job_id_start'];
            referencedRelation: 'jobs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trips_job_id_end_fkey';
            columns: ['job_id_end'];
            referencedRelation: 'jobs';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
