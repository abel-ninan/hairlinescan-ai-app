// Database types for HairlineScan app

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  scan_count: number;
  last_scan_at: string | null;
  preferences: UserPreferences;
}

export interface UserPreferences {
  notifications_enabled: boolean;
  dark_mode: boolean;
  scan_reminders: boolean;
  weekly_reports: boolean;
  reminder_frequency: 'daily' | 'weekly' | 'monthly';
  measurement_unit: 'metric' | 'imperial';
}

export interface Scan {
  id: string;
  user_id: string;
  created_at: string;
  score: number;
  confidence: number;
  summary: string;
  hairline_type: string | null;
  hairline_description: string | null;
  observations: string[];
  likely_patterns: string[];
  personalized_tips: string[];
  photo_front_url: string | null;
  photo_left_url: string | null;
  photo_right_url: string | null;
  questionnaire_data: QuestionnaireData;
  metrics: ScanMetrics;
  is_favorite: boolean;
  notes: string | null;
}

export interface ScanMetrics {
  symmetry: number;
  definition: number;
  fullness: number;
  structure: number;
  texture: number;
}

export interface QuestionnaireData {
  ageRange: string;
  styleTime: string;
  familyStyle: string;
  stylingFreq: string;
  careRoutine: string;
}

export interface ScanComparison {
  id: string;
  user_id: string;
  scan_id_1: string;
  scan_id_2: string;
  created_at: string;
  comparison_notes: string | null;
  score_difference: number;
}

export interface ProgressReport {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  created_at: string;
  report_type: 'weekly' | 'monthly';
  average_score: number;
  score_trend: 'improving' | 'stable' | 'declining';
  scan_count: number;
  insights: string[];
  recommendations: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: 'scan_count' | 'streak' | 'score' | 'special';
  requirement_value: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'reminder' | 'achievement' | 'report' | 'tip' | 'system';
  title: string;
  message: string;
  created_at: string;
  read_at: string | null;
  action_url: string | null;
}

// Supabase database schema type
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at' | 'scan_count'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      scans: {
        Row: Scan;
        Insert: Omit<Scan, 'id' | 'created_at'>;
        Update: Partial<Omit<Scan, 'id' | 'user_id' | 'created_at'>>;
      };
      scan_comparisons: {
        Row: ScanComparison;
        Insert: Omit<ScanComparison, 'id' | 'created_at'>;
        Update: Partial<Omit<ScanComparison, 'id' | 'created_at'>>;
      };
      progress_reports: {
        Row: ProgressReport;
        Insert: Omit<ProgressReport, 'id' | 'created_at'>;
        Update: Partial<Omit<ProgressReport, 'id' | 'created_at'>>;
      };
      achievements: {
        Row: Achievement;
        Insert: Omit<Achievement, 'id'>;
        Update: Partial<Omit<Achievement, 'id'>>;
      };
      user_achievements: {
        Row: UserAchievement;
        Insert: Omit<UserAchievement, 'id' | 'unlocked_at'>;
        Update: never;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>;
      };
    };
  };
}
