import { PlayerProfile, Achievement } from '../types/game';
import { ACHIEVEMENTS } from '../data/achievements';

const STORAGE_KEY = 'battle-mode-profile';

export class GameStorage {
  static getPlayerProfile(): PlayerProfile {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const profile = JSON.parse(stored);
        // Ensure all required fields exist
        return {
          id: profile.id || 'player-1',
          name: profile.name || 'Hero',
          level: profile.level || 1,
          totalScore: profile.totalScore || 0,
          battlesWon: profile.battlesWon || 0,
          battlesPlayed: profile.battlesPlayed || 0,
          bestStreak: profile.bestStreak || 0,
          unlockedOpponents: profile.unlockedOpponents || ['iron-man'],
          unlockedAchievements: profile.unlockedAchievements || [],
          powerUps: profile.powerUps || { extraTime: 3, hint: 2, skip: 1 },
          preferences: {
            soundEnabled: profile.preferences?.soundEnabled ?? true,
            difficulty: profile.preferences?.difficulty || 'normal',
            favoriteSubject: profile.preferences?.favoriteSubject || 'math'
          },
          stats: {
            averageResponseTime: profile.stats?.averageResponseTime || 15,
            accuracyRate: profile.stats?.accuracyRate || 0,
            mistakesCaught: profile.stats?.mistakesCaught || 0,
            perfectGames: profile.stats?.perfectGames || 0
          },
          // New: characterProgress
          characterProgress: profile.characterProgress || { 'iron-man': { easy: false, normal: false, hard: false, expert: false } }
        };
      } catch (error) {
        console.error('Error parsing stored profile:', error);
      }
    }

    // Return default profile
    return {
      id: 'player-1',
      name: 'Hero',
      level: 1,
      totalScore: 0,
      battlesWon: 0,
      battlesPlayed: 0,
      bestStreak: 0,
      unlockedOpponents: ['iron-man'],
      unlockedAchievements: [],
      powerUps: { extraTime: 3, hint: 2, skip: 1 },
      preferences: {
        soundEnabled: true,
        difficulty: 'normal',
        favoriteSubject: 'math'
      },
      stats: {
        averageResponseTime: 15,
        accuracyRate: 0,
        mistakesCaught: 0,
        perfectGames: 0
      },
      // New: characterProgress
      characterProgress: { 'iron-man': { easy: false, normal: false, hard: false, expert: false } }
    };
  }

  static savePlayerProfile(profile: PlayerProfile): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }

  static updateBattleStats(
    profile: PlayerProfile,
    battleResult: {
      won: boolean;
      score: number;
      streak: number;
      accuracy: number;
      averageTime: number;
      mistakesCaught: number;
    }
  ): PlayerProfile {
    const updatedProfile = { ...profile };
    
    // Update basic stats
    updatedProfile.battlesPlayed += 1;
    if (battleResult.won) {
      updatedProfile.battlesWon += 1;
    }
    
    updatedProfile.totalScore += battleResult.score;
    updatedProfile.bestStreak = Math.max(updatedProfile.bestStreak, battleResult.streak);
    
    // Update detailed stats
    updatedProfile.stats.averageResponseTime = 
      (updatedProfile.stats.averageResponseTime * 0.8) + (battleResult.averageTime * 0.2);
    updatedProfile.stats.accuracyRate = 
      (updatedProfile.stats.accuracyRate * 0.8) + (battleResult.accuracy * 0.2);
    updatedProfile.stats.mistakesCaught += battleResult.mistakesCaught;
    
    if (battleResult.accuracy === 100) {
      updatedProfile.stats.perfectGames += 1;
    }
    
    // Calculate new level
    const newLevel = Math.floor(updatedProfile.totalScore / 1000) + 1;
    updatedProfile.level = Math.max(updatedProfile.level, newLevel);
    
    return updatedProfile;
  }

  static checkAchievements(profile: PlayerProfile): Achievement[] {
    const newAchievements: Achievement[] = [];
    
    ACHIEVEMENTS.forEach(achievement => {
      if (profile.unlockedAchievements.includes(achievement.id)) {
        return; // Already unlocked
      }
      
      let currentProgress = 0;
      let isUnlocked = false;
      
      switch (achievement.requirement.type) {
        case 'battles':
          currentProgress = profile.battlesWon;
          isUnlocked = currentProgress >= achievement.requirement.value;
          break;
        case 'streak':
          currentProgress = profile.bestStreak;
          isUnlocked = currentProgress >= achievement.requirement.value;
          break;
        case 'score':
          currentProgress = profile.totalScore;
          isUnlocked = currentProgress >= achievement.requirement.value;
          break;
        case 'accuracy':
          currentProgress = Math.round(profile.stats.accuracyRate);
          isUnlocked = currentProgress >= achievement.requirement.value;
          break;
        case 'speed':
          currentProgress = profile.stats.averageResponseTime <= 5 ? 10 : 0;
          isUnlocked = currentProgress >= achievement.requirement.value;
          break;
        case 'opponents':
          currentProgress = profile.stats.mistakesCaught;
          isUnlocked = currentProgress >= achievement.requirement.value;
          break;
      }
      
      if (isUnlocked) {
        const unlockedAchievement = {
          ...achievement,
          unlocked: true,
          progress: achievement.requirement.value
        };
        newAchievements.push(unlockedAchievement);
      }
    });
    
    return newAchievements;
  }

  static applyAchievementRewards(profile: PlayerProfile, achievements: Achievement[]): PlayerProfile {
    const updatedProfile = { ...profile };
    
    achievements.forEach(achievement => {
      if (!updatedProfile.unlockedAchievements.includes(achievement.id)) {
        updatedProfile.unlockedAchievements.push(achievement.id);
        
        // Apply rewards
        switch (achievement.reward.type) {
          case 'opponent':
            if (!updatedProfile.unlockedOpponents.includes(achievement.reward.value)) {
              updatedProfile.unlockedOpponents.push(achievement.reward.value);
            }
            break;
          case 'powerup':
            const powerUpId = achievement.reward.value;
            updatedProfile.powerUps[powerUpId] = (updatedProfile.powerUps[powerUpId] || 0) + 3;
            break;
        }
      }
    });
    
    return updatedProfile;
  }

  static resetProgress(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}