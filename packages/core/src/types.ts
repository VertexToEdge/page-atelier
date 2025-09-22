/**
 * Core TypeScript type definitions for Page Atelier
 * Used by: Frontend/Backend - All components for type safety
 * 
 * @tags types, schema, validation, core-types
 */

// ========== Setting Note Types ==========

export interface Character {
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  traits: string[];
  goals: string[];
  relationships: Relationship[];
  speech_pattern?: string;
  taboo_actions?: string[];
}

export interface Relationship {
  character: string;
  type: 'family' | 'friend' | 'enemy' | 'love' | 'mentor' | 'rival' | 'other';
  description: string;
}

export interface WorldRule {
  category: 'magic' | 'society' | 'technology' | 'culture' | 'physics' | 'other';
  rule: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  evidence?: string;
}

export interface TimelineEvent {
  timestamp: string;
  event: string;
  involved_characters: string[];
  importance: 'critical' | 'high' | 'medium' | 'low';
}

export interface SettingNote {
  title: string;
  genre: string[];
  characters: Character[];
  world_rules: WorldRule[];
  timeline: TimelineEvent[];
  summary: string;
}

// ========== Consistency Check Types ==========

export interface Issue {
  type: 'continuity' | 'character' | 'world_rules';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  evidence: string[];
  suggested_fix?: string;
  location?: {
    chapter?: number;
    paragraph?: number;
    line?: string;
  };
}

export interface ConsistencyCheck {
  continuity: {
    score: number; // 0-100
    issues: Issue[];
  };
  character: {
    score: number; // 0-100
    issues: Issue[];
  };
  world_rules: {
    score: number; // 0-100
    issues: Issue[];
  };
  overall_score: number; // Weighted average
}

// ========== Persona Evaluation Types ==========

export interface PersonaMetrics {
  satisfaction: number; // 0-100
  engagement: number; // 0-100
  frustration: number; // 0-100
}

export interface PersonaResult {
  persona_type: 'setting_obsessed' | 'romance_sub_focused' | 'traditional_martial_arts_fan';
  persona_name: string;
  persona_description: string;
  metrics: PersonaMetrics;
  likes: string[];
  dislikes: string[];
  suggestions: string[];
  overall_reaction: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
  sample_comment?: string;
}

// ========== Aggregate Report Types ==========

export type Verdict = 'PASS' | 'REVISE' | 'BLOCK';

export interface ActionItem {
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: 'fix_required' | 'improvement' | 'consideration';
  description: string;
  affected_area: string;
  estimated_effort?: 'minimal' | 'moderate' | 'significant';
}

export interface AggregateReport {
  verdict: Verdict;
  confidence_score: number; // 0-100
  weighted_scores: {
    continuity: number; // weight: 0.4
    character: number; // weight: 0.35
    world_rules: number; // weight: 0.25
    total: number; // 0-100
  };
  action_items: ActionItem[];
  executive_summary: string;
  recommendation: string;
}

// ========== Main Analysis Type ==========

export interface Analysis {
  id: string;
  timestamp: string;
  input: {
    text: string;
    metadata?: {
      title?: string;
      author?: string;
      chapter?: number;
    };
  };
  setting_note: SettingNote;
  consistency_check: ConsistencyCheck;
  persona_evaluations: PersonaResult[];
  aggregate_report: AggregateReport;
  processing_time_ms: number;
  llm_calls_count: number;
  status: 'success' | 'partial' | 'error';
  error?: string;
}

// ========== Request/Response Types for API ==========

export interface AnalyzeRequest {
  text: string;
  options?: {
    skip_personas?: boolean;
    skip_setting_note?: boolean;
    custom_personas?: string[];
    temperature?: number;
  };
}

export interface AnalyzeResponse {
  success: boolean;
  data?: Analysis;
  error?: string;
}