export type EmergencyPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type EmergencyStatus = 'ACTIVE' | 'IN_PROGRESS' | 'RESOLVED' | 'ARCHIVED';

export interface SafetyInstruction {
  step: number;
  title: string;
  instruction: string;
  urgency?: string;
}

export interface EmergencyAIResponse {
  emergency_type: string;
  priority: EmergencyPriority;
  confidence: number;
  summary: string;
  immediate_instructions: SafetyInstruction[];
  dos: string[];
  donts: string[];
  official_services_recommended: string[];
  emergency_disclaimer: string;
  rag_grounded?: boolean;
  source_protocols?: string[];
}

export interface EmergencyRequest {
  id: string;
  user?: number | null;
  user_detail?: {
    id: number;
    name: string;
    email: string;
  };
  description: string;
  emergency_type: string;
  priority: EmergencyPriority;
  ai_response: EmergencyAIResponse;
  latitude: number | null;
  longitude: number | null;
  status: EmergencyStatus;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: number;
  name: string;
  service_type: 'police' | 'ambulance' | 'fire' | 'disaster' | 'poison' | 'helpline';
  phone: string;
  region: string;
  is_primary: boolean;
  description: string;
  verified?: boolean;
  is_demo?: boolean;
}

export interface PersonalICEContact {
  id?: number;
  name: string;
  relationship: string;
  phone: string;
  notify_on_sos: boolean;
}

export interface EmergencyFacility {
  id: number;
  name: string;
  facility_type: 'hospital' | 'police' | 'fire' | 'shelter';
  latitude: number;
  longitude: number;
  address: string;
  phone: string;
  is_24_hours: boolean;
  emergency_services: string;
  bed_status: string;
  rating: number;
  distance_km: number;
  eta_minutes: number;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  weather_code: number;
  wind_speed_kmh: number;
  precipitation_mm: number;
  severity: string;
  has_alert: boolean;
  alert: {
    headline: string;
    instruction: string;
    level: string;
  } | null;
  source: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  preferred_language: string;
  phone: string;
  created_at?: string;
}
