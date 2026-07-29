export interface DetailedObservation {
  area: string;
  observation: string;
  severity: "none" | "mild" | "moderate" | "significant";
}

export interface HairCareStep {
  step_number: number;
  title: string;
  description: string;
  products?: string[];
  frequency: string;
}

export interface RecommendedAction {
  priority: "high" | "medium" | "low";
  action: string;
  description: string;
  timeframe: string;
}

export interface AnalysisMetric {
  label: string;
  value: number; // 0-10
  description: string;
}

export interface FollicularAnalysis {
  density_estimate: string;
  miniaturization_ratio: string;
  terminal_to_vellus: string;
  description: string;
}

export interface ScalpCondition {
  health: string; // "excellent" | "good" | "fair" | "poor"
  issues: string[];
  recommendations: string[];
}

export interface Prognosis {
  short_term: string; // 3-6 month outlook
  long_term: string;  // 1-3 year outlook
  preventability: string; // how preventable further loss is
}

export interface LifestyleImpact {
  diet_impact: string;
  stress_impact: string;
  sleep_impact: string;
  exercise_impact: string;
  overall_grade: string; // A/B/C/D/F based on questionnaire
}

export interface AnalysisResult {
  score: number;
  confidence: number;
  summary: string;
  observations: string[];
  disclaimer: string;

  // Norwood classification
  norwood_scale: number; // 1-7
  norwood_description: string;

  // Detailed analysis
  detailed_observations: DetailedObservation[];
  metrics: AnalysisMetric[];
  risk_factors: string[];
  positive_signs: string[];

  // Deep analysis
  follicular_analysis?: FollicularAnalysis;
  scalp_condition?: ScalpCondition;
  age_comparison?: string;
  prognosis?: Prognosis;
  lifestyle_impact?: LifestyleImpact;

  // Care plan
  hair_care_routine: HairCareStep[];
  recommended_actions: RecommendedAction[];

  // Dermatologist recommendation
  should_see_dermatologist: boolean;
  dermatologist_reason: string;

  // Meta
  photos_analyzed: number;

  // Legacy fields kept for compatibility with saved scans
  hairline_type?: string;
  hairline_description?: string;
  personalized_tips?: string[];
}
