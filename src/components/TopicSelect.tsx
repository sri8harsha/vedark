import React, { useState, useEffect } from 'react';
import { Topic, getTopicsByGradeAndSubject, getRandomTopic } from '../data/topics';

interface TopicSelectProps {
  grade: number;
  subject: string;
  difficulty: string;
  onTopicSelect: (topic: Topic | null) => void;
  selectedTopic: Topic | null;
}

const TopicSelect: React.FC<TopicSelectProps> = ({
  grade,
  subject,
  difficulty,
  onTopicSelect,
  selectedTopic
}) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [showTopicList, setShowTopicList] = useState(false);
  const [autoMode, setAutoMode] = useState(true);

  useEffect(() => {
    const availableTopics = getTopicsByGradeAndSubject(grade, subject);
    setTopics(availableTopics);
    // Auto mode: always pick a random topic if nothing is selected
    if (autoMode && availableTopics.length > 0) {
      const randomTopic = getRandomTopic(grade, subject);
      onTopicSelect(randomTopic);
    }
    // If user deselects a topic, revert to auto mode
    if (!autoMode && !selectedTopic && availableTopics.length > 0) {
      setAutoMode(true);
      onTopicSelect(getRandomTopic(grade, subject));
    }
  }, [grade, subject, autoMode, onTopicSelect]);

  const handleAutoModeToggle = () => {
    setAutoMode(true);
    if (topics.length > 0) {
      onTopicSelect(getRandomTopic(grade, subject));
    }
    setShowTopicList(false);
  };

  const handleTopicSelect = (topic: Topic) => {
    setAutoMode(false);
    onTopicSelect(topic);
    setShowTopicList(false);
  };

  // Show all topics for grade/subject, not filtered by difficulty
  const filteredTopics = topics;

  return (
    <div className="space-y-4">
      {/* Mode Selection */}
      <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-teal-500/30">
        <div>
          <h3 className="text-lg font-bold text-white mb-2">Topic Selection</h3>
          <p className="text-gray-300 text-sm">
            Choose how you want to learn {subject} for Grade {grade}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleAutoModeToggle}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              autoMode
                ? 'bg-gradient-to-r from-purple-500 to-teal-500 text-white'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
          >
            🎲 Auto Mode
          </button>
          <button
            onClick={() => {
              setAutoMode(false);
              setShowTopicList(!showTopicList);
            }}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              !autoMode
                ? 'bg-gradient-to-r from-teal-500 to-purple-500 text-white'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
          >
            📚 Choose Topic
          </button>
        </div>
      </div>

      {/* Current Topic Display */}
      {selectedTopic && (
        <div className="p-4 bg-gradient-to-r from-purple-500/20 to-teal-500/20 rounded-xl border border-purple-500/30">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-lg font-bold text-white mb-2">
                📖 {selectedTopic.name}
              </h4>
              <p className="text-gray-300 text-sm mb-3">
                {selectedTopic.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedTopic.examples.slice(0, 2).map((example, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white/10 rounded-full text-xs text-gray-300"
                  >
                    {example}
                  </span>
                ))}
              </div>
            </div>
            <div className="ml-4 text-right">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                selectedTopic.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                selectedTopic.difficulty === 'normal' ? 'bg-blue-500/20 text-blue-300' :
                selectedTopic.difficulty === 'hard' ? 'bg-orange-500/20 text-orange-300' :
                'bg-red-500/20 text-red-300'
              }`}>
                {selectedTopic.difficulty.toUpperCase()}
              </div>
              {autoMode && (
                <div className="text-xs text-gray-400 mt-2">
                  🎲 Auto-selected
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Topic List */}
      {showTopicList && !autoMode && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <h4 className="text-lg font-bold text-white mb-3">
            Choose a {subject} topic for Grade {grade}:
          </h4>
          {filteredTopics.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-4">📚</div>
              <p>No topics available for this grade and subject.</p>
              <p className="text-sm">Check your topic database.</p>
            </div>
          ) : (
            filteredTopics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => handleTopicSelect(topic)}
                className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-105 ${
                  selectedTopic?.id === topic.id
                    ? 'bg-gradient-to-r from-purple-500/30 to-teal-500/30 border-purple-500/50'
                    : 'bg-black/20 border-gray-600 hover:border-teal-500/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-bold text-white mb-2">{topic.name}</h5>
                    <p className="text-gray-300 text-sm mb-3">{topic.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {topic.examples.slice(0, 2).map((example, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-white/10 rounded-full text-xs text-gray-300"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${
                    topic.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                    topic.difficulty === 'normal' ? 'bg-blue-500/20 text-blue-300' :
                    topic.difficulty === 'hard' ? 'bg-orange-500/20 text-orange-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {topic.difficulty.toUpperCase()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-sm text-gray-400">
        {autoMode ? (
          <p>🎲 Topics will be randomly selected for variety and comprehensive learning</p>
        ) : (
          <p>📚 Choose a specific topic to focus your learning experience</p>
        )}
      </div>
    </div>
  );
};

export default TopicSelect; 