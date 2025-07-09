import React from 'react';
import { QuestionFormat } from '../types/game';

interface QuestionFormatSelectProps {
  selectedFormat: QuestionFormat;
  onFormatSelect: (format: QuestionFormat) => void;
}

const QuestionFormatSelect: React.FC<QuestionFormatSelectProps> = ({
  selectedFormat,
  onFormatSelect
}) => {
  const formats: { format: QuestionFormat; name: string; description: string; icon: string }[] = [
    {
      format: 'mix',
      name: 'Mix of All',
      description: 'Each question uses a random format',
      icon: '🔀'
    },
    {
      format: 'catch-mistake',
      name: 'Catch the Mistake',
      description: 'Find errors in AI solutions',
      icon: '🔍'
    },
    {
      format: 'multiple-choice',
      name: 'Multiple Choice',
      description: 'Choose the best answer',
      icon: '📝'
    },
    {
      format: 'true-false',
      name: 'True or False',
      description: 'Determine if statements are correct',
      icon: '✅❌'
    },
    {
      format: 'fill-blank',
      name: 'Fill in the Blank',
      description: 'Complete missing words',
      icon: '✏️'
    },
    {
      format: 'matching',
      name: 'Matching',
      description: 'Connect related items',
      icon: '🔗'
    },
    {
      format: 'ordering',
      name: 'Ordering',
      description: 'Put items in correct sequence',
      icon: '📊'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-bold text-white mb-2">Question Format</h3>
        <p className="text-gray-300 text-sm">
          Choose how you want to answer questions
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {formats.map((format) => (
          <button
            key={format.format}
            onClick={() => onFormatSelect(format.format)}
            className={`p-4 rounded-xl border transition-all hover:scale-105 ${
              selectedFormat === format.format
                ? 'bg-gradient-to-r from-purple-500/30 to-teal-500/30 border-purple-500/50'
                : 'bg-black/20 border-gray-600 hover:border-teal-500/50'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">{format.icon}</div>
              <div className="font-bold text-white text-sm mb-1">
                {format.name}
              </div>
              <div className="text-gray-300 text-xs">
                {format.description}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Format Description */}
      <div className="p-4 bg-black/20 rounded-xl border border-teal-500/30">
        <h4 className="font-bold text-white mb-2">
          {formats.find(f => f.format === selectedFormat)?.icon} {formats.find(f => f.format === selectedFormat)?.name}
        </h4>
        <p className="text-gray-300 text-sm">
          {formats.find(f => f.format === selectedFormat)?.description}
        </p>
        
        {/* Additional details for each format */}
        <div className="mt-3 text-xs text-gray-400">
          {selectedFormat === 'mix' && (
            <p>Each question will use a random format (multiple choice, true/false, fill-in-the-blank, etc.).</p>
          )}
          {selectedFormat === 'catch-mistake' && (
            <p>Find errors in step-by-step solutions. Some problems are completely correct!</p>
          )}
          {selectedFormat === 'multiple-choice' && (
            <p>Choose from 4 options. Only one answer is correct!</p>
          )}
          {selectedFormat === 'true-false' && (
            <p>Read statements and determine if they're true or false about the topic.</p>
          )}
          {selectedFormat === 'fill-blank' && (
            <p>Complete sentences by filling in missing words from a word bank.</p>
          )}
          {selectedFormat === 'matching' && (
            <p>Connect items on the left with their correct matches on the right.</p>
          )}
          {selectedFormat === 'ordering' && (
            <p>Put items in the correct sequence or logical order.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionFormatSelect; 