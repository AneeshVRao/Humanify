/**
 * Database Types
 * Generated from Supabase schema
 * Senior Software Developer: Type-safe database operations
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          plan_type: "free" | "pro";
          subscription_status:
            | "active"
            | "cancelled"
            | "expired"
            | "past_due"
            | null;
          stripe_customer_id: string | null;
          daily_usage_count: number;
          daily_usage_reset_at: string | null;
          total_humanizations: number;
          total_characters_processed: number;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
          claude_api_key_encrypted: string | null;
          preferred_ai_provider: "gemini" | "claude" | null;
          is_admin: boolean | null;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          plan_type?: "free" | "pro";
          subscription_status?:
            | "active"
            | "cancelled"
            | "expired"
            | "past_due"
            | null;
          stripe_customer_id?: string | null;
          daily_usage_count?: number;
          daily_usage_reset_at?: string | null;
          total_humanizations?: number;
          total_characters_processed?: number;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string | null;
          claude_api_key_encrypted?: string | null;
          preferred_ai_provider?: "gemini" | "claude" | null;
          is_admin?: boolean | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          plan_type?: "free" | "pro";
          subscription_status?:
            | "active"
            | "cancelled"
            | "expired"
            | "past_due"
            | null;
          stripe_customer_id?: string | null;
          daily_usage_count?: number;
          daily_usage_reset_at?: string | null;
          total_humanizations?: number;
          total_characters_processed?: number;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string | null;
          claude_api_key_encrypted?: string | null;
          preferred_ai_provider?: "gemini" | "claude" | null;
          is_admin?: boolean | null;
        };
      };
      humanizations: {
        Row: {
          id: string;
          user_id: string;
          original_text: string;
          humanized_text: string;
          tone: "casual" | "professional" | "academic" | "neutral";
          character_count: number;
          ai_score_before: number | null;
          ai_score_after: number | null;
          processing_time_ms: number | null;
          ai_provider: "claude" | "gemini" | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          original_text: string;
          humanized_text: string;
          tone: "casual" | "professional" | "academic" | "neutral";
          character_count: number;
          ai_score_before?: number | null;
          ai_score_after?: number | null;
          processing_time_ms?: number | null;
          ai_provider?: "claude" | "gemini" | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          original_text?: string;
          humanized_text?: string;
          tone?: "casual" | "professional" | "academic" | "neutral";
          character_count?: number;
          ai_score_before?: number | null;
          ai_score_after?: number | null;
          processing_time_ms?: number | null;
          ai_provider?: "claude" | "gemini" | null;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string;
          stripe_price_id: string;
          plan_type: "free" | "pro";
          status: "active" | "cancelled" | "expired" | "past_due" | "unpaid";
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_subscription_id: string;
          stripe_price_id: string;
          plan_type: "free" | "pro";
          status: "active" | "cancelled" | "expired" | "past_due" | "unpaid";
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end?: boolean;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_subscription_id?: string;
          stripe_price_id?: string;
          plan_type?: "free" | "pro";
          status?: "active" | "cancelled" | "expired" | "past_due" | "unpaid";
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      usage_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          metadata: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          metadata?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          metadata?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      api_keys: {
        Row: {
          id: string;
          user_id: string;
          key_hash: string;
          name: string;
          last_used_at: string | null;
          created_at: string;
          expires_at: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          key_hash: string;
          name: string;
          last_used_at?: string | null;
          created_at?: string;
          expires_at?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          key_hash?: string;
          name?: string;
          last_used_at?: string | null;
          created_at?: string;
          expires_at?: string | null;
          is_active?: boolean;
        };
      };
      pro_requests: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          name: string | null;
          message: string | null;
          use_case: string | null;
          status: "pending" | "approved" | "rejected";
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
          approved_at: string | null;
          approved_by: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          name?: string | null;
          message?: string | null;
          use_case?: string | null;
          status?: "pending" | "approved" | "rejected";
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
          approved_at?: string | null;
          approved_by?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          name?: string | null;
          message?: string | null;
          use_case?: string | null;
          status?: "pending" | "approved" | "rejected";
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
          approved_at?: string | null;
          approved_by?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      check_rate_limit: {
        Args: {
          user_uuid: string;
        };
        Returns: {
          allowed: boolean;
          remaining: number;
          reset_at: string;
        }[];
      };
      increment_usage: {
        Args: {
          user_uuid: string;
          chars: number;
        };
        Returns: void;
      };
      get_user_with_plan: {
        Args: {
          user_uuid: string;
        };
        Returns: {
          id: string;
          email: string;
          name: string | null;
          plan_type: "free" | "pro";
          subscription_status:
            | "active"
            | "cancelled"
            | "expired"
            | "past_due"
            | null;
          daily_usage_count: number;
          daily_usage_reset_at: string | null;
          total_humanizations: number;
          total_characters_processed: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types
export type UserRow = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export type HumanizationRow =
  Database["public"]["Tables"]["humanizations"]["Row"];
export type HumanizationInsert =
  Database["public"]["Tables"]["humanizations"]["Insert"];
export type HumanizationUpdate =
  Database["public"]["Tables"]["humanizations"]["Update"];

export type SubscriptionRow =
  Database["public"]["Tables"]["subscriptions"]["Row"];
export type SubscriptionInsert =
  Database["public"]["Tables"]["subscriptions"]["Insert"];
export type SubscriptionUpdate =
  Database["public"]["Tables"]["subscriptions"]["Update"];

export type UsageLogRow = Database["public"]["Tables"]["usage_logs"]["Row"];
export type UsageLogInsert =
  Database["public"]["Tables"]["usage_logs"]["Insert"];

export type ApiKeyRow = Database["public"]["Tables"]["api_keys"]["Row"];
export type ApiKeyInsert = Database["public"]["Tables"]["api_keys"]["Insert"];
export type ApiKeyUpdate = Database["public"]["Tables"]["api_keys"]["Update"];

export type ProRequestRow = Database["public"]["Tables"]["pro_requests"]["Row"];
export type ProRequestInsert =
  Database["public"]["Tables"]["pro_requests"]["Insert"];
export type ProRequestUpdate =
  Database["public"]["Tables"]["pro_requests"]["Update"];

// Tone type
export type Tone = "casual" | "professional" | "academic" | "neutral";

// Plan type
export type PlanType = "free" | "pro";

// AI Provider type
export type AIProvider = "claude" | "gemini";
