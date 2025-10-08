import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type GuitarSolo = {
  id: string;
  title: string;
  artist: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  key_signature: string;
  tempo: number;
  techniques: string[];
  tab_data: any;
  theory_notes: string;
  created_at: string;
};

export type TheoryLesson = {
  id: string;
  title: string;
  category: 'scales' | 'modes' | 'chords' | 'techniques' | 'improvisation';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: string;
  examples: any;
  order_index: number;
  created_at: string;
};

export type PracticeExercise = {
  id: string;
  title: string;
  type: 'rhythm' | 'technique' | 'theory' | 'sight-reading';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string;
  tab_data: any;
  created_at: string;
};

export type UserProgress = {
  id: string;
  user_id: string;
  content_type: 'solo' | 'lesson' | 'exercise';
  content_id: string;
  completed: boolean;
  mastery_level: number;
  notes: string;
  last_practiced: string;
  created_at: string;
};
