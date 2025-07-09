import React from 'react';
import { Trophy, Star, Lock, CheckCircle } from 'lucide-react';
import { Achievement } from '../types/game';
import { ACHIEVEMENTS } from '../data/achievements';

interface AchievementPanelProps {
  unlockedAchievements: string[];
  playerStats: {
    battlesWon: number;
    bestStreak: number;
    totalScore: number;
    accuracyRate: number;
    mistakesCaught: number;
  };
  onClose: () => void;
}

const AchievementPanel: React.FC<AchievementPanelProps> = ({
  unlockedAchievements,
  playerStats,
  onClose
}) => {
  const calculateProgress = (achievement: Achievement): number => {
    switch (achievement.requirement.type) {
      case 'battles':
        return Math.min(playerStats.battlesWon, achievement.requirement.value);
      case 'streak':
        return Math.min(playerStats.bestStreak, achievement.requirement.value);
      case 'score':
        return Math.min(playerStats.totalScore, achievement.requirement.value);
      case 'accuracy':
        return Math.min(Math.round(playerStats.accuracyRate), achievement.requirement.value);
      case 'opponents':
        return Math.min(playerStats.mistakesCaught, achievement.requirement.value);
      case 'speed':
        return playerStats.battlesWon >= 10 ? achievement.requirement.value : 0;
      default:
        return 0;
    }
  };

  const getProgressPercentage = (achievement: Achievement): number => {
    const progress = calculateProgress(achievement);
    return Math.min((progress / achievement.requirement.value) * 100, 100);
  };

  const isUnlocked = (achievementId: string): boolean => {
    return unlockedAchievements.includes(achievementId);
  };

  const getRewardDescription = (achievement: Achievement): string => {
    switch (achievement.reward.type) {
      case 'opponent':
        return `Unlock ${achievement.reward.value.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
      case 'powerup':
        return `Get 3x ${achievement.reward.value} power-ups`;
      case 'theme':
        return `Unlock ${achievement.reward.value} theme`;
      case 'title':
        return `Earn "${achievement.reward.value}" title`;
      default:
        return 'Special reward';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-cyan-500/30">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
            🏆 ACHIEVEMENTS
          </h2>
          <div className="text-xl text-cyan-400">
            Unlocked: {unlockedAchievements.length}/{ACHIEVEMENTS.length}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 mt-2">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-pink-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(unlockedAchievements.length / ACHIEVEMENTS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = isUnlocked(achievement.id);
            const progress = calculateProgress(achievement);
            const progressPercentage = getProgressPercentage(achievement);
            
            return (
              <div
                key={achievement.id}
                className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                  unlocked 
                    ? 'bg-gradient-to-br from-yellow-500/20 to-pink-500/20 border-yellow-400 shadow-lg shadow-yellow-400/25'
                    : 'bg-gray-800/50 border-gray-600'
                }`}
              >
                {/* Achievement Icon */}
                <div className="text-center mb-4">
                  <div className={`text-5xl mb-2 ${unlocked ? 'animate-pulse' : 'grayscale'}`}>
                    {achievement.icon}
                  </div>
                  <h3 className={`text-xl font-bold mb-1 ${unlocked ? 'text-yellow-400' : 'text-gray-400'}`}>
                    {achievement.name}
                  </h3>
                  <p className="text-sm text-gray-300">{achievement.description}</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className={unlocked ? 'text-yellow-400' : 'text-gray-400'}>
                      {progress}/{achievement.requirement.value}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        unlocked 
                          ? 'bg-gradient-to-r from-yellow-400 to-pink-400' 
                          : 'bg-gradient-to-r from-gray-500 to-gray-600'
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Reward */}
                <div className="bg-black/30 rounded-lg p-3 mb-4">
                  <div className="text-xs text-gray-400 mb-1">REWARD</div>
                  <div className={`text-sm font-bold ${unlocked ? 'text-cyan-400' : 'text-gray-500'}`}>
                    {getRewardDescription(achievement)}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="absolute -top-2 -right-2">
                  {unlocked ? (
                    <div className="bg-yellow-400 text-black p-2 rounded-full">
                      <CheckCircle size={16} />
                    </div>
                  ) : (
                    <div className="bg-gray-600 text-gray-400 p-2 rounded-full">
                      <Lock size={16} />
                    </div>
                  )}
                </div>

                {/* Completion Effect */}
                {unlocked && (
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-pink-400/10 rounded-xl animate-pulse" />
                )}
              </div>
            );
          })}
        </div>

        {/* Stats Summary */}
        <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 mb-6">
          <h3 className="text-2xl font-bold text-center mb-4 text-cyan-400">📊 Your Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{playerStats.battlesWon}</div>
              <div className="text-sm text-gray-400">Battles Won</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{playerStats.bestStreak}</div>
              <div className="text-sm text-gray-400">Best Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{playerStats.totalScore.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Total Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{Math.round(playerStats.accuracyRate)}%</div>
              <div className="text-sm text-gray-400">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{playerStats.mistakesCaught}</div>
              <div className="text-sm text-gray-400">Mistakes Caught</div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-3 rounded-full font-bold hover:from-gray-700 hover:to-gray-800 transition-all"
          >
            ✨ CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementPanel;