export interface UserSignal {
  user_role?: "Client" | "Provider" | "Partner" | "Investor";
  // Layer 1
  primary_concern: string;
  intensity_level: "low" | "moderate" | "significant" | "crisis";
  duration: "recent" | "weeks" | "months" | "long_time";
  support_goal: string;
  prior_support: "yes" | "no" | "undisclosed";

  // Layer 2 (optional)
  language?: string[];
  preferred_specialties?: string[];
  preferred_modalities?: ("cbt" | "somatic" | "psychodynamic" | "mindfulness" | "executive_coaching" | "trauma_informed")[];
  session_format?: "online" | "in_person" | "either";
  budget_sensitivity?: "yes" | "somewhat" | "no";
  cultural_preference?: boolean;
}

export interface QuestionOption {
  label: string;
  value: string;
  isCustom?: boolean; // For free text input options
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  multiSelect?: boolean;
  allowSkip?: boolean;
  trigger?: (signal: Partial<UserSignal>) => boolean; // Condition to show this question
}

export interface Recommendation {
  id: string;
  type: "provider" | "resource" | "article" | "podcast" | "event" | "playlist";
  title: string;
  description: string;
  tags: string[];
  languages: string[];
  url: string;
  match_reasons: string[];  // Human-readable explanation strings
  availability?: string;
  cost?: "free" | "paid" | "subscription";
  image?: string;
  providerId?: string; // If it's a provider
}
