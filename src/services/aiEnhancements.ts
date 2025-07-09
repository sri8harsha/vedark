// Advanced AI features for Battle Mode

interface StudentProfile {
  grade: number;
  subject: string;
  weakAreas: string[];
  strongAreas: string[];
  preferredThemes: string[];
  averageResponseTime: number;
  accuracyRate: number;
}

interface AIOpponent {
  name: string;
  personality: string;
  mistakePatterns: string[];
  difficulty: number;
  avatar: string;
  backstory: string;
}

class AIEnhancements {
  private studentProfiles: Map<string, StudentProfile> = new Map();
  private aiOpponents: AIOpponent[] = [
    {
      name: "Professor Oops",
      personality: "Absent-minded but well-meaning",
      mistakePatterns: ["calculation errors", "sign mistakes", "unit confusion"],
      difficulty: 1,
      avatar: "👨‍🔬",
      backstory: "A brilliant scientist who sometimes forgets to carry the 1!"
    },
    {
      name: "Speed Demon",
      personality: "Rushes through problems",
      mistakePatterns: ["skipped steps", "rounding errors", "hasty conclusions"],
      difficulty: 2,
      avatar: "👹",
      backstory: "Goes so fast that mistakes are inevitable!"
    },
    {
      name: "Trickster Fox",
      personality: "Clever but sneaky",
      mistakePatterns: ["wrong formulas", "switched variables", "logical fallacies"],
      difficulty: 3,
      avatar: "🦊",
      backstory: "Uses the wrong method on purpose to confuse students!"
    },
    {
      name: "Perfectionist Pete",
      personality: "Usually right but makes subtle errors",
      mistakePatterns: ["minor calculation slips", "decimal placement", "final step errors"],
      difficulty: 4,
      avatar: "🤓",
      backstory: "Gets everything right except for tiny details!"
    },
    {
      name: "Chaos Master",
      personality: "Unpredictable and chaotic",
      mistakePatterns: ["random errors", "mixed methods", "creative wrong answers"],
      difficulty: 5,
      avatar: "🎭",
      backstory: "Makes mistakes in the most unexpected ways!"
    }
  ];

  // Adaptive difficulty based on student performance
  calculateAdaptiveDifficulty(studentId: string, currentDifficulty: string): string {
    const profile = this.studentProfiles.get(studentId);
    if (!profile) return currentDifficulty;

    const accuracyRate = profile.accuracyRate;
    const responseTime = profile.averageResponseTime;

    // Adjust difficulty based on performance
    if (accuracyRate > 0.9 && responseTime < 10) {
      // Student is doing too well, increase difficulty
      const difficulties = ['easy', 'normal', 'hard', 'expert'];
      const currentIndex = difficulties.indexOf(currentDifficulty);
      return difficulties[Math.min(currentIndex + 1, difficulties.length - 1)];
    } else if (accuracyRate < 0.5 || responseTime > 25) {
      // Student is struggling, decrease difficulty
      const difficulties = ['easy', 'normal', 'hard', 'expert'];
      const currentIndex = difficulties.indexOf(currentDifficulty);
      return difficulties[Math.max(currentIndex - 1, 0)];
    }

    return currentDifficulty;
  }

  // Select AI opponent based on student level and progress
  selectAIOpponent(round: number, studentLevel: number): AIOpponent {
    const maxDifficulty = Math.min(studentLevel + Math.floor(round / 3), this.aiOpponents.length);
    const availableOpponents = this.aiOpponents.filter(opponent => opponent.difficulty <= maxDifficulty);
    
    return availableOpponents[Math.floor(Math.random() * availableOpponents.length)];
  }

  // Generate personalized encouragement messages
  generateEncouragement(performance: 'excellent' | 'good' | 'struggling'): string {
    const messages = {
      excellent: [
        "🌟 You're on fire! Keep catching those mistakes!",
        "🎯 Perfect detective work! The AI can't fool you!",
        "🚀 Amazing streak! You're becoming a math superhero!",
        "💎 Flawless logic! You're outsmarting the AI!"
      ],
      good: [
        "👍 Great job! You're getting better at this!",
        "🔍 Good eye for detail! Keep it up!",
        "⭐ Nice work! You're learning fast!",
        "🎉 Well done! You caught that tricky mistake!"
      ],
      struggling: [
        "💪 Don't give up! Every mistake is a learning opportunity!",
        "🌱 You're growing stronger with each try!",
        "🎯 Take your time - you've got this!",
        "✨ Remember, even the best detectives need practice!"
      ]
    };

    const messageArray = messages[performance];
    return messageArray[Math.floor(Math.random() * messageArray.length)];
  }

  // Track student progress and update profile
  updateStudentProfile(studentId: string, questionResult: {
    correct: boolean;
    responseTime: number;
    subject: string;
    topic: string;
    difficulty: string;
  }): void {
    let profile = this.studentProfiles.get(studentId);
    
    if (!profile) {
      profile = {
        grade: 3, // Default, should be set from user selection
        subject: questionResult.subject,
        weakAreas: [],
        strongAreas: [],
        preferredThemes: [],
        averageResponseTime: questionResult.responseTime,
        accuracyRate: questionResult.correct ? 1 : 0
      };
    }

    // Update accuracy rate (rolling average)
    profile.accuracyRate = (profile.accuracyRate * 0.8) + (questionResult.correct ? 0.2 : 0);
    
    // Update response time (rolling average)
    profile.averageResponseTime = (profile.averageResponseTime * 0.8) + (questionResult.responseTime * 0.2);

    // Track weak/strong areas
    if (questionResult.correct) {
      if (!profile.strongAreas.includes(questionResult.topic)) {
        profile.strongAreas.push(questionResult.topic);
      }
      // Remove from weak areas if they're improving
      profile.weakAreas = profile.weakAreas.filter(area => area !== questionResult.topic);
    } else {
      if (!profile.weakAreas.includes(questionResult.topic)) {
        profile.weakAreas.push(questionResult.topic);
      }
    }

    this.studentProfiles.set(studentId, profile);
  }

  // Generate achievement notifications
  checkAchievements(studentId: string, sessionStats: {
    streak: number;
    totalCorrect: number;
    averageTime: number;
    mistakesCaught: number;
  }): string[] {
    const achievements: string[] = [];

    if (sessionStats.streak >= 5) {
      achievements.push("🔥 STREAK MASTER - 5+ correct in a row!");
    }

    if (sessionStats.averageTime < 8) {
      achievements.push("⚡ SPEED DEMON - Lightning fast responses!");
    }

    if (sessionStats.mistakesCaught >= 8) {
      achievements.push("🕵️ EAGLE EYE - Caught 8+ AI mistakes!");
    }

    if (sessionStats.totalCorrect >= 15) {
      achievements.push("🏆 BATTLE CHAMPION - 15+ correct answers!");
    }

    return achievements;
  }

  // Generate story contexts for problems
  generateStoryContext(subject: string, grade: number): string {
    const contexts = {
      math: [
        "🚀 Space Mission Control needs your help calculating fuel for Mars!",
        "🏰 The kingdom's treasure is locked behind a mathematical puzzle!",
        "🦸 Superhero Academy requires precise calculations to save the day!",
        "🍕 Pizza Palace needs help dividing orders fairly among customers!",
        "🎮 The video game glitched - fix the code with math!"
      ],
      science: [
        "🔬 Dr. Curious's lab experiment needs your scientific knowledge!",
        "🌋 The volcano is about to erupt - use science to predict when!",
        "🦕 Paleontologists discovered fossils that need classification!",
        "🌱 The school garden needs your help understanding plant growth!",
        "⚡ The power plant has a problem only science can solve!"
      ]
    };

    const subjectContexts = contexts[subject as keyof typeof contexts] || contexts.math;
    return subjectContexts[Math.floor(Math.random() * subjectContexts.length)];
  }
}

export default AIEnhancements;