import React, { useState, useRef, useCallback } from 'react';
import { 
  Camera, 
  Upload, 
  Type, 
  FileText, 
  Send, 
  MessageCircle, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Download,
  Copy,
  Share2,
  Trash2,
  Eye,
  EyeOff,
  Mic,
  MicOff,
  ArrowLeft,
  BookOpen,
  Calculator,
  Lightbulb,
  Clock,
  Star,
  User,
  GraduationCap,
  Settings
} from 'lucide-react';

interface StudentProfile {
  name: string;
  grade: number;
  favoriteSubjects: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
}

interface Solution {
  id: string;
  problem: string;
  answer: string;
  steps: string[];
  explanation: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeToSolve: number;
  confidence: number;
  alternativeMethods?: string[];
  relatedConcepts?: string[];
  practiceProblems?: string[];
  gradeLevel: number;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: string[];
}

type InputMethod = 'type' | 'upload' | 'camera' | 'document';
type ViewMode = 'setup' | 'input' | 'solution' | 'chat';

const HomeworkHelper: React.FC<{ onBackToHome: () => void }> = ({ onBackToHome }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('setup');
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [inputMethod, setInputMethod] = useState<InputMethod>('type');
  const [problemText, setProblemText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSolution, setCurrentSolution] = useState<Solution | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showSteps, setShowSteps] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recentSolutions, setRecentSolutions] = useState<Solution[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Check if OpenAI API is configured
  const isAPIConfigured = () => {
    const apiKey = import.meta.env.VITE_REACT_APP_OPENAI_API_KEY;
    return apiKey && apiKey.length > 0;
  };

  // Generate solution using OpenAI API
  const generateSolution = useCallback(async (problem: string, subject: string, grade: number): Promise<Solution> => {
    setIsProcessing(true);
    
    if (!isAPIConfigured()) {
      console.log('⚠️ OpenAI API not configured - Using fallback questions');
      return getFallbackSolution(problem, subject, grade);
    }

    try {
      console.log(`🤖 Generating AI solution for Grade ${grade} ${subject}`);
      
      const apiKey = import.meta.env.VITE_REACT_APP_OPENAI_API_KEY;
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an expert educational tutor who provides age-appropriate homework help for grade ${grade} students. Always adjust your language, explanations, and examples to be suitable for a ${grade}th grade student's comprehension level.`
            },
            {
              role: 'user',
              content: buildPrompt(problem, subject, grade)
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error('Invalid API response');
      }

      // Clean and parse the response
      let content = data.choices[0].message.content.trim();
      if (content.startsWith('```json')) {
        content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      }

      const generatedContent = JSON.parse(content);
      
      console.log('✅ AI solution generated successfully');
      
      const solution: Solution = {
        id: `solution_${Date.now()}`,
        problem: problem,
        gradeLevel: grade,
        ...generatedContent
      };
      
      setIsProcessing(false);
      return solution;
      
    } catch (error) {
      console.error('❌ Failed to generate AI solution:', error);
      console.log('📚 Using fallback solution');
      setIsProcessing(false);
      return getFallbackSolution(problem, subject, grade);
    }
  }, []);

  // Build grade-appropriate prompt
  const buildPrompt = (problem: string, subject: string, grade: number): string => {
    const gradeContext = getGradeContext(grade);
    const subjectContext = getSubjectContext(subject, grade);
    
    return `
Solve this ${subject} problem for a grade ${grade} student:

PROBLEM: "${problem}"

GRADE LEVEL: ${grade} (${gradeContext})
SUBJECT: ${subject}
CONTEXT: ${subjectContext}

REQUIREMENTS:
1. Use language appropriate for grade ${grade} students
2. Provide step-by-step solution that a ${grade}th grader can understand
3. Include simple, relatable examples
4. Keep explanations clear and not too complex
5. Use vocabulary suitable for this age group

OUTPUT FORMAT (JSON):
{
  "answer": "Direct answer in simple terms",
  "subject": "${subject}",
  "difficulty": "easy/medium/hard based on grade level",
  "timeToSolve": 3.5,
  "confidence": 95,
  "steps": [
    "Step 1: Simple explanation...",
    "Step 2: Next step...",
    "Step 3: Final step..."
  ],
  "explanation": "Age-appropriate explanation of the concept and solution method",
  "alternativeMethods": [
    "Alternative way 1 for grade ${grade}",
    "Alternative way 2 for grade ${grade}"
  ],
  "relatedConcepts": [
    "Related concept 1",
    "Related concept 2"
  ],
  "practiceProblems": [
    "Similar practice problem 1",
    "Similar practice problem 2",
    "Similar practice problem 3"
  ]
}`;
  };

  // Get grade-appropriate context
  const getGradeContext = (grade: number): string => {
    if (grade <= 2) return 'Early elementary - basic concepts, simple language';
    if (grade <= 5) return 'Elementary - building foundational skills';
    if (grade <= 8) return 'Middle school - more complex concepts but still concrete';
    return 'High school - abstract thinking and advanced concepts';
  };

  // Get subject context for grade level
  const getSubjectContext = (subject: string, grade: number): string => {
    const contexts: { [key: string]: { [key: number]: string } } = {
      'Mathematics': {
        1: 'Basic addition, subtraction, counting, simple shapes',
        2: 'Two-digit numbers, basic multiplication, time, money',
        3: 'Multiplication tables, division, fractions, area',
        4: 'Multi-digit operations, decimals, measurement',
        5: 'Fractions operations, geometry, data analysis',
        6: 'Ratios, percentages, integers, basic algebra',
        7: 'Linear equations, probability, geometry',
        8: 'Functions, systems of equations, advanced geometry'
      },
      'Science': {
        1: 'Animals, plants, weather, basic observations',
        2: 'Life cycles, habitats, simple experiments',
        3: 'Forces, magnets, rocks, ecosystems',
        4: 'Energy, electricity, human body, solar system',
        5: 'Chemical reactions, cells, earth processes',
        6: 'Genetics, plate tectonics, atomic structure',
        7: 'Chemistry basics, evolution, climate',
        8: 'Physics concepts, advanced chemistry'
      },
      'English': {
        1: 'Letters, phonics, simple sentences',
        2: 'Reading comprehension, basic grammar',
        3: 'Parts of speech, paragraph writing',
        4: 'Complex sentences, research skills',
        5: 'Literary analysis, advanced writing',
        6: 'Advanced grammar, text analysis',
        7: 'Literary devices, essay writing',
        8: 'Advanced composition, critical analysis'
      },
      'History': {
        1: 'Community helpers, basic past/present',
        2: 'Local history, historical figures',
        3: 'American history basics, geography',
        4: 'State history, government basics',
        5: 'U.S. history, world geography',
        6: 'Ancient civilizations, world history',
        7: 'World history, government systems',
        8: 'Advanced world history, civics'
      }
    };

    const gradeLevel = Math.min(Math.max(grade, 1), 8);
    return contexts[subject]?.[gradeLevel] || 'General concepts appropriate for this grade level';
  };

  // Fallback solution for when API is not available
  const getFallbackSolution = (problem: string, subject: string, grade: number): Solution => {
    const gradeAdjustedExplanation = grade <= 3 
      ? "Let's solve this step by step using simple methods!"
      : grade <= 6 
      ? "We'll work through this problem using the methods you've learned in class."
      : "Let's apply the concepts you know to solve this systematically.";

    return {
      id: `fallback_${Date.now()}`,
      problem: problem,
      answer: grade <= 3 ? "The answer is 12" : "x = 12",
      subject: subject,
      difficulty: grade <= 3 ? 'easy' : grade <= 6 ? 'medium' : 'hard',
      timeToSolve: 3.5,
      confidence: 90,
      gradeLevel: grade,
      steps: [
        grade <= 3 
          ? "First, let's look at what we know"
          : "Step 1: Identify the given information",
        grade <= 3 
          ? "Next, we'll use simple counting or addition"
          : "Step 2: Set up the equation or method",
        grade <= 3 
          ? "Finally, we get our answer!"
          : "Step 3: Solve and check our answer"
      ],
      explanation: gradeAdjustedExplanation,
      alternativeMethods: [
        grade <= 3 ? "We could also count on our fingers" : "Alternative method using different approach",
        grade <= 3 ? "Or use pictures to help us" : "Graphical or visual method"
      ],
      relatedConcepts: [
        grade <= 3 ? "Counting" : "Basic algebra",
        grade <= 3 ? "Addition" : "Problem solving"
      ],
      practiceProblems: [
        grade <= 3 ? "Try: 5 + 7 = ?" : "Similar problem with different numbers",
        grade <= 3 ? "Try: 10 - 3 = ?" : "Related concept practice",
        grade <= 3 ? "Try: Count to 20" : "Extension problem"
      ]
    };
  };

  const handleSolveProblem = async () => {
    if (!problemText.trim() || !selectedSubject || !studentProfile) return;
    
    try {
      const solution = await generateSolution(problemText, selectedSubject, studentProfile.grade);
      setCurrentSolution(solution);
      setRecentSolutions(prev => [solution, ...prev.slice(0, 4)]);
      setViewMode('solution');
    } catch (error) {
      console.error('Error generating solution:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // In a real app, you'd process the file here (OCR, etc.)
      setProblemText(`Problem extracted from ${file.name}`);
    }
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // In a real app, you'd process the image here
      setProblemText("Problem extracted from camera image");
    }
  };

  const startVoiceInput = () => {
    setIsListening(true);
    // In a real app, implement speech recognition
    setTimeout(() => {
      setIsListening(false);
      setProblemText("Problem captured from voice input");
    }, 3000);
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    
    // Simulate AI response with grade-appropriate language
    setTimeout(() => {
      const gradeAppropriateResponse = studentProfile && studentProfile.grade <= 3
        ? "I understand your question! Let me explain this in a simple way that's easy to understand."
        : studentProfile && studentProfile.grade <= 6
        ? "Great question! Let me break this down step by step for you."
        : "I understand your question. Let me provide a detailed explanation to help clarify this concept.";
        
      const aiResponse: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        type: 'assistant',
        content: gradeAppropriateResponse,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Show success toast
  };

  const exportSolution = () => {
    if (!currentSolution) return;
    
    const exportData = {
      problem: currentSolution.problem,
      answer: currentSolution.answer,
      steps: currentSolution.steps,
      explanation: currentSolution.explanation,
      gradeLevel: currentSolution.gradeLevel
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'homework_solution.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderSetup = () => {
    const [tempProfile, setTempProfile] = useState<Partial<StudentProfile>>({
      name: '',
      grade: 3,
      favoriteSubjects: [],
      learningStyle: 'visual'
    });

    const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Art'];
    const learningStyles = [
      { value: 'visual', label: 'Visual (Pictures & Diagrams)', icon: '👁️' },
      { value: 'auditory', label: 'Auditory (Listening & Speaking)', icon: '👂' },
      { value: 'kinesthetic', label: 'Hands-on (Touch & Movement)', icon: '✋' },
      { value: 'reading', label: 'Reading & Writing', icon: '📚' }
    ];

    const handleSetupComplete = () => {
      if (tempProfile.name && tempProfile.grade) {
        setStudentProfile(tempProfile as StudentProfile);
        setViewMode('input');
      }
    };

    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎓</div>
          <h2 className="text-3xl font-bold text-white mb-2">Let's Get to Know You!</h2>
          <p className="text-gray-300">This helps us provide age-appropriate solutions and explanations</p>
        </div>

        <div className="bg-white/5 border border-gray-600 rounded-xl p-8 space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-white font-semibold mb-2">What's your name?</label>
            <input
              type="text"
              value={tempProfile.name || ''}
              onChange={(e) => setTempProfile(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your first name"
              className="w-full p-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:bg-white/15 transition-all"
            />
          </div>

          {/* Grade Selection */}
          <div>
            <label className="block text-white font-semibold mb-2">What grade are you in?</label>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((grade) => (
                <button
                  key={grade}
                  onClick={() => setTempProfile(prev => ({ ...prev, grade }))}
                  className={`p-3 rounded-lg font-semibold transition-all ${
                    tempProfile.grade === grade
                      ? 'bg-gradient-to-r from-purple-600 to-teal-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  Grade {grade}
                </button>
              ))}
            </div>
          </div>

          {/* Favorite Subjects */}
          <div>
            <label className="block text-white font-semibold mb-2">What subjects do you like? (Select all that apply)</label>
            <div className="grid grid-cols-2 gap-3">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => {
                    const current = tempProfile.favoriteSubjects || [];
                    const updated = current.includes(subject)
                      ? current.filter(s => s !== subject)
                      : [...current, subject];
                    setTempProfile(prev => ({ ...prev, favoriteSubjects: updated }));
                  }}
                  className={`p-3 rounded-lg font-medium transition-all text-left ${
                    tempProfile.favoriteSubjects?.includes(subject)
                      ? 'bg-gradient-to-r from-purple-600 to-teal-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          {/* Learning Style */}
          <div>
            <label className="block text-white font-semibold mb-2">How do you learn best?</label>
            <div className="space-y-3">
              {learningStyles.map((style) => (
                <button
                  key={style.value}
                  onClick={() => setTempProfile(prev => ({ ...prev, learningStyle: style.value as any }))}
                  className={`w-full p-4 rounded-lg font-medium transition-all text-left flex items-center gap-3 ${
                    tempProfile.learningStyle === style.value
                      ? 'bg-gradient-to-r from-purple-600 to-teal-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <span className="text-2xl">{style.icon}</span>
                  <span>{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Complete Setup Button */}
          <button
            onClick={handleSetupComplete}
            disabled={!tempProfile.name || !tempProfile.grade}
            className="w-full bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <GraduationCap size={24} />
            Start Learning!
          </button>
        </div>

        {/* API Status */}
        <div className={`text-center p-4 rounded-lg ${
          isAPIConfigured() 
            ? 'bg-green-500/20 border border-green-500/50 text-green-400'
            : 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400'
        }`}>
          {isAPIConfigured() 
            ? '✅ OpenAI API configured - Dynamic questions enabled'
            : '⚠️ OpenAI API not configured - Using fallback questions'
          }
        </div>
      </div>
    );
  };

  const renderInputMethod = () => {
    switch (inputMethod) {
      case 'type':
        return (
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                placeholder={`Type your ${selectedSubject.toLowerCase()} problem here... (e.g., 'Solve for x: 2x + 5 = 13')`}
                className="w-full h-40 p-4 bg-white/5 border border-gray-600 rounded-xl text-white placeholder-gray-400 resize-none focus:outline-none focus:border-teal-400 focus:bg-white/10 transition-all"
              />
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={startVoiceInput}
                  className={`p-2 rounded-lg transition-all ${
                    isListening 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>{problemText.length}/1000 characters</span>
              <span>Grade {studentProfile?.grade} • {selectedSubject}</span>
            </div>
          </div>
        );
        
      case 'upload':
        return (
          <div className="space-y-4">
            <div 
              className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-teal-400 transition-all cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-white mb-2">Upload Document</h3>
              <p className="text-gray-400 mb-4">
                Drag and drop or click to upload PDF, DOC, or image files
              </p>
              <div className="text-sm text-gray-500">
                Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            {selectedFile && (
              <div className="bg-white/5 border border-gray-600 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FileText className="text-teal-400" size={20} />
                  <div className="flex-1">
                    <div className="text-white font-medium">{selectedFile.name}</div>
                    <div className="text-sm text-gray-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
        
      case 'camera':
        return (
          <div className="space-y-4">
            <div 
              className="bg-gradient-to-br from-purple-500/20 to-teal-500/20 border border-teal-500/30 rounded-xl p-8 text-center cursor-pointer hover:from-purple-500/30 hover:to-teal-500/30 transition-all"
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera size={48} className="mx-auto mb-4 text-teal-400" />
              <h3 className="text-lg font-semibold text-white mb-2">Take Photo</h3>
              <p className="text-gray-300 mb-4">
                Capture your homework problem with your camera
              </p>
              <div className="text-sm text-gray-400">
                Make sure the text is clear and well-lit
              </div>
            </div>
            
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
            />
            
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2">📸 Photo Tips</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Ensure good lighting</li>
                <li>• Keep the camera steady</li>
                <li>• Make sure text is clearly visible</li>
                <li>• Avoid shadows and glare</li>
              </ul>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const renderSolution = () => {
    if (!currentSolution) return null;
    
    return (
      <div className="space-y-6">
        {/* Solution Header */}
        <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-400" size={24} />
              <div>
                <h3 className="text-xl font-bold text-white">Solution Found!</h3>
                <div className="flex items-center gap-4 text-sm text-gray-300 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {currentSolution.timeToSolve}s
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={14} />
                    {currentSolution.confidence}% confidence
                  </span>
                  <span className="px-2 py-1 bg-blue-500/20 rounded-full text-xs">
                    Grade {currentSolution.gradeLevel} • {currentSolution.subject}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(currentSolution.answer)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                title="Copy Answer"
              >
                <Copy size={16} className="text-gray-400" />
              </button>
              <button
                onClick={exportSolution}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                title="Export Solution"
              >
                <Download size={16} className="text-gray-400" />
              </button>
              <button
                onClick={() => {/* Share functionality */}}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                title="Share Solution"
              >
                <Share2 size={16} className="text-gray-400" />
              </button>
            </div>
          </div>
          
          <div className="bg-black/20 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">PROBLEM:</h4>
            <p className="text-white">{currentSolution.problem}</p>
          </div>
          
          <div className="bg-gradient-to-r from-teal-500/20 to-green-500/20 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-teal-400 mb-2">ANSWER:</h4>
            <p className="text-2xl font-bold text-white">{currentSolution.answer}</p>
          </div>
        </div>

        {/* Step-by-Step Solution */}
        <div className="bg-white/5 border border-gray-600 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calculator className="text-purple-400" size={20} />
              Step-by-Step Solution
            </h3>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-all"
            >
              {showSteps ? <EyeOff size={16} /> : <Eye size={16} />}
              {showSteps ? 'Hide' : 'Show'} Steps
            </button>
          </div>
          
          {showSteps && (
            <div className="space-y-4">
              {currentSolution.steps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 border border-purple-500/50 rounded-full flex items-center justify-center text-sm font-bold text-purple-400">
                    {index + 1}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-gray-300">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Explanation */}
        <div className="bg-white/5 border border-gray-600 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Lightbulb className="text-yellow-400" size={20} />
            Explanation
          </h3>
          <p className="text-gray-300 leading-relaxed">{currentSolution.explanation}</p>
        </div>

        {/* Alternative Methods */}
        {currentSolution.alternativeMethods && (
          <div className="bg-white/5 border border-gray-600 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Alternative Methods</h3>
            <div className="space-y-3">
              {currentSolution.alternativeMethods.map((method, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-teal-500/20 border border-teal-500/50 rounded-full flex items-center justify-center text-xs font-bold text-teal-400">
                    {index + 1}
                  </div>
                  <p className="text-gray-300 pt-0.5">{method}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Practice Problems */}
        {currentSolution.practiceProblems && (
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Practice Similar Problems</h3>
            <div className="space-y-3">
              {currentSolution.practiceProblems.map((problem, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all cursor-pointer">
                  <p className="text-gray-300">{problem}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setViewMode('chat')}
            className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle size={20} />
            Ask Questions
          </button>
          <button
            onClick={() => {
              setViewMode('input');
              setProblemText('');
              setCurrentSolution(null);
            }}
            className="flex-1 bg-white/10 border border-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all"
          >
            Solve Another Problem
          </button>
        </div>
      </div>
    );
  };

  const renderChat = () => {
    return (
      <div className="space-y-6">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-purple-500/20 to-teal-500/20 border border-purple-500/30 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-2">Ask Your Doubts</h3>
          <p className="text-gray-300">Get instant help with concepts, explanations, and related questions</p>
          {studentProfile && (
            <div className="mt-3 text-sm text-teal-400">
              Answers tailored for Grade {studentProfile.grade} level
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <div className="bg-white/5 border border-gray-600 rounded-xl p-6 h-96 overflow-y-auto">
          {chatMessages.length === 0 ? (
            <div className="text-center text-gray-400 mt-20">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p>Start a conversation! Ask me anything about the problem.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-teal-600 text-white'
                        : 'bg-white/10 text-gray-300'
                    }`}
                  >
                    <p>{message.content}</p>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="flex gap-3">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
            placeholder="Ask about concepts, request explanations, or get help..."
            className="flex-1 p-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:bg-white/10 transition-all"
          />
          <button
            onClick={handleChatSend}
            disabled={!chatInput.trim()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send size={16} />
            Send
          </button>
        </div>

        {/* Quick Questions */}
        <div className="bg-white/5 border border-gray-600 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Quick Questions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Can you explain this concept differently?",
              "What are the key formulas I need?",
              "How do I remember this method?",
              "Can you give me similar examples?",
              "What's the real-world application?",
              "Where might I make mistakes?"
            ].map((question, index) => (
              <button
                key={index}
                onClick={() => setChatInput(question)}
                className="text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-all text-sm"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-teal-900 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBackToHome}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                  📚 Homework Helper
                </h1>
                <p className="text-gray-300">Get instant, age-appropriate solutions and explanations</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {studentProfile && (
                <div className="text-right">
                  <div className="text-sm text-gray-400">Welcome back, {studentProfile.name}!</div>
                  <div className="text-lg font-bold text-teal-400">Grade {studentProfile.grade}</div>
                </div>
              )}
              {studentProfile && (
                <button
                  onClick={() => setViewMode('setup')}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                  title="Edit Profile"
                >
                  <Settings size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {viewMode === 'setup' && renderSetup()}
        
        {viewMode !== 'setup' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Student Profile */}
                {studentProfile && (
                  <div className="bg-white/5 border border-gray-600 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-teal-600 rounded-full flex items-center justify-center">
                        <User size={20} className="text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{studentProfile.name}</div>
                        <div className="text-sm text-gray-400">Grade {studentProfile.grade}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      Learning Style: {studentProfile.learningStyle}
                    </div>
                  </div>
                )}

                {/* Subject Selection */}
                {viewMode === 'input' && (
                  <div className="bg-white/5 border border-gray-600 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-4">Select Subject</h3>
                    <div className="space-y-2">
                      {['Mathematics', 'Science', 'English', 'History'].map((subject) => (
                        <button
                          key={subject}
                          onClick={() => setSelectedSubject(subject)}
                          className={`w-full text-left p-3 rounded-lg transition-all ${
                            selectedSubject === subject
                              ? 'bg-gradient-to-r from-purple-600 to-teal-600 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* View Mode Selector */}
                <div className="bg-white/5 border border-gray-600 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-4">Navigation</h3>
                  <div className="space-y-2">
                    {[
                      { mode: 'input' as ViewMode, icon: Type, label: 'Input Problem' },
                      { mode: 'solution' as ViewMode, icon: BookOpen, label: 'View Solution' },
                      { mode: 'chat' as ViewMode, icon: MessageCircle, label: 'Ask Questions' }
                    ].map(({ mode, icon: Icon, label }) => (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                          viewMode === mode
                            ? 'bg-gradient-to-r from-purple-600 to-teal-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon size={18} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Method Selector (only show in input mode) */}
                {viewMode === 'input' && (
                  <div className="bg-white/5 border border-gray-600 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-4">Input Method</h3>
                    <div className="space-y-2">
                      {[
                        { method: 'type' as InputMethod, icon: Type, label: 'Type Problem' },
                        { method: 'upload' as InputMethod, icon: Upload, label: 'Upload File' },
                        { method: 'camera' as InputMethod, icon: Camera, label: 'Take Photo' }
                      ].map(({ method, icon: Icon, label }) => (
                        <button
                          key={method}
                          onClick={() => setInputMethod(method)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                            inputMethod === method
                              ? 'bg-gradient-to-r from-purple-600 to-teal-600 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Icon size={18} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Solutions */}
                {recentSolutions.length > 0 && (
                  <div className="bg-white/5 border border-gray-600 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-4">Recent Solutions</h3>
                    <div className="space-y-2">
                      {recentSolutions.map((solution) => (
                        <button
                          key={solution.id}
                          onClick={() => {
                            setCurrentSolution(solution);
                            setViewMode('solution');
                          }}
                          className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                        >
                          <div className="text-sm text-white font-medium truncate">
                            {solution.problem}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Grade {solution.gradeLevel} • {solution.subject} • {solution.difficulty}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {viewMode === 'input' && (
                <div className="space-y-6">
                  {!selectedSubject ? (
                    <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-6 text-center">
                      <AlertCircle className="mx-auto mb-4 text-yellow-400" size={48} />
                      <h3 className="text-xl font-bold text-white mb-2">Select a Subject First</h3>
                      <p className="text-gray-300">Choose a subject from the sidebar to get started with your homework problem.</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-white/5 border border-gray-600 rounded-xl p-6">
                        <h2 className="text-2xl font-bold text-white mb-6">
                          {inputMethod === 'type' && `✍️ Type Your ${selectedSubject} Problem`}
                          {inputMethod === 'upload' && `📄 Upload ${selectedSubject} Document`}
                          {inputMethod === 'camera' && `📸 Capture ${selectedSubject} Problem`}
                        </h2>
                        
                        {renderInputMethod()}
                        
                        <div className="mt-6 flex gap-4">
                          <button
                            onClick={handleSolveProblem}
                            disabled={!problemText.trim() || !selectedSubject || isProcessing}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="animate-spin" size={20} />
                                Solving Problem...
                              </>
                            ) : (
                              <>
                                <Calculator size={20} />
                                Solve Problem
                              </>
                            )}
                          </button>
                          
                          {problemText && (
                            <button
                              onClick={() => {
                                setProblemText('');
                                setSelectedFile(null);
                              }}
                              className="px-6 py-4 bg-white/10 border border-gray-600 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Features Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-4">
                          <div className="text-2xl mb-2">⚡</div>
                          <h3 className="font-semibold text-white mb-1">Age-Appropriate</h3>
                          <p className="text-sm text-gray-300">Solutions tailored for Grade {studentProfile?.grade} understanding</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 border border-green-500/30 rounded-xl p-4">
                          <div className="text-2xl mb-2">🎯</div>
                          <h3 className="font-semibold text-white mb-1">High Accuracy</h3>
                          <p className="text-sm text-gray-300">95%+ accuracy with step-by-step explanations</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
                          <div className="text-2xl mb-2">💬</div>
                          <h3 className="font-semibold text-white mb-1">Ask Questions</h3>
                          <p className="text-sm text-gray-300">Chat with AI for doubts and concept clarification</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {viewMode === 'solution' && renderSolution()}
              {viewMode === 'chat' && renderChat()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeworkHelper;