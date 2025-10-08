import React, { useEffect, useState } from 'react';
import { BookOpen, Layers, Guitar, Lightbulb, Target } from 'lucide-react';
import { supabase, TheoryLesson } from '../lib/supabase';
import { Fretboard } from './Fretboard';

export const TheoryLessons: React.FC = () => {
  const [lessons, setLessons] = useState<TheoryLesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<TheoryLesson | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('theory_lessons')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Lessons', icon: BookOpen },
    { id: 'scales', name: 'Scales', icon: Layers },
    { id: 'modes', name: 'Modes', icon: Target },
    { id: 'techniques', name: 'Techniques', icon: Guitar },
    { id: 'improvisation', name: 'Improvisation', icon: Lightbulb },
  ];

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.icon || BookOpen;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const filteredLessons =
    selectedCategory === 'all'
      ? lessons
      : lessons.filter(lesson => lesson.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (selectedLesson) {
    const Icon = getCategoryIcon(selectedLesson.category);
    const examplePositions = selectedLesson.examples?.positions || [];

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedLesson(null)}
          className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Lessons
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Icon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedLesson.title}</h2>
                <p className="text-lg text-gray-600 capitalize">{selectedLesson.category}</p>
              </div>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold border ${getDifficultyColor(
                selectedLesson.difficulty
              )}`}
            >
              {selectedLesson.difficulty}
            </span>
          </div>

          <div className="prose max-w-none mb-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-line">
                {selectedLesson.content}
              </p>
            </div>
          </div>

          {examplePositions.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Visual Example</h3>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                {examplePositions.map((position: any, index: number) => {
                  const notes = position.pattern.flatMap((pair: number[], stringIndex: number) => {
                    const [startFret, endFret] = pair;
                    const frets = [];
                    for (let f = startFret; f <= endFret; f++) {
                      if (f > 0) {
                        frets.push({
                          string: stringIndex + 1,
                          fret: position.root_fret + f,
                        });
                      }
                    }
                    return frets;
                  });

                  return (
                    <div key={index} className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">
                        {position.name}
                      </h4>
                      <Fretboard
                        highlightedNotes={notes}
                        startFret={position.root_fret}
                        endFret={position.root_fret + 4}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedLesson.examples?.modes && (
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Mode Details</h3>
              <div className="space-y-2">
                <p className="text-gray-800">
                  <span className="font-semibold">Name:</span> {selectedLesson.examples.modes[0].name}
                </p>
                <p className="text-gray-800">
                  <span className="font-semibold">Formula:</span> {selectedLesson.examples.modes[0].formula}
                </p>
                <p className="text-gray-800">
                  <span className="font-semibold">Character:</span> {selectedLesson.examples.modes[0].sound}
                </p>
              </div>
            </div>
          )}

          {selectedLesson.examples?.example && (
            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Practice Tip</h3>
              <p className="text-gray-800">{selectedLesson.examples.example}</p>
            </div>
          )}

          {selectedLesson.examples?.concept && (
            <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Key Concept</h3>
              <p className="text-gray-800">{selectedLesson.examples.concept}</p>
            </div>
          )}

          {selectedLesson.examples?.exercises && (
            <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Exercise</h3>
              <p className="text-gray-800">
                <span className="font-semibold">Technique:</span>{' '}
                {selectedLesson.examples.exercises[0].technique}
              </p>
              <p className="text-gray-800 mt-2">{selectedLesson.examples.exercises[0].description}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Theory Lessons</h2>
        <p className="text-gray-600 mb-6">
          Master the theory behind great guitar playing. Perfect for intermediate players looking to
          level up their understanding.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {categories.map(category => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filteredLessons.map(lesson => {
          const Icon = getCategoryIcon(lesson.category);
          return (
            <div
              key={lesson.id}
              onClick={() => setSelectedLesson(lesson)}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer p-6 border border-gray-200"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{lesson.title}</h3>
                  <p className="text-sm text-gray-600 capitalize">{lesson.category}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(
                    lesson.difficulty
                  )}`}
                >
                  {lesson.difficulty}
                </span>
              </div>

              <p className="text-gray-700 line-clamp-3">{lesson.content}</p>

              <div className="mt-4 flex items-center text-blue-600 font-medium text-sm">
                Start Learning →
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
