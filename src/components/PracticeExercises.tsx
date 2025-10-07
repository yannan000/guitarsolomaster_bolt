import React, { useEffect, useState } from 'react';
import { Zap, Target, Brain, Eye, CheckCircle } from 'lucide-react';
import { supabase, PracticeExercise } from '../lib/supabase';

export const PracticeExercises: React.FC = () => {
  const [exercises, setExercises] = useState<PracticeExercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<PracticeExercise | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('practice_exercises')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const exerciseTypes = [
    { id: 'all', name: 'All Exercises', icon: Zap },
    { id: 'technique', name: 'Technique', icon: Target },
    { id: 'rhythm', name: 'Rhythm', icon: CheckCircle },
    { id: 'theory', name: 'Theory', icon: Brain },
    { id: 'sight-reading', name: 'Sight Reading', icon: Eye },
  ];

  const getTypeIcon = (type: string) => {
    const exerciseType = exerciseTypes.find(t => t.id === type);
    return exerciseType?.icon || Zap;
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

  const filteredExercises =
    selectedType === 'all'
      ? exercises
      : exercises.filter(exercise => exercise.type === selectedType);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (selectedExercise) {
    const Icon = getTypeIcon(selectedExercise.type);

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedExercise(null)}
          className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Exercises
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Icon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedExercise.title}</h2>
                <p className="text-lg text-gray-600 capitalize">{selectedExercise.type.replace('-', ' ')}</p>
              </div>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold border ${getDifficultyColor(
                selectedExercise.difficulty
              )}`}
            >
              {selectedExercise.difficulty}
            </span>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Instructions
            </h3>
            <p className="text-gray-800 leading-relaxed whitespace-pre-line">
              {selectedExercise.instructions}
            </p>
          </div>

          {selectedExercise.tab_data?.tab && (
            <div className="bg-gray-900 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-white mb-4">Tab Notation</h3>
              <pre className="text-green-400 font-mono text-sm overflow-x-auto whitespace-pre">
                {selectedExercise.tab_data.tab}
              </pre>
            </div>
          )}

          {selectedExercise.tab_data?.intervals && (
            <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Visual Approach</h3>
              <p className="text-gray-800 mb-4">
                Since you're working on visual learning instead of ear training, here's how to find
                intervals on the fretboard:
              </p>
              <ul className="space-y-2">
                {selectedExercise.tab_data.intervals.map((interval: any, index: number) => (
                  <li key={index} className="text-gray-800">
                    <span className="font-semibold">{interval.root}:</span>{' '}
                    {interval.positions.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Practice Tips</h3>
            <ul className="space-y-2 text-gray-800">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Start slowly and focus on accuracy before speed</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Use a metronome to maintain consistent timing</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Practice for short, focused sessions rather than long unfocused ones</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Record yourself to track progress and identify areas for improvement</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Practice Exercises</h2>
        <p className="text-gray-600 mb-6">
          Visual and technique-focused exercises designed for intermediate players. Perfect for
          building skills without relying on ear training.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {exerciseTypes.map(type => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === type.id
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{type.name}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredExercises.map(exercise => {
          const Icon = getTypeIcon(exercise.type);
          return (
            <div
              key={exercise.id}
              onClick={() => setSelectedExercise(exercise)}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Icon className="w-5 h-5 text-green-600" />
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(
                    exercise.difficulty
                  )}`}
                >
                  {exercise.difficulty}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">{exercise.title}</h3>
              <p className="text-sm text-gray-600 capitalize mb-4">
                {exercise.type.replace('-', ' ')}
              </p>

              <p className="text-gray-700 text-sm line-clamp-3">{exercise.instructions}</p>

              <div className="mt-4 flex items-center text-green-600 font-medium text-sm">
                Start Practicing →
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
