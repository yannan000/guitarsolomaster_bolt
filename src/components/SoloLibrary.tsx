import React, { useEffect, useState } from 'react';
import { Music, Clock, TrendingUp, ChevronRight, Plus } from 'lucide-react';
import { supabase, GuitarSolo } from '../lib/supabase';
import { Fretboard } from './Fretboard';
import { AddSoloForm } from './AddSoloForm';

export const SoloLibrary: React.FC = () => {
  const [solos, setSolos] = useState<GuitarSolo[]>([]);
  const [selectedSolo, setSelectedSolo] = useState<GuitarSolo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchSolos();
  }, []);

  const fetchSolos = async () => {
    try {
      const { data, error } = await supabase
        .from('guitar_solos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSolos(data || []);
    } catch (error) {
      console.error('Error fetching solos:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (selectedSolo) {
    const highlightedNotes = selectedSolo.tab_data?.measures?.[0]?.frets?.flatMap(
      (frets: number[], index: number) =>
        frets.map(fret => ({
          string: selectedSolo.tab_data.measures[0].strings[index] || 1,
          fret,
          label: fret.toString()
        }))
    ) || [];

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedSolo(null)}
          className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Solo Library
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedSolo.title}</h2>
              <p className="text-xl text-gray-600">{selectedSolo.artist}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold border ${getDifficultyColor(
                selectedSolo.difficulty
              )}`}
            >
              {selectedSolo.difficulty}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center text-gray-600 mb-1">
                <Music className="w-4 h-4 mr-2" />
                <span className="text-sm">Key</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{selectedSolo.key_signature}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center text-gray-600 mb-1">
                <Clock className="w-4 h-4 mr-2" />
                <span className="text-sm">Tempo</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{selectedSolo.tempo} BPM</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center text-gray-600 mb-1">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span className="text-sm">Techniques</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{selectedSolo.techniques?.length || 0}</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Techniques Used</h3>
            <div className="flex flex-wrap gap-2">
              {selectedSolo.techniques?.map((technique, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {technique}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Fretboard Visualization</h3>
            <Fretboard highlightedNotes={highlightedNotes} startFret={0} endFret={17} />
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
              <Music className="w-5 h-5 mr-2" />
              Theory Behind the Solo
            </h3>
            <p className="text-gray-700 leading-relaxed">{selectedSolo.theory_notes}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showAddForm && (
        <AddSoloForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            fetchSolos();
            setShowAddForm(false);
          }}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Guitar Solos</h2>
          <p className="text-sm text-gray-600 mt-1">{solos.length} solos available</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md font-semibold"
        >
          <Plus className="w-5 h-5" />
          <span>Add Solo</span>
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {solos.map(solo => (
          <div
            key={solo.id}
            onClick={() => setSelectedSolo(solo)}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer p-6 border border-gray-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{solo.title}</h3>
                <p className="text-sm text-gray-600">{solo.artist}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-3">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(
                  solo.difficulty
                )}`}
              >
                {solo.difficulty}
              </span>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center">
                  <Music className="w-4 h-4 mr-1" />
                  {solo.key_signature}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {solo.tempo} BPM
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {solo.techniques?.slice(0, 3).map((technique, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                  >
                    {technique}
                  </span>
                ))}
                {solo.techniques?.length > 3 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                    +{solo.techniques.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
