import React, { useState } from 'react';
import { Problem, QuestionFormat } from '../types/game';

interface QuestionDisplayProps {
  problem: Problem;
  onAnswer: (answer: string | boolean) => void;
  isAnswered: boolean;
  selectedAnswer?: string | boolean;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  problem,
  onAnswer,
  isAnswered,
  selectedAnswer
}) => {
  const [userAnswer, setUserAnswer] = useState<string>('');

  if (!problem) return <div className="text-center text-red-400">No question loaded.</div>;
  if (!problem.format) return <div className="text-center text-red-400">Invalid question format.</div>;

  const renderMultipleChoice = () => (
    <div className="space-y-3">
      {(problem.options || []).map((option) => (
        <button
          key={option.id}
          onClick={() => onAnswer(option.id)}
          disabled={isAnswered}
          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
            selectedAnswer === option.id
              ? 'bg-gradient-to-r from-purple-500/30 to-teal-500/30 border-purple-500/50'
              : 'bg-black/20 border-gray-600 hover:border-teal-500/50'
          } ${isAnswered ? 'cursor-not-allowed' : 'hover:scale-105'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
              selectedAnswer === option.id
                ? 'bg-teal-500 border-teal-500 text-white'
                : 'bg-transparent border-gray-500 text-gray-300'
            }`}>
              {option.id}
            </div>
            <div className="flex-1">
              <div className="text-white font-medium">{option.text}</div>
              {isAnswered && (
                <div className={`text-sm mt-1 ${
                  option.isCorrect ? 'text-green-400' : 'text-red-400'
                }`}>
                  {option.explanation}
                </div>
              )}
            </div>
          </div>
        </button>
      ))}
      {(!problem.options || problem.options.length === 0) && (
        <div className="text-center text-yellow-400">No options available for this question.</div>
      )}
    </div>
  );

  const renderTrueFalse = () => (
    <div className="space-y-3">
      {(problem.options || []).map((option) => (
        <button
          key={option.id}
          onClick={() => onAnswer(option.isCorrect)}
          disabled={isAnswered}
          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
            selectedAnswer === option.isCorrect
              ? 'bg-gradient-to-r from-purple-500/30 to-teal-500/30 border-purple-500/50'
              : 'bg-black/20 border-gray-600 hover:border-teal-500/50'
          } ${isAnswered ? 'cursor-not-allowed' : 'hover:scale-105'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
              selectedAnswer === option.isCorrect
                ? 'bg-teal-500 border-teal-500 text-white'
                : 'bg-transparent border-gray-500 text-gray-300'
            }`}>
              {option.isCorrect ? 'T' : 'F'}
            </div>
            <div className="flex-1">
              <div className="text-white font-medium">{option.text}</div>
              {isAnswered && (
                <div className={`text-sm mt-1 ${
                  option.isCorrect ? 'text-green-400' : 'text-red-400'
                }`}>
                  {option.explanation}
                </div>
              )}
            </div>
          </div>
        </button>
      ))}
      {(!problem.options || problem.options.length === 0) && (
        <div className="text-center text-yellow-400">No true/false statements available for this question.</div>
      )}
    </div>
  );

  const renderFillBlank = () => (
    <div className="space-y-4">
      <div className="text-white text-lg leading-relaxed">
        {problem.question.split('___').map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < problem.question.split('___').length - 1 && (
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={isAnswered}
                className="mx-2 px-3 py-1 bg-white/20 border border-teal-500/50 rounded text-white placeholder-gray-400 focus:outline-none focus:border-teal-400"
                placeholder="Type your answer"
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <button
        onClick={() => onAnswer(userAnswer)}
        disabled={!userAnswer.trim() || isAnswered}
        className="bg-gradient-to-r from-teal-500 to-purple-500 text-white px-6 py-3 rounded-full font-bold hover:from-teal-600 hover:to-purple-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Submit Answer
      </button>
    </div>
  );

  const renderMatching = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-bold text-white mb-3">Questions</h4>
          <div className="space-y-2">
            {(problem.matchingPairs || []).map((pair, index) => (
              <div key={index} className="p-3 bg-black/20 rounded border border-gray-600">
                <span className="text-white">{index + 1}. {pair.question}</span>
              </div>
            ))}
            {(!problem.matchingPairs || problem.matchingPairs.length === 0) && (
              <div className="text-center text-yellow-400">No matching pairs available for this question.</div>
            )}
          </div>
        </div>
        <div>
          <h4 className="text-lg font-bold text-white mb-3">Answers</h4>
          <div className="space-y-2">
            {(problem.matchingPairs || []).map((pair, index) => (
              <div key={index} className="p-3 bg-black/20 rounded border border-gray-600">
                <span className="text-white">{String.fromCharCode(65 + index)}. {pair.answer}</span>
              </div>
            ))}
            {(!problem.matchingPairs || problem.matchingPairs.length === 0) && (
              <div className="text-center text-yellow-400">No matching pairs available for this question.</div>
            )}
          </div>
        </div>
      </div>
      <div className="text-center text-gray-300 text-sm">
        Match each question with its correct answer
      </div>
    </div>
  );

  const renderOrdering = () => (
    <div className="space-y-4">
      <div className="text-white text-lg mb-4">
        Put the following items in the correct order:
      </div>
      <div className="space-y-2">
        {(problem.orderingItems || []).map((item, index) => (
          <div key={index} className="p-3 bg-black/20 rounded border border-gray-600">
            <span className="text-white">{index + 1}. {item}</span>
          </div>
        ))}
        {(!problem.orderingItems || problem.orderingItems.length === 0) && (
          <div className="text-center text-yellow-400">No items to order for this question.</div>
        )}
      </div>
      <div className="text-center text-gray-300 text-sm">
        Review the sequence and determine if it's correct
      </div>
    </div>
  );

  const renderCatchMistake = () => (
    <div className="space-y-4">
      <div className="text-white text-lg mb-4">{problem.question}</div>
      {(problem.steps || []).map((step, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg transition-all ${
            problem.hasError && index === problem.errorStep
              ? 'bg-red-500/30 border border-red-500 animate-pulse'
              : 'bg-white/5'
          }`}
        >
          {step}
        </div>
      ))}
      {(!problem.steps || problem.steps.length === 0) && (
        <div className="text-center text-yellow-400">No solution steps available for this question.</div>
      )}
    </div>
  );

  const renderQuestionContent = () => {
    switch (problem.format) {
      case 'multiple-choice':
        return renderMultipleChoice();
      case 'true-false':
        return renderTrueFalse();
      case 'fill-blank':
        return renderFillBlank();
      case 'matching':
        return renderMatching();
      case 'ordering':
        return renderOrdering();
      case 'catch-mistake':
      default:
        return renderCatchMistake();
    }
  };

  return (
    <div className="space-y-6">
      {/* Topic Display */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm">
          <span>📖</span>
          <span>{problem.topic}</span>
        </div>
      </div>

      {/* Question Content */}
      {renderQuestionContent()}

      {/* Format-specific instructions */}
      <div className="text-center text-gray-400 text-sm">
        {problem.format === 'multiple-choice' && 'Choose the best answer'}
        {problem.format === 'true-false' && 'Determine if each statement is true or false'}
        {problem.format === 'fill-blank' && 'Fill in the missing words'}
        {problem.format === 'matching' && 'Match items with their correct pairs'}
        {problem.format === 'ordering' && 'Review the sequence order'}
        {problem.format === 'catch-mistake' && 'Find errors in the solution or confirm it\'s correct'}
      </div>
    </div>
  );
};

export default QuestionDisplay; 