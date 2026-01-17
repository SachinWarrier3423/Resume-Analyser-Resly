// Supabase database types
// Generated from schema.sql

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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          file_url: string;
          parsed_text: string;
          file_name: string | null;
          file_size_bytes: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_url: string;
          parsed_text: string;
          file_name?: string | null;
          file_size_bytes?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_url?: string;
          parsed_text?: string;
          file_name?: string | null;
          file_size_bytes?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      analyses: {
        Row: {
          id: string;
          resume_id: string;
          job_description: string;
          result_json: Json;
          match_score: number;
          ats_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          resume_id: string;
          job_description: string;
          result_json: Json;
          match_score: number;
          ats_score: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          resume_id?: string;
          job_description?: string;
          result_json?: Json;
          match_score?: number;
          ats_score?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      usage_logs: {
        Row: {
          id: string;
          user_id: string | null;
          endpoint: string;
          tokens_used: number | null;
          latency_ms: number;
          status_code: number;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          endpoint: string;
          tokens_used?: number | null;
          latency_ms: number;
          status_code: number;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          endpoint?: string;
          tokens_used?: number | null;
          latency_ms?: number;
          status_code?: number;
          error_message?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

