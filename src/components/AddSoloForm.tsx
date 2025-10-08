import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AddSoloFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AddSoloForm: React.FC<AddSoloFormProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    key_signature: '',
    tempo: 120,
    techniques: [] as string[],
    theory_notes: '',
  });
  const [newTechnique, setNewTechnique] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.title || !formData.artist || !formData.key_signature) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase.from('guitar_solos').insert([
        {
          title: formData.title,
          artist: formData.artist,
          difficulty: formData.difficulty,
          key_signature: formData.key_signature,
          tempo: formData.tempo,
          techniques: formData.techniques,
          tab_data: { measures: [] },
          theory_notes: formData.theory_notes,
        },
      ]);

      if (insertError) throw insertError;

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error adding solo:', err);
      setError('Failed to add solo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addTechnique = () => {
    if (newTechnique.trim() && !formData.techniques.includes(newTechnique.trim())) {
      setFormData({
        ...formData,
        techniques: [...formData.techniques, newTechnique.trim()],
      });
      setNewTechnique('');
    }
  };

  const removeTechnique = (technique: string) => {
    setFormData({
      ...formData,
      techniques: formData.techniques.filter(t => t !== technique),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Add New Solo</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Song Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Hotel California Solo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Artist <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.artist}
              onChange={e => setFormData({ ...formData, artist: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Eagles"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={e =>
                  setFormData({
                    ...formData,
                    difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced',
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Key <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.key_signature}
                onChange={e => setFormData({ ...formData, key_signature: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., A Minor"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tempo (BPM)
            </label>
            <input
              type="number"
              value={formData.tempo}
              onChange={e => setFormData({ ...formData, tempo: parseInt(e.target.value) || 120 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="40"
              max="240"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Techniques Used
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTechnique}
                onChange={e => setNewTechnique(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTechnique())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., bending, vibrato, tapping"
              />
              <button
                type="button"
                onClick={addTechnique}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.techniques.map(technique => (
                <span
                  key={technique}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {technique}
                  <button
                    type="button"
                    onClick={() => removeTechnique(technique)}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Theory Notes
            </label>
            <textarea
              value={formData.theory_notes}
              onChange={e => setFormData({ ...formData, theory_notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Add notes about scales, modes, or techniques used in this solo..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Solo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
