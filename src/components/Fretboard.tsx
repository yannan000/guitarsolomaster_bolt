import React from 'react';

interface FretboardProps {
  highlightedNotes?: Array<{ string: number; fret: number; label?: string }>;
  startFret?: number;
  endFret?: number;
}

const stringNames = ['e', 'B', 'G', 'D', 'A', 'E'];
const fretMarkers = [3, 5, 7, 9, 12, 15, 17, 19, 21];
const doubleDotFrets = [12];

export const Fretboard: React.FC<FretboardProps> = ({
  highlightedNotes = [],
  startFret = 0,
  endFret = 12
}) => {
  const frets = Array.from({ length: endFret - startFret + 1 }, (_, i) => i + startFret);

  const isNoteHighlighted = (string: number, fret: number) => {
    return highlightedNotes.find(n => n.string === string && n.fret === fret);
  };

  return (
    <div className="bg-gradient-to-b from-amber-100 to-amber-200 rounded-lg p-6 shadow-lg">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {stringNames.map((stringName, stringIndex) => (
            <div key={stringIndex} className="flex items-center mb-4">
              <div className="w-8 text-sm font-medium text-gray-700 text-right mr-3">
                {stringName}
              </div>

              <div className="flex relative">
                <div
                  className="absolute h-0.5 bg-gray-800 left-0 right-0 top-1/2 transform -translate-y-1/2"
                  style={{
                    height: stringIndex < 2 ? '1px' : stringIndex < 4 ? '2px' : '3px'
                  }}
                />

                {frets.map((fretNum, fretIndex) => (
                  <div
                    key={fretIndex}
                    className="relative flex items-center justify-center"
                    style={{ width: '64px' }}
                  >
                    {fretNum === 0 ? (
                      <div className="w-1 h-12 bg-gray-900 rounded" />
                    ) : (
                      <div className="w-0.5 h-12 bg-gray-400" />
                    )}

                    {isNoteHighlighted(stringIndex + 1, fretNum) && (
                      <div className="absolute left-1/2 transform -translate-x-1/2">
                        <div className="w-10 h-10 rounded-full bg-blue-500 border-4 border-blue-600 shadow-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {isNoteHighlighted(stringIndex + 1, fretNum)?.label || fretNum}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center mt-2">
            <div className="w-8 mr-3" />
            <div className="flex">
              {frets.map((fretNum, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center"
                  style={{ width: '64px' }}
                >
                  {fretMarkers.includes(fretNum) && (
                    <div className="flex flex-col items-center">
                      {doubleDotFrets.includes(fretNum) ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-gray-600 mb-1" />
                          <div className="w-2 h-2 rounded-full bg-gray-600" />
                        </>
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-gray-600" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-8 mr-3" />
            <div className="flex">
              {frets.map((fretNum, index) => (
                <div
                  key={index}
                  className="text-center text-xs text-gray-600 font-medium"
                  style={{ width: '64px' }}
                >
                  {fretNum}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
