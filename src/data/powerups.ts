import { PowerUp } from '../types/game';

export const POWER_UPS: PowerUp[] = [
  {
    id: 'extraTime',
    name: 'Extra Time',
    description: 'Add 10 seconds to the timer',
    icon: '⏰',
    cost: 100,
    effect: 'extraTime',
    duration: 0
  },
  {
    id: 'hint',
    name: 'Hint Reveal',
    description: 'Reveal a helpful hint',
    icon: '💡',
    cost: 150,
    effect: 'hint',
    duration: 0
  },
  {
    id: 'skip',
    name: 'Skip Question',
    description: 'Skip this question without penalty',
    icon: '⏭️',
    cost: 200,
    effect: 'skip',
    duration: 0
  },
  {
    id: 'doublePoints',
    name: 'Double Points',
    description: 'Double points for next 3 questions',
    icon: '✨',
    cost: 250,
    effect: 'doublePoints',
    duration: 3
  },
  {
    id: 'slowTime',
    name: 'Slow Time',
    description: 'Timer runs at half speed for 30 seconds',
    icon: '🐌',
    cost: 300,
    effect: 'slowTime',
    duration: 30
  }
];