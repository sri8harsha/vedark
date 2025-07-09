import React, { useEffect, useState } from 'react';
import { Trophy, Star, Zap, Target, Gift, Lock, Unlock } from 'lucide-react';
import { Achievement, AIOpponent } from '../types/game';

interface VictoryScreenProps {
  score: number;
  streak: number;
  accuracy: number;
  opponentName: string;
  opponentAvatar: string;
  selectedOpponent?: AIOpponent;
  selectedDifficulty?: string;
  characterProgress?: { [opponentId: string]: { easy: boolean; normal: boolean; hard: boolean; expert: boolean } };
  newAchievements: Achievement[];
  onContinue: () => void;
  onPlayAgain: () => void;
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({
  score,
  streak,
  accuracy,
  opponentName,
  opponentAvatar,
  selectedOpponent,
  selectedDifficulty,
  characterProgress,
  newAchievements,
  onContinue,
  onPlayAgain
}) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showProgression, setShowProgression] = useState(false);

  useEffect(() => {
    // Show progression after initial celebration
    const timer = setTimeout(() => {
      setShowProgression(true);
    }, 1500);

    // Show achievements after progression
    const achievementTimer = setTimeout(() => {
      setShowAchievements(true);
    }, 3000);

    // Hide confetti after animation
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(achievementTimer);
      clearTimeout(confettiTimer);
    };
  }, []);

  const getPerformanceRating = () => {
    if (accuracy >= 90 && streak >= 5) return { rating: 'LEGENDARY', color: 'text-yellow-400', emoji: '👑' };
    if (accuracy >= 80 && streak >= 3) return { rating: 'EXCELLENT', color: 'text-purple-400', emoji: '⭐' };
    if (accuracy >= 70) return { rating: 'GREAT', color: 'text-blue-400', emoji: '🎯' };
    if (accuracy >= 60) return { rating: 'GOOD', color: 'text-green-400', emoji: '👍' };
    return { rating: 'KEEP TRYING', color: 'text-orange-400', emoji: '💪' };
  };

  const performance = getPerformanceRating();

  // Check if this victory completed all difficulties for the character
  const isCharacterCompleted = selectedOpponent && characterProgress && 
    Object.values(characterProgress[selectedOpponent.id] || {}).every(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 text-white flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#fbbf24', '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="text-center max-w-4xl mx-auto">
        {/* Victory Header */}
        <div className="mb-8 animate-pulse">
          <div className="text-8xl mb-4">🏆</div>
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
            VICTORY!
          </h1>
          <div className="text-2xl text-cyan-400 mb-4">
            You defeated {opponentAvatar} {opponentName}!
          </div>
        </div>

        {/* Performance Rating */}
        <div className="mb-8">
          <div className={`text-4xl font-black ${performance.color} mb-2`}>
            {performance.emoji} {performance.rating}
          </div>
          <div className="text-lg text-gray-300">
            Outstanding battle performance!
          </div>
        </div>

        {/* Character Progression */}
        {showProgression && selectedOpponent && characterProgress && (
          <div className="mb-8 animate-fadeIn">
            <div className="bg-gradient-to-r from-purple-500/20 to-teal-500/20 border border-purple-400 rounded-2xl p-6">
              <div className="flex items-center justify-center mb-4">
                <Star className="text-purple-400 mr-2" size={32} />
                <h2 className="text-2xl font-bold text-purple-400">HERO PROGRESSION</h2>
              </div>
              
              <div className="flex items-center justify-center gap-6 mb-4">
                <div className="text-4xl">{selectedOpponent.avatar}</div>
                <div>
                  <div className="text-xl font-bold text-white">{selectedOpponent.character}</div>
                  <div className="text-sm text-gray-300">{selectedDifficulty?.toUpperCase()} DIFFICULTY COMPLETED!</div>
                </div>
              </div>

              {/* Difficulty Badges */}
              <div className="flex justify-center gap-3 mb-4">
                {['easy', 'normal', 'hard', 'expert'].map((diff) => {
                  const isCompleted = characterProgress[selectedOpponent.id]?.[diff] || false;
                  return (
                    <div
                      key={diff}
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 text-lg font-bold ${
                        isCompleted 
                          ? 'bg-yellow-400 text-black border-yellow-400' 
                          : 'bg-gray-800 text-gray-500 border-gray-600'
                      }`}
                      title={diff.charAt(0).toUpperCase() + diff.slice(1)}
                    >
                      {isCompleted ? <Star size={20} className="fill-current" /> : diff.charAt(0).toUpperCase()}
                    </div>
                  );
                })}
              </div>

              {/* Character Completion */}
              {isCharacterCompleted && (
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400 rounded-xl p-4 animate-pulse">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Unlock className="text-yellow-400" size={24} />
                    <span className="text-yellow-400 font-bold text-lg">HERO MASTERED!</span>
                  </div>
                  <div className="text-sm text-yellow-200">
                    You've completed all difficulties for {selectedOpponent.character}! 
                    The next hero is now available!
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-yellow-500/30">
            <Trophy className="mx-auto mb-3 text-yellow-400" size={48} />
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {score.toLocaleString()}
            </div>
            <div className="text-gray-300">Final Score</div>
          </div>

          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-purple-500/30">
            <Zap className="mx-auto mb-3 text-purple-400" size={48} />
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {streak}
            </div>
            <div className="text-gray-300">Best Streak</div>
          </div>

          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-cyan-500/30">
            <Target className="mx-auto mb-3 text-cyan-400" size={48} />
            <div className="text-3xl font-bold text-cyan-400 mb-2">
              {accuracy}%
            </div>
            <div className="text-gray-300">Accuracy</div>
          </div>
        </div>

        {/* New Achievements */}
        {showAchievements && newAchievements.length > 0 && (
          <div className="mb-8 animate-fadeIn">
            <div className="bg-gradient-to-r from-yellow-500/20 to-pink-500/20 border border-yellow-400 rounded-2xl p-6">
              <div className="flex items-center justify-center mb-4">
                <Gift className="text-yellow-400 mr-2" size={32} />
                <h2 className="text-2xl font-bold text-yellow-400">NEW ACHIEVEMENTS!</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {newAchievements.map((achievement) => (
                  <div key={achievement.id} className="bg-black/30 rounded-lg p-4 border border-yellow-400/50">
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <div className="font-bold text-yellow-400 mb-1">{achievement.name}</div>
                    <div className="text-sm text-gray-300 mb-2">{achievement.description}</div>
                    <div className="text-xs text-cyan-400">
                      Reward: {achievement.reward.type === 'opponent' ? 'New Opponent Unlocked!' : 'Power-ups Earned!'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Opponent Reaction */}
        <div className="mb-8">
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6">
            <div className="text-4xl mb-3">{opponentAvatar}</div>
            <div className="text-lg text-red-400 font-bold mb-2">{opponentName} says:</div>
            <div className="text-gray-300 italic">
              "You've earned my respect! Well fought, young hero!"
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <button
            onClick={onPlayAgain}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 shadow-lg"
          >
            ⚔️ BATTLE AGAIN
          </button>
          
          <button
            onClick={onContinue}
            className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-purple-700 hover:to-cyan-700 transition-all transform hover:scale-105 shadow-lg"
          >
            🚀 CONTINUE JOURNEY
          </button>
        </div>

        {/* Bonus XP Animation */}
        <div className="mt-8 text-center">
          <div className="text-sm text-gray-400 mb-2">BONUS XP EARNED</div>
          <div className="text-2xl font-bold text-green-400 animate-pulse">
            +{Math.floor(score / 10)} XP
          </div>
        </div>
      </div>

      {/* Floating Stars */}
      {Array.from({ length: 20 }, (_, i) => (
        <Star
          key={i}
          className="absolute text-yellow-400 animate-pulse pointer-events-none"
          size={Math.random() * 20 + 10}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  );
};

export default VictoryScreen;