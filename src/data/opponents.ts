import { AIOpponent } from '../types/game';

export const AI_OPPONENTS: AIOpponent[] = [
  {
    id: 'iron-man',
    name: 'Tony Stark',
    character: 'Iron Man',
    personality: 'Genius billionaire who sometimes overcomplicates simple problems',
    avatar: '⚡',
    unlockLevel: 1,
    mistakePatterns: ['overcomplicated solutions', 'unit conversion errors', 'decimal precision'],
    difficulty: 1,
    backstory: 'Tony Stark\'s AI assistant J.A.R.V.I.S. has a bug in its calculation matrix!',
    reactions: {
      victory: ['🎯 My calculations were flawless!', '⚡ That\'s the power of Stark tech!', '🚀 I am inevitable!'],
      defeat: ['🤔 Impossible! Let me recalibrate...', '⚙️ There must be a bug in my system!', '💡 You\'re smarter than I calculated!'],
      mistake: ['🔧 Oops, even genius makes errors!', '⚡ That\'s what I get for rushing!', '🤖 System error detected!'],
      correct: ['✨ Perfect as always!', '🎯 Stark precision at its finest!', '⚡ That\'s how it\'s done!']
    },
    theme: {
      primary: 'from-red-600 to-yellow-500',
      secondary: 'from-yellow-400 to-red-400',
      accent: 'text-yellow-400'
    }
  },
  {
    id: 'spider-man',
    name: 'Peter Parker',
    character: 'Spider-Man',
    personality: 'Friendly neighborhood hero who sometimes gets distracted',
    avatar: '🕸️',
    unlockLevel: 2,
    mistakePatterns: ['rushed calculations', 'sign errors', 'forgotten steps'],
    difficulty: 2,
    backstory: 'Spider-Man is swinging through problems but his spider-sense is tingling with mistakes!',
    reactions: {
      victory: ['🕸️ My spider-sense was right!', '🎯 With great power comes great math!', '🚀 Thwip! Got it right!'],
      defeat: ['😅 My spider-sense failed me!', '🕷️ Even spiders make mistakes!', '💫 You\'ve got better reflexes than me!'],
      mistake: ['🤦‍♂️ Aw man, I rushed again!', '🕸️ My web of logic got tangled!', '😬 That\'s embarrassing...'],
      correct: ['🕷️ Spider-sense activated!', '🎯 Bullseye with math!', '⚡ Spidey skills!']
    },
    theme: {
      primary: 'from-red-500 to-blue-600',
      secondary: 'from-blue-400 to-red-500',
      accent: 'text-red-400'
    }
  },
  {
    id: 'batman',
    name: 'Bruce Wayne',
    character: 'Batman',
    personality: 'Dark knight who overthinks and makes logical errors',
    avatar: '🦇',
    unlockLevel: 3,
    mistakePatterns: ['logical fallacies', 'assumption errors', 'complex reasoning mistakes'],
    difficulty: 3,
    backstory: 'The World\'s Greatest Detective faces his toughest case: avoiding calculation mistakes!',
    reactions: {
      victory: ['🦇 Justice is served!', '🌃 Gotham\'s finest detective work!', '⚡ I am the night... and I\'m right!'],
      defeat: ['😤 This isn\'t over!', '🦇 Even Batman has off nights...', '🌃 You\'ve earned Gotham\'s respect!'],
      mistake: ['😠 Curse these calculation errors!', '🦇 My detective work failed me!', '🌃 The night got the better of me...'],
      correct: ['🦇 Perfect detective work!', '⚡ Justice prevails!', '🌃 Gotham can sleep safely!']
    },
    theme: {
      primary: 'from-gray-800 to-yellow-500',
      secondary: 'from-yellow-400 to-gray-700',
      accent: 'text-yellow-400'
    }
  },
  {
    id: 'wonder-woman',
    name: 'Diana Prince',
    character: 'Wonder Woman',
    personality: 'Amazonian warrior who sometimes uses brute force over finesse',
    avatar: '⚔️',
    unlockLevel: 4,
    mistakePatterns: ['formula confusion', 'unit mistakes', 'rounding errors'],
    difficulty: 3,
    backstory: 'The Amazonian Princess brings warrior strength to math battles!',
    reactions: {
      victory: ['⚔️ Victory for Themyscira!', '✨ The gods favor truth!', '🏆 Amazonian precision!'],
      defeat: ['😤 A worthy opponent!', '⚔️ You fight with honor!', '✨ The truth has spoken!'],
      mistake: ['😅 Even warriors stumble!', '⚔️ My sword was sharper than my math!', '✨ Hera help me!'],
      correct: ['⚔️ Flawless as an Amazon!', '✨ Truth and justice!', '🏆 Divine accuracy!']
    },
    theme: {
      primary: 'from-red-600 to-blue-500',
      secondary: 'from-gold-400 to-red-500',
      accent: 'text-gold-400'
    }
  },
  {
    id: 'hulk',
    name: 'Bruce Banner',
    character: 'Hulk',
    personality: 'Brilliant scientist who gets angry and makes calculation errors',
    avatar: '💚',
    unlockLevel: 5,
    mistakePatterns: ['anger-induced errors', 'smashed calculations', 'forgotten formulas'],
    difficulty: 4,
    backstory: 'Dr. Banner tries to stay calm, but math mistakes make him... ANGRY!',
    reactions: {
      victory: ['💚 HULK SMASH... CORRECTLY!', '😤 Hulk strongest AND smartest!', '💪 HULK CALCULATE GOOD!'],
      defeat: ['😡 HULK ANGRY AT MATH!', '💚 Hulk need to study more...', '😤 You make Hulk proud!'],
      mistake: ['😡 HULK SMASH WRONG ANSWER!', '💚 Hulk sorry for mistake...', '😤 Math make Hulk confused!'],
      correct: ['💚 Hulk happy with answer!', '💪 HULK SMART!', '😊 Banner would be proud!']
    },
    theme: {
      primary: 'from-green-600 to-purple-500',
      secondary: 'from-purple-400 to-green-500',
      accent: 'text-green-400'
    }
  },
  {
    id: 'captain-america',
    name: 'Steve Rogers',
    character: 'Captain America',
    personality: 'All-American hero who sometimes uses outdated methods',
    avatar: '🛡️',
    unlockLevel: 6,
    mistakePatterns: ['old-fashioned methods', 'measurement confusion', 'systematic errors'],
    difficulty: 4,
    backstory: 'The First Avenger brings 1940s math techniques to modern problems!',
    reactions: {
      victory: ['🛡️ That\'s American excellence!', '⭐ For freedom and accuracy!', '🇺🇸 I can do this all day!'],
      defeat: ['😔 I let America down...', '🛡️ You\'ve got the heart of a hero!', '⭐ Well fought, soldier!'],
      mistake: ['😅 Back in my day...', '🛡️ Even super soldiers err!', '⭐ I need to adapt to modern math!'],
      correct: ['🛡️ American precision!', '⭐ That\'s the spirit!', '🇺🇸 Freedom rings true!']
    },
    theme: {
      primary: 'from-blue-600 to-red-500',
      secondary: 'from-red-400 to-blue-500',
      accent: 'text-blue-400'
    }
  },
  {
    id: 'doctor-strange',
    name: 'Stephen Strange',
    character: 'Doctor Strange',
    personality: 'Master of mystic arts who gets lost in complex dimensions',
    avatar: '🔮',
    unlockLevel: 7,
    mistakePatterns: ['dimensional confusion', 'mystical miscalculations', 'reality distortions'],
    difficulty: 5,
    backstory: 'The Sorcerer Supreme bends reality but sometimes bends math the wrong way!',
    reactions: {
      victory: ['🔮 By the Vishanti!', '✨ The mystic arts prevail!', '🌟 I\'ve seen this outcome!'],
      defeat: ['😵 I didn\'t see this coming...', '🔮 The multiverse is vast!', '✨ You\'ve mastered the impossible!'],
      mistake: ['🤦‍♂️ The spell backfired!', '🔮 Reality is more complex than I thought!', '✨ Even magic has limits!'],
      correct: ['🔮 Perfectly mystical!', '✨ The universe aligns!', '🌟 As foretold!']
    },
    theme: {
      primary: 'from-purple-600 to-orange-500',
      secondary: 'from-orange-400 to-purple-500',
      accent: 'text-orange-400'
    }
  },
  {
    id: 'thanos',
    name: 'Thanos',
    character: 'The Mad Titan',
    personality: 'Perfectly balanced... except when it comes to calculations',
    avatar: '💜',
    unlockLevel: 8,
    mistakePatterns: ['balance obsession errors', 'infinity stone confusion', 'cosmic miscalculations'],
    difficulty: 5,
    backstory: 'The Mad Titan seeks perfect balance but his math is perfectly unbalanced!',
    reactions: {
      victory: ['💜 Perfectly balanced!', '✨ Inevitable victory!', '🌌 The universe bends to my will!'],
      defeat: ['😤 Impossible!', '💜 You are... worthy!', '✨ Perhaps I was wrong...'],
      mistake: ['😠 This does not bring balance!', '💜 Even titans err!', '🌌 The stones have failed me!'],
      correct: ['💜 As all things should be!', '✨ Cosmic perfection!', '🌌 Universal truth!']
    },
    theme: {
      primary: 'from-purple-800 to-yellow-500',
      secondary: 'from-yellow-400 to-purple-700',
      accent: 'text-purple-400'
    }
  }
];

export const getUnlockedOpponents = (level: number): AIOpponent[] => {
  return AI_OPPONENTS.filter(opponent => opponent.unlockLevel <= level);
};

export const getOpponentById = (id: string): AIOpponent | undefined => {
  return AI_OPPONENTS.find(opponent => opponent.id === id);
};