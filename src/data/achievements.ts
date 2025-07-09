import { Achievement } from '../types/game';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-victory',
    name: 'First Victory',
    description: 'Win your first battle!',
    icon: '🏆',
    requirement: { type: 'battles', value: 1 },
    reward: { type: 'opponent', value: 'spider-man' },
    unlocked: false,
    progress: 0
  },
  {
    id: 'streak-master',
    name: 'Streak Master',
    description: 'Get a 5-question streak!',
    icon: '🔥',
    requirement: { type: 'streak', value: 5 },
    reward: { type: 'powerup', value: 'extraTime' },
    unlocked: false,
    progress: 0
  },
  {
    id: 'mistake-hunter',
    name: 'Mistake Hunter',
    description: 'Catch 25 AI mistakes!',
    icon: '🕵️',
    requirement: { type: 'opponents', value: 25 },
    reward: { type: 'opponent', value: 'batman' },
    unlocked: false,
    progress: 0
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Answer 10 questions in under 5 seconds each!',
    icon: '⚡',
    requirement: { type: 'speed', value: 10 },
    reward: { type: 'powerup', value: 'slowTime' },
    unlocked: false,
    progress: 0
  },
  {
    id: 'perfect-game',
    name: 'Perfect Game',
    description: 'Complete a battle with 100% accuracy!',
    icon: '💎',
    requirement: { type: 'accuracy', value: 100 },
    reward: { type: 'opponent', value: 'wonder-woman' },
    unlocked: false,
    progress: 0
  },
  {
    id: 'high-scorer',
    name: 'High Scorer',
    description: 'Score 5000 points in a single battle!',
    icon: '🎯',
    requirement: { type: 'score', value: 5000 },
    reward: { type: 'opponent', value: 'hulk' },
    unlocked: false,
    progress: 0
  },
  {
    id: 'battle-veteran',
    name: 'Battle Veteran',
    description: 'Win 10 battles!',
    icon: '⚔️',
    requirement: { type: 'battles', value: 10 },
    reward: { type: 'opponent', value: 'captain-america' },
    unlocked: false,
    progress: 0
  },
  {
    id: 'math-wizard',
    name: 'Math Wizard',
    description: 'Maintain 90% accuracy over 50 questions!',
    icon: '🧙‍♂️',
    requirement: { type: 'accuracy', value: 90 },
    reward: { type: 'opponent', value: 'doctor-strange' },
    unlocked: false,
    progress: 0
  },
  {
    id: 'ultimate-champion',
    name: 'Ultimate Champion',
    description: 'Defeat all opponents!',
    icon: '👑',
    requirement: { type: 'opponents', value: 8 },
    reward: { type: 'opponent', value: 'thanos' },
    unlocked: false,
    progress: 0
  }
];