/*
  # Guitar Learning App Database Schema

  1. New Tables
    - `guitar_solos`
      - `id` (uuid, primary key)
      - `title` (text) - Solo name
      - `artist` (text) - Original artist
      - `difficulty` (text) - beginner, intermediate, advanced
      - `key_signature` (text) - Musical key
      - `tempo` (integer) - BPM
      - `techniques` (text[]) - Array of techniques used
      - `tab_data` (jsonb) - Tab notation data
      - `theory_notes` (text) - Theory explanation
      - `created_at` (timestamptz)
    
    - `theory_lessons`
      - `id` (uuid, primary key)
      - `title` (text) - Lesson title
      - `category` (text) - scales, modes, chords, techniques
      - `difficulty` (text) - beginner, intermediate, advanced
      - `content` (text) - Lesson content
      - `examples` (jsonb) - Musical examples
      - `order_index` (integer) - Display order
      - `created_at` (timestamptz)
    
    - `practice_exercises`
      - `id` (uuid, primary key)
      - `title` (text) - Exercise name
      - `type` (text) - rhythm, technique, theory, sight-reading
      - `difficulty` (text) - beginner, intermediate, advanced
      - `instructions` (text) - How to practice
      - `tab_data` (jsonb) - Exercise tab data
      - `created_at` (timestamptz)
    
    - `user_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - References auth.users
      - `content_type` (text) - solo, lesson, exercise
      - `content_id` (uuid) - ID of the content
      - `completed` (boolean, default false)
      - `mastery_level` (integer, default 0) - 0-100 scale
      - `notes` (text) - Personal notes
      - `last_practiced` (timestamptz, default now())
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on all tables
    - Public read access for solos, lessons, and exercises
    - Authenticated users can manage their own progress
    - Users can only view and edit their own progress data
*/

-- Create guitar_solos table
CREATE TABLE IF NOT EXISTS guitar_solos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  key_signature text NOT NULL,
  tempo integer NOT NULL,
  techniques text[] DEFAULT '{}',
  tab_data jsonb NOT NULL,
  theory_notes text,
  created_at timestamptz DEFAULT now()
);

-- Create theory_lessons table
CREATE TABLE IF NOT EXISTS theory_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('scales', 'modes', 'chords', 'techniques', 'improvisation')),
  difficulty text NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  content text NOT NULL,
  examples jsonb,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create practice_exercises table
CREATE TABLE IF NOT EXISTS practice_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('rhythm', 'technique', 'theory', 'sight-reading')),
  difficulty text NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  instructions text NOT NULL,
  tab_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('solo', 'lesson', 'exercise')),
  content_id uuid NOT NULL,
  completed boolean DEFAULT false,
  mastery_level integer DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 100),
  notes text,
  last_practiced timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

-- Enable RLS
ALTER TABLE guitar_solos ENABLE ROW LEVEL SECURITY;
ALTER TABLE theory_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for guitar_solos
CREATE POLICY "Anyone can view guitar solos"
  ON guitar_solos FOR SELECT
  TO public
  USING (true);

-- RLS Policies for theory_lessons
CREATE POLICY "Anyone can view theory lessons"
  ON theory_lessons FOR SELECT
  TO public
  USING (true);

-- RLS Policies for practice_exercises
CREATE POLICY "Anyone can view practice exercises"
  ON practice_exercises FOR SELECT
  TO public
  USING (true);

-- RLS Policies for user_progress
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON user_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert sample guitar solos
INSERT INTO guitar_solos (title, artist, difficulty, key_signature, tempo, techniques, tab_data, theory_notes) VALUES
('Stairway to Heaven Solo', 'Led Zeppelin', 'intermediate', 'A Minor', 76, ARRAY['bending', 'hammer-on', 'pull-off', 'vibrato'], 
 '{"measures": [{"frets": [[12, 15, 12, 14, 12], [14, 12, 14, 15]], "strings": [1, 1, 1, 1, 1]}]}',
 'This solo uses the A minor pentatonic scale with added major 3rd notes. Notice the bluesy bends and the call-and-response phrasing.'),

('Comfortably Numb Solo', 'Pink Floyd', 'intermediate', 'B Minor', 63, ARRAY['bending', 'vibrato', 'sustain'], 
 '{"measures": [{"frets": [[14, 17, 14, 16, 14], [16, 14, 16, 17]], "strings": [2, 2, 2, 2, 2]}]}',
 'Built on B minor pentatonic with major pentatonic mixing. Focus on emotional bends and sustaining notes for maximum expression.'),

('Sweet Child O'' Mine Intro', 'Guns N'' Roses', 'intermediate', 'D Major', 122, ARRAY['alternate-picking', 'string-skipping'], 
 '{"measures": [{"frets": [[12, 15, 14, 12, 15, 14, 15, 17], [14, 12]], "strings": [2, 1, 2, 3, 2, 3, 1, 2]}]}',
 'Uses D major scale with arpeggiated patterns. Practice clean alternate picking and precise string skipping between the high strings.');

-- Insert theory lessons
INSERT INTO theory_lessons (title, category, difficulty, content, examples, order_index) VALUES
('Pentatonic Scales - The Foundation', 'scales', 'intermediate', 
 'The pentatonic scale is your best friend for soloing. It contains 5 notes per octave and works over most chord progressions. The minor pentatonic (1-b3-4-5-b7) is used in rock, blues, and metal. The major pentatonic (1-2-3-5-6) adds brightness. Learn both positions and how they connect across the fretboard.',
 '{"positions": [{"name": "Position 1 (E shape)", "root_fret": 12, "pattern": [[0,3], [0,3], [0,2], [0,2], [0,3], [0,3]]}]}',
 1),

('Modes of the Major Scale', 'modes', 'intermediate',
 'Modes are scales built from different starting points of the major scale. Each has a unique sound: Ionian (major, happy), Dorian (minor, jazzy), Phrygian (dark, Spanish), Lydian (bright, dreamy), Mixolydian (dominant, bluesy), Aeolian (natural minor), Locrian (diminished, unstable). Learn the character of each mode.',
 '{"modes": [{"name": "Dorian", "formula": "1-2-b3-4-5-6-b7", "sound": "Minor with major 6th"}]}',
 2),

('String Bending Mastery', 'techniques', 'intermediate',
 'Bending is crucial for expression. Practice bending in tune by matching target notes. Use multiple fingers for support. Common bends: half-step (1 fret), whole-step (2 frets), and 1.5-step (3 frets). Practice pre-bends, bend and release, and bend with vibrato.',
 '{"exercises": [{"description": "Bend 7th fret on G string to match 9th fret", "technique": "whole-step bend"}]}',
 3),

('Chord Tones and Targeting', 'improvisation', 'intermediate',
 'The secret to melodic solos is targeting chord tones (root, 3rd, 5th, 7th) on strong beats. Use scale notes as passing tones between chord tones. This creates a sense of harmony in your lines. Practice outlining chord changes before adding scale runs.',
 '{"example": "Over Am7, target A, C, E, G on beat 1. Use pentatonic notes to connect them."}',
 4),

('Rhythm Variations and Phrasing', 'improvisation', 'intermediate',
 'Great solos use space and rhythmic variety. Practice playing quarter notes, eighth notes, triplets, and sixteenth notes. Use rests strategically. Think in 2 or 4-bar phrases with a beginning, middle, and end. Call and response phrasing creates interest.',
 '{"concept": "Play a short phrase, rest, then answer it with a variation"}',
 5);

-- Insert practice exercises
INSERT INTO practice_exercises (title, type, difficulty, instructions, tab_data) VALUES
('Pentatonic Position Shifting', 'technique', 'intermediate',
 'Practice moving smoothly between pentatonic positions. Play ascending and descending, 2 notes per string. Focus on clean transitions and consistent tone. Start slow at 60 BPM and increase gradually.',
 '{"tab": "e|-12-15-|--12-14-|--12-15-|--12-14-|\nB|-------|--------|--------|--------|\nG|-------|--------|--------|--------|"}'),

('String Bending Accuracy', 'technique', 'intermediate',
 'Bend notes to pitch using your ear and tuner. Bend the 7th fret on the G string to match the 9th fret. Hold for 4 counts. Repeat on different strings. This builds finger strength and intonation.',
 '{"tab": "G|-7b9---|--------|7b9----|--------|\nD|-------|--------|-------|--------|"}'),

('Triplet Rhythm Exercise', 'rhythm', 'intermediate',
 'Play triplets (3 notes per beat) using a single note or pentatonic scale. Use a metronome at 80 BPM. Count "1-trip-let, 2-trip-let". This improves timing and adds rhythmic variety to solos.',
 '{"tab": "e|-12-12-12-|15-15-15-|12-12-12-|14-14-14-|"}'),

('Interval Recognition on Fretboard', 'theory', 'intermediate',
 'Play root notes on the 6th string, then find the intervals: 3rd (2 strings up, 1 fret back), 5th (1 string up, 2 frets forward), 7th (2 strings up, same fret). This visual approach helps non-ear-trained players understand harmony.',
 '{"intervals": [{"root": "E", "positions": ["3rd at G string 9th fret", "5th at A string 7th fret"]}]}');
