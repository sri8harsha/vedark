import React, { useState, useEffect } from 'react';
import { Lock, Star, Zap, Trophy, ArrowLeft, Swords } from 'lucide-react';
import { AIOpponent } from '../types/game';
import { AI_OPPONENTS } from '../data/opponents';

interface OpponentSelectProps {
  playerLevel: number;
  unlockedOpponents: string[];
  characterProgress: { [opponentId: string]: { easy: boolean; normal: boolean; hard: boolean; expert: boolean } };
  onSelectOpponent: (opponent: AIOpponent) => void;
  onBack: () => void;
}

const OpponentSelect: React.FC<OpponentSelectProps> = ({
  playerLevel,
  unlockedOpponents,
  characterProgress,
  onSelectOpponent,
  onBack
}) => {
  const [selectedOpponent, setSelectedOpponent] = useState<AIOpponent | null>(null);
  const [hoveredOpponent, setHoveredOpponent] = useState<string | null>(null);

  const isUnlocked = (opponentId: string) => unlockedOpponents.includes(opponentId);

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'text-emerald-400';
    if (difficulty <= 3) return 'text-yellow-400';
    if (difficulty <= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 2) return 'Rookie';
    if (difficulty <= 3) return 'Veteran';
    if (difficulty <= 4) return 'Elite';
    return 'Legendary';
  };

  const handleOpponentClick = (opponent: AIOpponent) => {
    if (isUnlocked(opponent.id)) {
      setSelectedOpponent(opponent);
    }
  };

  const handleBattleStart = () => {
    if (selectedOpponent) {
      onSelectOpponent(selectedOpponent);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-teal-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <Swords className="text-teal-400" size={40} />
            <h1 className="text-5xl font-black bg-gradient-to-r from-purple-400 via-teal-400 to-purple-400 bg-clip-text text-transparent">
              CHOOSE YOUR OPPONENT
            </h1>
            <Swords className="text-teal-400 scale-x-[-1]" size={40} />
          </div>
          
          <p className="text-xl text-gray-300 mb-6">Select a worthy adversary for an epic battle!</p>
          
          <div className="flex items-center justify-center gap-8 text-lg">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-400" size={24} />
              <span className="text-yellow-400 font-bold">Level {playerLevel}</span>
            </div>
            <div className="w-px h-6 bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <Star className="text-green-400" size={24} />
              <span className="text-green-400 font-bold">{unlockedOpponents.length}/8 Unlocked</span>
            </div>
          </div>
        </div>

        {/* Opponents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {AI_OPPONENTS.map((opponent, idx) => {
            // Only unlock if previous character is fully completed and playerLevel >= unlockLevel
            let unlocked = false;
            if (opponent.unlockLevel === 1) {
              unlocked = true;
            } else {
              const prevOpponent = AI_OPPONENTS[idx - 1];
              const prevProgress = characterProgress[prevOpponent.id] || { easy: false, normal: false, hard: false, expert: false };
              const prevCompleted = Object.values(prevProgress).every(Boolean);
              unlocked = prevCompleted && playerLevel >= opponent.unlockLevel;
            }
            const isSelected = selectedOpponent?.id === opponent.id;
            const isHovered = hoveredOpponent === opponent.id;
            const progress = characterProgress[opponent.id] || { easy: false, normal: false, hard: false, expert: false };
            const completedCount = Object.values(progress).filter(Boolean).length;
            return (
              <div
                key={opponent.id}
                className={`relative group transition-all duration-500 transform ${
                  unlocked ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'
                } ${isSelected ? 'scale-105' : ''}`}
                onMouseEnter={() => unlocked && setHoveredOpponent(opponent.id)}
                onMouseLeave={() => setHoveredOpponent(null)}
                onClick={() => handleOpponentClick(opponent)}
              >
                {/* Card Container */}
                <div className={`
                  relative h-80 rounded-3xl border-2 transition-all duration-500 overflow-hidden
                  ${unlocked 
                    ? `bg-black/80 border-2 border-transparent shadow-xl
                        before:content-[''] before:absolute before:inset-0 before:rounded-3xl before:pointer-events-none
                        before:bg-gradient-to-br before:from-black before:via-${opponent.theme.primary.split(' ')[0]} before:to-black
                        after:content-[''] after:absolute after:inset-0 after:rounded-3xl after:pointer-events-none
                        after:bg-gradient-to-br after:from-transparent after:to-${opponent.theme.primary.split(' ')[1]} after:opacity-40
                        ${isSelected ? `ring-4 ${opponent.theme.accent}/80 border-${opponent.theme.accent.replace('text-', '')} shadow-2xl shadow-${opponent.theme.accent.replace('text-', '')}/30` : ''}`
                    : 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 opacity-60'
                  }
                `}>
                  {/* Lock Overlay */}
                  {!unlocked && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center z-20">
                      <div className="bg-gray-700/50 rounded-full p-4 mb-4">
                        <Lock size={32} className="text-gray-400" />
                      </div>
                      <p className="text-gray-300 font-bold text-lg">Level {opponent.unlockLevel}</p>
                      <p className="text-gray-500 text-sm">Required</p>
                    </div>
                  )}
                  {/* Character Content */}
                  <div className="relative z-10 p-6 h-full flex flex-col">
                    {/* Avatar */}
                    <div className="text-center mb-4">
                      <div className={`text-6xl mb-3 transition-all duration-300 ${
                        isHovered && unlocked ? 'scale-110 animate-bounce' : ''
                      } ${!unlocked ? 'grayscale' : ''}`}>
                        {opponent.avatar}
                      </div>
                      <h3 className={`text-xl font-bold mb-1 ${unlocked ? 'text-white' : 'text-gray-500'}`}>{opponent.character}</h3>
                      <p className={`text-sm ${unlocked ? 'text-gray-200' : 'text-gray-600'}`}>{opponent.name}</p>
                    </div>
                    {/* Difficulty Badges */}
                    <div className="flex justify-center gap-2 mb-4">
                      {['easy', 'normal', 'hard', 'expert'].map((diff, i) => (
                        <div
                          key={diff}
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-lg font-bold ${
                            progress[diff] ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-gray-800 text-gray-500 border-gray-600'
                          }`}
                          title={diff.charAt(0).toUpperCase() + diff.slice(1)}
                        >
                          {progress[diff] ? <Star size={18} className="fill-current" /> : ['E','N','H','X'][i]}
                        </div>
                      ))}
                    </div>
                    {/* Stats */}
                    <div className="mt-auto space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${unlocked ? 'text-gray-300' : 'text-gray-600'}`}>Power Level:</span>
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < opponent.difficulty 
                                ? (unlocked ? 'text-yellow-400 fill-current' : 'text-gray-600 fill-current') 
                                : 'text-gray-600'
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${unlocked ? 'text-gray-300' : 'text-gray-600'}`}>Unlock:</span>
                        <span className={`text-sm font-bold ${unlocked ? 'text-cyan-400' : 'text-gray-500'}`}>Level {opponent.unlockLevel}</span>
                      </div>
                    </div>
                  </div>
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute -top-3 -right-3 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold animate-pulse z-30 shadow-lg">
                      SELECTED
                    </div>
                  )}
                  {/* Hover Glow Effect */}
                  {isHovered && unlocked && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-400/10 rounded-3xl animate-pulse" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* Progress Bar */}
        <div className="w-full max-w-2xl mx-auto mb-8">
          <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-4 bg-gradient-to-r from-yellow-400 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((Object.values(characterProgress).filter(p => Object.values(p).filter(Boolean).length === 4).length / 8) * 100)}%` }}
            ></div>
          </div>
          <div className="text-center text-sm text-gray-300 mt-2">
            {Object.values(characterProgress).filter(p => Object.values(p).filter(Boolean).length === 4).length} / 8 Characters Completed
          </div>
        </div>

        {/* Selected Opponent Details */}
        {selectedOpponent && (
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/30 mb-8 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Character Info */}
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                  <div className="text-8xl animate-pulse">{selectedOpponent.avatar}</div>
                  <div>
                    <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                      {selectedOpponent.character}
                    </h2>
                    <p className="text-xl text-gray-300">{selectedOpponent.name}</p>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-6 leading-relaxed">{selectedOpponent.backstory}</p>
                
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
                    <Zap size={20} />
                    Battle Preview
                  </h3>
                  <p className="text-sm text-gray-300">
                    {selectedOpponent.character} specializes in {selectedOpponent.mistakePatterns.join(', ')}. 
                    Stay sharp and catch their mistakes to claim victory!
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30">
                  <Zap className="mx-auto mb-2 text-yellow-400" size={32} />
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">Difficulty</div>
                    <div className={`font-bold text-lg ${getDifficultyColor(selectedOpponent.difficulty)}`}>
                      {getDifficultyLabel(selectedOpponent.difficulty)}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-4 border border-cyan-500/30">
                  <Trophy className="mx-auto mb-2 text-cyan-400" size={32} />
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">Unlock Level</div>
                    <div className="font-bold text-lg text-cyan-400">{selectedOpponent.unlockLevel}</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30 col-span-2">
                  <Star className="mx-auto mb-2 text-purple-400" size={32} />
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">Specialty Attacks</div>
                    <div className="font-bold text-purple-400 text-sm">
                      {selectedOpponent.mistakePatterns.join(' • ')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          <button
            onClick={onBack}
            className="flex items-center gap-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            <ArrowLeft size={24} />
            Back to Setup
          </button>
          
          <button
            onClick={handleBattleStart}
            disabled={!selectedOpponent}
            className={`flex items-center gap-3 px-12 py-4 rounded-full font-bold text-xl transition-all transform shadow-2xl ${
                              selectedOpponent
                  ? 'bg-gradient-to-r from-purple-600 via-teal-600 to-purple-600 hover:from-purple-700 hover:via-teal-700 hover:to-purple-700 text-white hover:scale-105 animate-pulse'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Swords size={24} />
            {selectedOpponent 
              ? `BATTLE ${selectedOpponent.character.toUpperCase()}!`
              : 'SELECT AN OPPONENT FIRST!'
            }
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="mt-12 text-center">
          <div className="text-sm text-gray-400 mb-3">Opponent Unlock Progress</div>
          <div className="w-full max-w-md mx-auto bg-gray-800/50 rounded-full h-4 border border-gray-700">
            <div 
              className="bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400 h-4 rounded-full transition-all duration-1000 shadow-lg"
              style={{ width: `${(unlockedOpponents.length / AI_OPPONENTS.length) * 100}%` }}
            />
          </div>
          <div className="text-sm text-cyan-400 mt-2 font-medium">
            {unlockedOpponents.length} of {AI_OPPONENTS.length} heroes unlocked
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpponentSelect;