import React, { useState, useEffect, useRef } from 'react';
import { Timer, Trophy, Zap, Target, Volume2, VolumeX, Settings, Award, ShoppingCart, ArrowLeft } from 'lucide-react';
import QuestionGenerator from '../services/questionGenerator';
import { GameStorage } from '../services/gameStorage';
import { PlayerProfile, GameState, Problem, AIOpponent, Achievement, Topic, QuestionFormat } from '../types/game';
import { getOpponentById, AI_OPPONENTS } from '../data/opponents';
import OpponentSelect from './OpponentSelect';
import VictoryScreen from './VictoryScreen';
import AchievementPanel from './AchievementPanel';
import PowerUpShop from './PowerUpShop';
import TopicSelect from './TopicSelect';
import QuestionFormatSelect from './QuestionFormatSelect';
import QuestionDisplay from './QuestionDisplay';

interface BattleModeProps {
  onBackToHome?: () => void;
}

const BattleMode: React.FC<BattleModeProps> = ({ onBackToHome }) => {
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(GameStorage.getPlayerProfile());
  const [gameState, setGameState] = useState<GameState>({
    currentRound: 1,
    totalRounds: 5,
    score: 0,
    streak: 0,
    timeLeft: 15,
    isActive: false,
    selectedGrade: '',
    selectedSubject: '',
    selectedDifficulty: 'normal',
    selectedOpponent: null,
    currentProblem: null,
    showingSolution: false,
    gamePhase: 'setup',
    activePowerUps: [],
    usedPowerUps: []
  });

  const [showAchievements, setShowAchievements] = useState(false);
  const [showPowerUpShop, setShowPowerUpShop] = useState(false);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, color: string}>>([]);
  const [opponentReaction, setOpponentReaction] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<QuestionFormat>('mix');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const questionGenerator = useRef<QuestionGenerator | null>(null);

  const QUESTION_FORMATS: QuestionFormat[] = [
    'catch-mistake',
    'multiple-choice',
    'true-false',
    'fill-blank',
    'matching',
    'ordering'
  ];

  // Initialize question generator
  useEffect(() => {
    const apiKey = import.meta.env.VITE_REACT_APP_OPENAI_API_KEY;
    if (apiKey && apiKey !== 'your-api-key-here' && apiKey.trim() !== '') {
      questionGenerator.current = new QuestionGenerator(apiKey);
      console.log('✅ OpenAI API configured - Dynamic questions enabled');
      setIsUsingFallback(false);
    } else {
      questionGenerator.current = null;
      console.log('⚠️ OpenAI API not configured - Using fallback questions');
      setError('OpenAI API not configured. Using fallback questions. To enable dynamic questions, create a .env file with VITE_REACT_APP_OPENAI_API_KEY=your-api-key');
      setIsUsingFallback(true);
    }
  }, []);

  // Sound effects with enhanced audio
  const playSound = (type: 'tick' | 'correct' | 'wrong' | 'victory' | 'start' | 'powerup' | 'unlock') => {
    if (!playerProfile.preferences.soundEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      let frequency = 440;
      let duration = 0.2;
      
      switch(type) {
        case 'tick':
          frequency = 800;
          duration = 0.1;
          break;
        case 'correct':
          frequency = 523;
          duration = 0.5;
          // Play a chord for correct answers
          setTimeout(() => {
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.frequency.setValueAtTime(659, ctx.currentTime);
            gain2.gain.setValueAtTime(0.05, ctx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc2.start();
            osc2.stop(ctx.currentTime + 0.3);
          }, 100);
          break;
        case 'wrong':
          frequency = 220;
          duration = 0.8;
          break;
        case 'victory':
          frequency = 659;
          duration = 0.3;
          break;
        case 'start':
          frequency = 440;
          duration = 0.4;
          break;
        case 'powerup':
          frequency = 880;
          duration = 0.6;
          break;
        case 'unlock':
          frequency = 1000;
          duration = 1.0;
          break;
      }
      
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  const getRandomFormat = () => {
    return QUESTION_FORMATS[Math.floor(Math.random() * QUESTION_FORMATS.length)];
  };

  // Generate dynamic problems using AI
  const generateProblem = async (grade: string, subject: string, difficulty: string): Promise<Problem> => {
    let formatToUse = selectedFormat;
    if (selectedFormat === 'mix' || selectedFormat === 'auto' || !selectedFormat) {
      formatToUse = getRandomFormat();
    }
    if (!questionGenerator.current) {
      console.log('📚 Using fallback questions (no API configured)');
      setIsUsingFallback(true);
      return getFallbackProblem(grade, subject, difficulty);
    }

    try {
      console.log(`🤖 Generating AI question for Grade ${grade} ${subject} (${difficulty})`);
      setIsUsingFallback(false);
      const question = await questionGenerator.current.generateQuestion({
        grade: parseInt(grade),
        subject,
        difficulty: difficulty as any,
        opponentId: gameState.selectedOpponent?.id || 'iron-man',
        previousQuestions: [],
        topic: selectedTopic?.name,
        format: formatToUse
      });

      console.log('✅ AI question generated successfully');
      return {
        id: question.id,
        question: question.question,
        subject: question.subject,
        grade: question.grade,
        topic: question.topic || selectedTopic?.name || 'General',
        format: question.format || formatToUse,
        steps: question.steps,
        options: question.options,
        correctAnswer: question.correctAnswer,
        hasError: question.hasError,
        errorStep: question.errorStep,
        explanation: question.explanation,
        difficulty: question.difficulty as any,
        blanks: question.blanks,
        matchingPairs: question.matchingPairs,
        orderingItems: question.orderingItems
      };
    } catch (error) {
      console.error('❌ Failed to generate AI question:', error);
      console.log('📚 Falling back to pre-written questions');
      setIsUsingFallback(true);
      return getFallbackProblem(grade, subject, difficulty);
    }
  };

  // Enhanced fallback problems with movie character themes
  const getFallbackProblem = (grade: string, subject: string, difficulty: string): Problem => {
    const problems = getProblemBank(parseInt(grade), subject, difficulty, gameState.selectedOpponent?.id);
    const randomProblem = problems[Math.floor(Math.random() * problems.length)];
    
    return {
      ...randomProblem,
      id: `${Date.now()}-${Math.random()}`,
      grade: parseInt(grade),
      subject,
      difficulty: difficulty as any
    };
  };

  // Enhanced problem bank with superhero themes
  const getProblemBank = (grade: number, subject: string, difficulty: string, opponentId?: string) => {
    const problemSets: Record<string, any[]> = {
      'iron-man-math-1': [
        {
          question: "⚡ Tony Stark builds 5 arc reactors, then 3 more. How many reactors total?",
          steps: ["Step 1: First reactors = 5", "Step 2: More reactors = 3", "Step 3: Total = 5 + 3 = 8"],
          correctAnswer: 8,
          hasError: false,
          explanation: "Perfect! Tony Stark built 8 arc reactors total!"
        },
        {
          question: "⚡ Iron Man has 7 repulsors but 2 malfunction. How many work?",
          steps: ["Step 1: Start with 7 repulsors", "Step 2: 2 malfunction", "Step 3: Working = 7 - 2 = 5"],
          correctAnswer: 5,
          hasError: false,
          explanation: "Correct! Tony has 5 working repulsors!"
        }
      ],
      'spider-man-math-1': [
        {
          question: "🕸️ Spider-Man swings past 5 buildings, then 3 more. How many buildings total?",
          steps: ["Step 1: First buildings = 5", "Step 2: More buildings = 3", "Step 3: Total = 5 + 3 = 8"],
          correctAnswer: 8,
          hasError: false,
          explanation: "Perfect! Spider-Man swung past 8 buildings total!"
        }
      ],
      'batman-math-2': [
        {
          question: "🦇 Batman catches 12 criminals in Gotham at night and 8 during the day. How many total?",
          steps: ["Step 1: Night criminals = 12", "Step 2: Day criminals = 8", "Step 3: Total = 12 + 8 = 20"],
          correctAnswer: 20,
          hasError: false,
          explanation: "Excellent! Batman caught 20 villains total!"
        }
      ],
      'hulk-math-3': [
        {
          question: "💚 Hulk smashes 6 gamma machines, each with 4 parts. How many parts total?",
          steps: ["Step 1: Machines = 6", "Step 2: Parts each = 4", "Step 3: Total parts = 6 × 4 = 24"],
          correctAnswer: 24,
          hasError: false,
          explanation: "HULK SMASH CORRECTLY! 24 parts total!"
        }
      ]
    };

    const key = `${opponentId}-${subject}-${grade}`;
    return problemSets[key] || problemSets['iron-man-math-1'];
  };

  // Start the battle
  const startBattle = () => {
    if (!gameState.selectedGrade || !gameState.selectedSubject) {
      alert('Please select grade and subject first!');
      return;
    }

    playSound('start');
    setGameState(prev => ({
      ...prev,
      gamePhase: 'opponent-select'
    }));
  };

  // Handle opponent selection with full validation
  const handleOpponentSelect = (opponent: AIOpponent) => {
    // Validate that the opponent is unlocked
    if (!playerProfile.unlockedOpponents.includes(opponent.id)) {
      alert('This opponent is not yet unlocked! Complete previous opponents first.');
      return;
    }

    // Validate that the selected difficulty is available for this opponent
    const opponentProgress = playerProfile.characterProgress[opponent.id] || { 
      easy: false, normal: false, hard: false, expert: false 
    };

    setGameState(prev => ({
      ...prev,
      selectedOpponent: opponent,
      isActive: true,
      gamePhase: 'problem',
      currentRound: 1,
      score: 0,
      streak: 0,
      activePowerUps: [],
      usedPowerUps: []
    }));

    generateNextProblem();
  };

  // Generate next problem
  const generateNextProblem = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const problem = await generateProblem(
        gameState.selectedGrade,
        gameState.selectedSubject,
        gameState.selectedDifficulty
      );

      setGameState(prev => ({
        ...prev,
        currentProblem: problem,
        timeLeft: 15,
        showingSolution: false,
        gamePhase: 'problem'
      }));

      // Show opponent reaction
      if (gameState.selectedOpponent) {
        const reactions = ['😏 Let\'s see if you can catch this!', '🤔 This one might trick you!', '😈 I\'ve got a sneaky solution!'];
        setOpponentReaction(reactions[Math.floor(Math.random() * reactions.length)]);
      }

      // For catch-mistake format, show solution after delay
      // For other formats, go directly to solution phase
      if (problem.format === 'catch-mistake') {
        const solutionDelay = playerProfile.battlesPlayed > 5 ? 1000 : 3000;
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            showingSolution: true,
            gamePhase: 'solution'
          }));
          setOpponentReaction('');
          startTimer();
        }, solutionDelay);
      } else {
        // For non-catch-mistake formats, go directly to solution phase
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            gamePhase: 'solution'
          }));
          setOpponentReaction('');
          startTimer();
        }, 1000);
      }
    } catch (err) {
      setError('Failed to generate problem. Please try again.');
      console.error('Problem generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Start countdown timer
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          clearInterval(timerRef.current!);
          handleTimeUp();
          return prev;
        }
        
        if (prev.timeLeft <= 5) {
          playSound('tick');
        }
        
        return {
          ...prev,
          timeLeft: prev.timeLeft - 1
        };
      });
    }, 1000);
  };

  // Handle time up
  const handleTimeUp = () => {
    setGameState(prev => ({
      ...prev,
      streak: 0,
      gamePhase: 'feedback'
    }));
    
    playSound('wrong');
    
    // Show opponent victory reaction
    if (gameState.selectedOpponent) {
      const reactions = gameState.selectedOpponent.reactions.victory;
      setOpponentReaction(reactions[Math.floor(Math.random() * reactions.length)]);
    }
    
    setTimeout(nextRound, 2000);
  };

  // Handle answer selection
  const handleAnswer = (isCorrect: boolean) => {
    if (gameState.gamePhase !== 'solution') return;
    
    clearInterval(timerRef.current!);
    
    const problem = gameState.currentProblem!;
    
    // For catch-mistake format, check if player correctly identified the mistake
    // For other formats, isCorrect is already determined by the QuestionDisplay component
    const playerCorrect = problem.format === 'catch-mistake' 
      ? (problem.hasError && !isCorrect) || (!problem.hasError && isCorrect)
      : isCorrect;
    
    if (playerCorrect) {
      const points = calculatePoints();
      playSound('correct');
      createSuccessParticles();
      
      // Show opponent defeat reaction
      if (gameState.selectedOpponent) {
        const reactions = gameState.selectedOpponent.reactions.defeat;
        setOpponentReaction(reactions[Math.floor(Math.random() * reactions.length)]);
      }
      
      setGameState(prev => ({
        ...prev,
        score: prev.score + points,
        streak: prev.streak + 1,
        gamePhase: 'feedback'
      }));
    } else {
      playSound('wrong');
      
      // Show opponent victory reaction
      if (gameState.selectedOpponent) {
        const reactions = gameState.selectedOpponent.reactions.victory;
        setOpponentReaction(reactions[Math.floor(Math.random() * reactions.length)]);
      }
      
      setGameState(prev => ({
        ...prev,
        streak: 0,
        gamePhase: 'feedback'
      }));
    }
    
    setTimeout(nextRound, 2000);
  };

  // Calculate points based on performance
  const calculatePoints = () => {
    const basePoints = 100;
    const timeBonus = gameState.timeLeft * 5;
    const streakBonus = gameState.streak * 10;
    const difficultyMultiplier = gameState.selectedDifficulty === 'easy' ? 1 : 
                                gameState.selectedDifficulty === 'normal' ? 1.2 :
                                gameState.selectedDifficulty === 'hard' ? 1.5 : 2;
    
    return Math.floor((basePoints + timeBonus + streakBonus) * difficultyMultiplier);
  };

  // Create character-themed success particle effect
  const createSuccessParticles = () => {
    let colors: string[];
    
    if (gameState.selectedOpponent) {
      // Use character-themed colors
      switch (gameState.selectedOpponent.theme.accent) {
        case 'text-yellow-400':
          colors = ['#fbbf24', '#f59e0b', '#eab308', '#ca8a04'];
          break;
        case 'text-red-400':
          colors = ['#f87171', '#ef4444', '#dc2626', '#b91c1c'];
          break;
        case 'text-green-400':
          colors = ['#34d399', '#10b981', '#059669', '#047857'];
          break;
        case 'text-blue-400':
          colors = ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'];
          break;
        case 'text-purple-400':
          colors = ['#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9'];
          break;
        case 'text-orange-400':
          colors = ['#fb923c', '#f97316', '#ea580c', '#c2410c'];
          break;
        case 'text-cyan-400':
          colors = ['#22d3ee', '#06b6d4', '#0891b2', '#0e7490'];
          break;
        default:
          colors = ['#fbbf24', '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981'];
      }
    } else {
      colors = ['#fbbf24', '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981'];
    }
    
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 3000);
  };

  // Move to next round
  const nextRound = async () => {
    setOpponentReaction('');
    
    if (gameState.currentRound >= gameState.totalRounds) {
      endGame();
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      currentRound: prev.currentRound + 1
    }));
    
    await generateNextProblem();
  };

  // End game and show victory with progression updates
  const endGame = () => {
    const battleResult = {
      won: gameState.score > 500, // Victory threshold
      score: gameState.score,
      streak: gameState.streak,
      accuracy: 85, // Calculate based on correct answers
      averageTime: 12, // Calculate based on response times
      mistakesCaught: Math.floor(gameState.score / 100)
    };

    // Update player profile with battle stats
    let updatedProfile = GameStorage.updateBattleStats(playerProfile, battleResult);

    // If battle was won, update character progress
    if (battleResult.won && gameState.selectedOpponent) {
      const opponentId = gameState.selectedOpponent.id;
      const difficulty = gameState.selectedDifficulty as 'easy' | 'normal' | 'hard' | 'expert';
      
      // Mark this difficulty as completed for this character
      if (!updatedProfile.characterProgress[opponentId]) {
        updatedProfile.characterProgress[opponentId] = { 
          easy: false, normal: false, hard: false, expert: false 
        };
      }
      updatedProfile.characterProgress[opponentId][difficulty] = true;

      // Check if all difficulties are completed for this character
      const allDifficultiesCompleted = Object.values(updatedProfile.characterProgress[opponentId]).every(Boolean);
      
      if (allDifficultiesCompleted) {
        // Find the next character to unlock
        const currentIndex = AI_OPPONENTS.findIndex(opp => opp.id === opponentId);
        const nextOpponent = AI_OPPONENTS[currentIndex + 1];
        
        if (nextOpponent && !updatedProfile.unlockedOpponents.includes(nextOpponent.id)) {
          updatedProfile.unlockedOpponents.push(nextOpponent.id);
          playSound('unlock');
        }
      }
    }

    // Check for new achievements
    const achievements = GameStorage.checkAchievements(updatedProfile);
    const finalProfile = GameStorage.applyAchievementRewards(updatedProfile, achievements);
    
    setPlayerProfile(finalProfile);
    setNewAchievements(achievements);
    GameStorage.savePlayerProfile(finalProfile);

    if (achievements.length > 0) {
      playSound('unlock');
    }

    setGameState(prev => ({
      ...prev,
      gamePhase: 'victory',
      isActive: false
    }));
    
    playSound('victory');
  };

  // Power-up functions
  const usePowerUp = (powerUpId: string) => {
    if (playerProfile.powerUps[powerUpId] <= 0) return;
    
    playSound('powerup');
    
    // Update player profile
    const updatedProfile = { ...playerProfile };
    updatedProfile.powerUps[powerUpId] -= 1;
    setPlayerProfile(updatedProfile);
    GameStorage.savePlayerProfile(updatedProfile);
    
    // Apply power-up effect
    switch (powerUpId) {
      case 'extraTime':
        setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft + 10 }));
        break;
      case 'hint':
        // Show hint logic here
        break;
      case 'skip':
        nextRound();
        break;
    }
    
    setGameState(prev => ({
      ...prev,
      usedPowerUps: [...prev.usedPowerUps, powerUpId]
    }));
  };

  // Purchase power-up
  const handlePowerUpPurchase = (powerUpId: string) => {
    const powerUp = { id: powerUpId, cost: 100 }; // Get from POWER_UPS data
    
    if (playerProfile.totalScore >= powerUp.cost) {
      const updatedProfile = { ...playerProfile };
      updatedProfile.totalScore -= powerUp.cost;
      updatedProfile.powerUps[powerUpId] = (updatedProfile.powerUps[powerUpId] || 0) + 1;
      
      setPlayerProfile(updatedProfile);
      GameStorage.savePlayerProfile(updatedProfile);
      playSound('powerup');
    }
  };

  // Reset game
  const resetGame = () => {
    setGameState({
      currentRound: 1,
      totalRounds: 5,
      score: 0,
      streak: 0,
      timeLeft: 15,
      isActive: false,
      selectedGrade: '',
      selectedSubject: '',
      selectedDifficulty: 'normal',
      selectedOpponent: null,
      currentProblem: null,
      showingSolution: false,
      gamePhase: 'setup',
      activePowerUps: [],
      usedPowerUps: []
    });
    setOpponentReaction('');
    setNewAchievements([]);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Handle keyboard navigation for battle actions
  const handleKeyPress = (event: KeyboardEvent) => {
    if (gameState.gamePhase === 'solution') {
      if (event.key === '1' || event.key === 'Enter') {
        handleAnswer(true);
      } else if (event.key === '2' || event.key === ' ') {
        event.preventDefault();
        handleAnswer(false);
      }
    }
  };

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameState.gamePhase]);

  // Focus management for accessibility
  const focusFirstButton = () => {
    const firstButton = document.querySelector('button[data-action="correct"]') as HTMLButtonElement;
    if (firstButton) {
      firstButton.focus();
    }
  };

  // Auto-focus action buttons when solution is shown
  useEffect(() => {
    if (gameState.gamePhase === 'solution') {
      setTimeout(focusFirstButton, 100);
    }
  }, [gameState.gamePhase]);

  // Render opponent selection screen with all current selections
  if (gameState.gamePhase === 'opponent-select') {
    return (
      <OpponentSelect
        playerLevel={playerProfile.level}
        unlockedOpponents={playerProfile.unlockedOpponents}
        characterProgress={playerProfile.characterProgress}
        onSelectOpponent={handleOpponentSelect}
        onBack={() => setGameState(prev => ({ ...prev, gamePhase: 'setup' }))}
      />
    );
  }

  // Render victory screen
  if (gameState.gamePhase === 'victory') {
    return (
      <VictoryScreen
        score={gameState.score}
        streak={gameState.streak}
        accuracy={85}
        opponentName={gameState.selectedOpponent?.name || 'AI'}
        opponentAvatar={gameState.selectedOpponent?.avatar || '🤖'}
        selectedOpponent={gameState.selectedOpponent || undefined}
        selectedDifficulty={gameState.selectedDifficulty}
        characterProgress={playerProfile.characterProgress}
        newAchievements={newAchievements}
        onContinue={resetGame}
        onPlayAgain={() => {
          setGameState(prev => ({
            ...prev,
            gamePhase: 'opponent-select',
            currentRound: 1,
            score: 0,
            streak: 0
          }));
        }}
      />
    );
  }

  // Main setup screen
  if (gameState.gamePhase === 'setup') {
    return (
          <div className="min-h-screen bg-black text-white p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-teal-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10">
          {/* Back Button */}
          {onBackToHome && (
            <div className="mb-6">
              <button
                onClick={onBackToHome}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20 hover:border-white/30 transition-all duration-300"
              >
                <ArrowLeft size={20} />
                <span className="font-semibold">Back to Home</span>
              </button>
            </div>
          )}
          
          {/* Header with Profile Info */}
          <div className="flex justify-between items-center mb-8">
            <div className="text-center flex-1">
              <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-purple-400 via-teal-400 to-purple-400 bg-clip-text text-transparent">
                ⚔️ BATTLE MODE
              </h1>
              <p className="text-xl text-teal-300">Catch the AI's Mistakes & Become a Hero!</p>
            </div>
            
            {/* Profile Stats */}
            <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 border border-teal-500/30">
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-400">Level {playerProfile.level}</div>
                <div className="text-sm text-gray-300">{playerProfile.name}</div>
                <div className="text-xs text-purple-400">{playerProfile.totalScore.toLocaleString()} Points</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setShowAchievements(true)}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-3 rounded-full font-bold hover:from-yellow-700 hover:to-orange-700 transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <Award size={20} />
              Achievements ({playerProfile.unlockedAchievements.length})
            </button>
            
            <button
              onClick={() => setShowPowerUpShop(true)}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-full font-bold hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <ShoppingCart size={20} />
              Power-Up Shop
            </button>
          </div>

          {/* Grade Selection */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">Select Your Grade</h3>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3 max-w-2xl mx-auto">
              {Array.from({ length: 8 }, (_, i) => i + 1).map(grade => (
                <button
                  key={grade}
                  onClick={() => setGameState(prev => ({ ...prev, selectedGrade: grade.toString() }))}
                  className={`relative p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                    gameState.selectedGrade === grade.toString()
                      ? 'bg-gradient-to-r from-purple-500 to-teal-500 border-teal-400 shadow-lg shadow-teal-400/50 text-white font-bold scale-105'
                      : 'bg-white/5 border-gray-600 hover:border-teal-400 text-gray-300'
                  }`}
                >
                  <div className="text-2xl">{grade}️⃣</div>
                  <div className="text-sm font-semibold">Grade {grade}</div>
                  {gameState.selectedGrade === grade.toString() && (
                    <div className="absolute -top-1 -right-1 bg-teal-400 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Selection */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">Choose Your Subject</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { id: 'math', name: 'Math', emoji: '🧮', description: 'Numbers & Problem Solving' },
                { id: 'science', name: 'Science', emoji: '🔬', description: 'Experiments & Discovery' },
                { id: 'english', name: 'English', emoji: '📖', description: 'Reading & Writing' },
                { id: 'social_studies', name: 'Social Studies', emoji: '🌍', description: 'History & Geography' }
              ].map(subject => (
                <button
                  key={subject.id}
                  onClick={() => setGameState(prev => ({ ...prev, selectedSubject: subject.id }))}
                  className={`relative p-6 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                    gameState.selectedSubject === subject.id
                      ? 'bg-gradient-to-r from-purple-500 to-teal-500 border-teal-400 shadow-lg shadow-teal-400/50 text-white scale-105'
                      : 'bg-white/5 border-gray-600 hover:border-teal-400 text-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{subject.emoji}</div>
                  <div className="font-bold text-lg mb-1">{subject.name}</div>
                  <div className={`text-sm ${gameState.selectedSubject === subject.id ? 'text-teal-100' : 'text-gray-400'}`}>{subject.description}</div>
                  {gameState.selectedSubject === subject.id && (
                    <div className="absolute -top-2 -right-2 bg-teal-400 text-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">Choose Your Challenge</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { id: 'easy', name: 'Easy', emoji: '🌟', description: '3 Rounds, Obvious Mistakes', rounds: 3 },
                { id: 'normal', name: 'Normal', emoji: '⚔️', description: '5 Rounds, Mixed Difficulty', rounds: 5 },
                { id: 'hard', name: 'Hard', emoji: '🔥', description: '7 Rounds, Sneaky Tricks', rounds: 7 },
                { id: 'expert', name: 'Expert', emoji: '💀', description: '10 Rounds, Master Level', rounds: 10 }
              ].map((difficulty) => (
                <button
                  key={difficulty.id}
                  onClick={() => setGameState(prev => ({ 
                    ...prev, 
                    selectedDifficulty: difficulty.id,
                    totalRounds: difficulty.rounds
                  }))}
                  className={`relative p-6 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                    gameState.selectedDifficulty === difficulty.id
                      ? 'bg-gradient-to-r from-purple-500 to-teal-500 border-teal-400 shadow-lg shadow-teal-400/50 text-white scale-105'
                      : 'bg-white/5 border-gray-600 hover:border-teal-400 text-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{difficulty.emoji}</div>
                  <div className="font-bold text-lg mb-1">{difficulty.name}</div>
                  <div className={`text-sm ${gameState.selectedDifficulty === difficulty.id ? 'text-teal-100' : 'text-gray-400'}`}>{difficulty.description}</div>
                  {gameState.selectedDifficulty === difficulty.id && (
                    <div className="absolute -top-2 -right-2 bg-teal-400 text-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Selection - Only show if grade and subject are selected */}
          {gameState.selectedGrade && gameState.selectedSubject && (
            <div className="mb-8">
              <TopicSelect
                grade={parseInt(gameState.selectedGrade)}
                subject={gameState.selectedSubject}
                difficulty={gameState.selectedDifficulty}
                onTopicSelect={setSelectedTopic}
                selectedTopic={selectedTopic}
              />
            </div>
          )}

          {/* Question Format Selection - Only show if grade and subject are selected */}
          {gameState.selectedGrade && gameState.selectedSubject && (
            <div className="mb-8">
              <QuestionFormatSelect
                selectedFormat={selectedFormat}
                onFormatSelect={setSelectedFormat}
              />
            </div>
          )}

          {/* Progress Overview */}
          <div className="mb-8 bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-teal-500/30">
            <h3 className="text-xl font-bold mb-4 text-center bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
              🏆 Your Hero Journey
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-center mb-3">
                  <div className="text-2xl font-bold text-teal-400">Level {playerProfile.level}</div>
                  <div className="text-sm text-gray-300">Hero Level</div>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-teal-400 to-purple-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${((playerProfile.totalScore % 1000) / 1000) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mt-1 text-center">
                  {playerProfile.totalScore % 1000} / 1000 XP to next level
                </div>
              </div>
              <div>
                <div className="text-center mb-3">
                  <div className="text-2xl font-bold text-purple-400">{playerProfile.unlockedOpponents.length}/8</div>
                  <div className="text-sm text-gray-300">Heroes Unlocked</div>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-teal-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(playerProfile.unlockedOpponents.length / 8) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mt-1 text-center">
                  {8 - playerProfile.unlockedOpponents.length} more to unlock
                </div>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <button
              onClick={startBattle}
              disabled={!gameState.selectedGrade || !gameState.selectedSubject || !selectedTopic}
              className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-12 py-4 rounded-full font-bold text-xl hover:from-purple-700 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-teal-400 focus:ring-opacity-50"
              aria-label={`Start battle with ${gameState.selectedGrade ? `grade ${gameState.selectedGrade}` : 'selected grade'}, ${gameState.selectedSubject ? gameState.selectedSubject : 'selected subject'}, and ${selectedTopic ? selectedTopic.name : 'selected topic'}`}
              title={!gameState.selectedGrade || !gameState.selectedSubject ? 'Please select grade and subject first' : !selectedTopic ? 'Please select a topic first' : 'Start your battle adventure!'}
            >
              🚀 CHOOSE OPPONENT!
            </button>
            {!selectedTopic && gameState.selectedGrade && gameState.selectedSubject && (
              <p className="text-yellow-400 text-sm mt-2">Please select a topic to continue</p>
            )}
          </div>

          {/* Sound Toggle */}
          <div className="fixed top-4 right-4">
            <button
              onClick={() => {
                const updatedProfile = { 
                  ...playerProfile, 
                  preferences: { 
                    ...playerProfile.preferences, 
                    soundEnabled: !playerProfile.preferences.soundEnabled 
                  } 
                };
                setPlayerProfile(updatedProfile);
                GameStorage.savePlayerProfile(updatedProfile);
              }}
              className="bg-white/10 border border-white/20 rounded-full p-3 hover:bg-white/20 transition-colors"
            >
              {playerProfile.preferences.soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </button>
          </div>
        </div>

        {/* Achievement Panel */}
        {showAchievements && (
          <AchievementPanel
            unlockedAchievements={playerProfile.unlockedAchievements}
            playerStats={{
              battlesWon: playerProfile.battlesWon,
              bestStreak: playerProfile.bestStreak,
              totalScore: playerProfile.totalScore,
              accuracyRate: playerProfile.stats.accuracyRate,
              mistakesCaught: playerProfile.stats.mistakesCaught
            }}
            onClose={() => setShowAchievements(false)}
          />
        )}

        {/* Power-Up Shop */}
        {showPowerUpShop && (
          <PowerUpShop
            playerScore={playerProfile.totalScore}
            playerPowerUps={playerProfile.powerUps}
            onPurchase={handlePowerUpPurchase}
            onClose={() => setShowPowerUpShop(false)}
          />
        )}
      </div>
    );
  }

  // Battle Arena
  return (
    <div className={`min-h-screen text-white relative overflow-hidden ${
      gameState.selectedOpponent ? 
        `bg-gradient-to-br ${gameState.selectedOpponent.theme.primary}` : 
        'bg-black'
    }`}>
      {/* Character-themed Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {gameState.selectedOpponent && (
          <>
            <div className={`absolute top-20 left-10 w-32 h-32 ${gameState.selectedOpponent.theme.secondary} rounded-full blur-xl animate-pulse opacity-20`}></div>
            <div className={`absolute top-40 right-20 w-48 h-48 ${gameState.selectedOpponent.theme.primary} rounded-full blur-xl animate-pulse delay-1000 opacity-15`}></div>
            <div className={`absolute bottom-32 left-1/3 w-40 h-40 ${gameState.selectedOpponent.theme.secondary} rounded-full blur-xl animate-pulse delay-2000 opacity-10`}></div>
          </>
        )}
        {/* Fallback background if no opponent selected */}
        {!gameState.selectedOpponent && (
          <>
            <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-48 h-48 bg-teal-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-2000"></div>
          </>
        )}
      </div>
      
      {/* Game HUD with difficulty theming */}
      <div className={`flex justify-between items-center p-4 backdrop-blur-md relative z-10 ${
        gameState.selectedDifficulty === 'easy' ? 'bg-green-900/30 border-b border-green-500/30' :
        gameState.selectedDifficulty === 'normal' ? 'bg-blue-900/30 border-b border-blue-500/30' :
        gameState.selectedDifficulty === 'hard' ? 'bg-orange-900/30 border-b border-orange-500/30' :
        'bg-red-900/30 border-b border-red-500/30'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`text-3xl font-bold ${
            gameState.timeLeft <= 5 ? 'text-red-400 animate-pulse' : 
            gameState.selectedDifficulty === 'easy' ? 'text-green-400' :
            gameState.selectedDifficulty === 'normal' ? 'text-blue-400' :
            gameState.selectedDifficulty === 'hard' ? 'text-orange-400' :
            'text-red-400'
          }`}>
            <Timer className="inline mr-2" size={24} />
            {gameState.timeLeft}s
          </div>
          <div className="text-center">
            <div className={`${
              gameState.selectedDifficulty === 'easy' ? 'text-green-400' :
              gameState.selectedDifficulty === 'normal' ? 'text-blue-400' :
              gameState.selectedDifficulty === 'hard' ? 'text-orange-400' :
              'text-red-400'
            }`}>
              Round {gameState.currentRound}/{gameState.totalRounds}
            </div>
            <div className="text-purple-400 font-bold">Score: {gameState.score.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-pink-400">
            <Zap className="inline mr-1" size={20} />
            Streak: {gameState.streak}
          </div>
          
          {/* Power-ups with character theming */}
          <div className="flex gap-2">
            {Object.entries(playerProfile.powerUps).map(([powerUpId, count]) => (
              count > 0 && (
                <button
                  key={powerUpId}
                  onClick={() => usePowerUp(powerUpId)}
                  className={`hover:scale-105 text-white px-3 py-1 rounded-full text-sm font-bold transition-all transform ${
                    gameState.selectedOpponent ? 
                      `bg-${gameState.selectedOpponent.theme.accent.replace('text-', '')}-600 hover:bg-${gameState.selectedOpponent.theme.accent.replace('text-', '')}-700` :
                      'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {powerUpId === 'extraTime' ? '⏰' : powerUpId === 'hint' ? '💡' : '⏭️'} {count}
                </button>
              )
            ))}
          </div>
          
          <button
            onClick={() => {
              const updatedProfile = { 
                ...playerProfile, 
                preferences: { 
                  ...playerProfile.preferences, 
                  soundEnabled: !playerProfile.preferences.soundEnabled 
                } 
              };
              setPlayerProfile(updatedProfile);
              GameStorage.savePlayerProfile(updatedProfile);
            }}
            className="bg-white/10 border border-white/20 rounded-full p-2 hover:bg-white/20 transition-colors"
          >
            {playerProfile.preferences.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>

      {/* Enhanced Opponent Display with Character Theming */}
      {gameState.selectedOpponent && (
        <div className={`text-center py-6 relative z-10 ${
          gameState.selectedDifficulty === 'easy' ? 'bg-green-900/20' :
          gameState.selectedDifficulty === 'normal' ? 'bg-blue-900/20' :
          gameState.selectedDifficulty === 'hard' ? 'bg-orange-900/20' :
          'bg-red-900/20'
        }`}>
          <div className="flex items-center justify-center gap-6">
            <div className={`text-6xl animate-bounce ${gameState.selectedOpponent.theme.accent}`}>
              {gameState.selectedOpponent.avatar}
            </div>
            <div>
              <div className={`text-2xl font-bold ${gameState.selectedOpponent.theme.accent}`}>
                {gameState.selectedOpponent.character}
              </div>
              <div className="text-sm text-gray-300">{gameState.selectedOpponent.name}</div>
              <div className={`text-xs mt-1 px-3 py-1 rounded-full inline-block ${
                gameState.selectedDifficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                gameState.selectedDifficulty === 'normal' ? 'bg-blue-500/20 text-blue-300' :
                gameState.selectedDifficulty === 'hard' ? 'bg-orange-500/20 text-orange-300' :
                'bg-red-500/20 text-red-300'
              }`}>
                {gameState.selectedDifficulty.toUpperCase()} MODE
              </div>
            </div>
          </div>
          {opponentReaction && (
            <div className={`mt-3 text-lg animate-pulse ${gameState.selectedOpponent.theme.accent}`}>
              {opponentReaction}
            </div>
          )}
        </div>
      )}

      {/* Enhanced Battle Arena */}
      <div className="p-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Problem Display with Character Theming */}
          <div className={`backdrop-blur-md rounded-2xl p-8 mb-6 border ${
            gameState.selectedOpponent ? 
              `bg-black/40 border-${gameState.selectedOpponent.theme.accent.replace('text-', '')}-500/30` :
              'bg-black/30 border-teal-500/30'
          }`}>
            <h2 className={`text-3xl font-bold mb-4 text-center bg-clip-text text-transparent ${
              gameState.selectedOpponent ? 
                `bg-gradient-to-r ${gameState.selectedOpponent.theme.primary}` :
                'bg-gradient-to-r from-purple-400 to-teal-400'
            }`}>
              🎯 Challenge #{gameState.currentRound}
            </h2>
            
            {/* Question Source Indicator */}
            {isUsingFallback && (
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-full text-sm">
                  <span>📚</span>
                  <span>Using Pre-written Questions</span>
                  <span className="text-xs opacity-75">(API not configured)</span>
                </div>
              </div>
            )}
            
            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mb-4"></div>
                <div className="text-xl text-teal-400">Generating your challenge...</div>
                <div className="text-sm text-gray-400 mt-2">AI is crafting the perfect problem for you!</div>
              </div>
            )}
            
            {/* Error State */}
            {error && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">⚠️</div>
                <div className="text-xl text-red-400 mb-4">{error}</div>
                <button
                  onClick={generateNextProblem}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-full font-bold hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105"
                >
                  🔄 Try Again
                </button>
              </div>
            )}
            
            {gameState.currentProblem && !isLoading && !error && (
              <div className="text-center">
                {/* For catch-mistake format, show the solution steps */}
                {gameState.currentProblem.format === 'catch-mistake' && gameState.showingSolution && (
                  <div className={`border rounded-xl p-6 mb-6 ${
                    gameState.selectedDifficulty === 'easy' ? 'bg-green-500/20 border-green-500/50' :
                    gameState.selectedDifficulty === 'normal' ? 'bg-blue-500/20 border-blue-500/50' :
                    gameState.selectedDifficulty === 'hard' ? 'bg-orange-500/20 border-orange-500/50' :
                    'bg-red-500/20 border-red-500/50'
                  }`}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className={`text-xl font-bold ${
                        gameState.selectedDifficulty === 'easy' ? 'text-green-400' :
                        gameState.selectedDifficulty === 'normal' ? 'text-blue-400' :
                        gameState.selectedDifficulty === 'hard' ? 'text-orange-400' :
                        'text-red-400'
                      }`}>
                        🤖 {gameState.selectedOpponent?.character}'s Solution:
                      </h3>
                      <button
                        onClick={() => {
                          setGameState(prev => ({
                            ...prev,
                            gamePhase: 'solution'
                          }));
                          startTimer();
                        }}
                        className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors"
                        aria-label="Skip to answer phase"
                        title="Skip to answer phase"
                      >
                        Skip Intro
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(gameState.currentProblem.steps || []).map((step, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg transition-all ${
                            gameState.currentProblem?.hasError && index === gameState.currentProblem?.errorStep
                              ? 'bg-red-500/30 border border-red-500 animate-pulse'
                              : 'bg-white/5'
                          }`}
                        >
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* For other formats, show the question content */}
                {gameState.currentProblem.format !== 'catch-mistake' && (
                  <QuestionDisplay
                    problem={gameState.currentProblem}
                    onAnswer={(answer) => {
                      // For non-catch-mistake formats, we need to determine if the answer is correct
                      const isCorrect = answer === gameState.currentProblem.correctAnswer;
                      handleAnswer(isCorrect);
                    }}
                    isAnswered={gameState.gamePhase === 'feedback'}
                    selectedAnswer={gameState.gamePhase === 'feedback' ? gameState.currentProblem.correctAnswer : undefined}
                  />
                )}
              </div>
            )}
          </div>

          {/* Enhanced Action Buttons with Character Theming - Only for catch-mistake format */}
          {gameState.gamePhase === 'solution' && gameState.currentProblem?.format === 'catch-mistake' && (
            <div className="flex justify-center gap-6" role="group" aria-label="Battle actions">
              <button
                data-action="correct"
                onClick={() => handleAnswer(true)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnswer(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50"
                aria-label="Mark solution as correct (Press 1 or Enter)"
                title="Press 1 or Enter to mark as correct"
              >
                ✓ CORRECT! <span className="text-sm opacity-75">(1/Enter)</span>
              </button>
              <button
                data-action="mistake"
                onClick={() => handleAnswer(false)}
                onKeyDown={(e) => e.key === ' ' && (e.preventDefault(), handleAnswer(false))}
                className={`text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
                  gameState.selectedOpponent ? 
                    `bg-gradient-to-r from-${gameState.selectedOpponent.theme.accent.replace('text-', '')}-500 to-${gameState.selectedOpponent.theme.accent.replace('text-', '')}-600 hover:from-${gameState.selectedOpponent.theme.accent.replace('text-', '')}-600 hover:to-${gameState.selectedOpponent.theme.accent.replace('text-', '')}-700 focus:ring-${gameState.selectedOpponent.theme.accent.replace('text-', '')}-400` :
                    'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:ring-red-400'
                }`}
                aria-label="Catch mistake in solution (Press 2 or Space)"
                title="Press 2 or Space to catch mistake"
              >
                ⚡ CATCH MISTAKE! <span className="text-sm opacity-75">(2/Space)</span>
              </button>
            </div>
          )}

          {/* Enhanced Feedback with Character Theming */}
          {gameState.gamePhase === 'feedback' && gameState.currentProblem && (
            <div className={`text-center backdrop-blur-md rounded-2xl p-6 border ${
              gameState.selectedOpponent ? 
                `bg-black/40 border-${gameState.selectedOpponent.theme.accent.replace('text-', '')}-500/30` :
                'bg-black/30 border-teal-500/30'
            }`}>
              <div className="text-4xl mb-4">
                {gameState.currentProblem.hasError ? '🎉' : '💡'}
              </div>
              <div className="text-xl font-bold mb-2">
                {gameState.currentProblem.explanation}
              </div>
              <div className={`${
                gameState.selectedOpponent ? gameState.selectedOpponent.theme.accent : 'text-teal-400'
              }`}>
                {gameState.streak > 0 ? `🔥 ${gameState.streak} streak!` : 'Keep trying!'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Character-themed Success Particles */}
      {(particles || []).map(particle => (
        <div
          key={particle.id}
          className="fixed w-4 h-4 rounded-full animate-ping pointer-events-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: gameState.selectedOpponent ? 
              gameState.selectedOpponent.theme.accent === 'text-yellow-400' ? '#fbbf24' :
              gameState.selectedOpponent.theme.accent === 'text-red-400' ? '#f87171' :
              gameState.selectedOpponent.theme.accent === 'text-green-400' ? '#34d399' :
              gameState.selectedOpponent.theme.accent === 'text-blue-400' ? '#60a5fa' :
              gameState.selectedOpponent.theme.accent === 'text-purple-400' ? '#a78bfa' :
              gameState.selectedOpponent.theme.accent === 'text-orange-400' ? '#fb923c' :
              gameState.selectedOpponent.theme.accent === 'text-cyan-400' ? '#22d3ee' :
              particle.color : particle.color,
            animationDuration: '2s'
          }}
        />
      ))}
    </div>
  );
};

export default BattleMode;