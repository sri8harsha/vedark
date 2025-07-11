import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  MessageCircle,
  ArrowLeft,
  Loader,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Brain,
  Clock,
  Zap,
  Star,
  ChevronDown,
  ChevronUp,
  Copy,
  Share2,
  Bookmark,
  Play,
  Target,
  Award,
  Users,
  Shield,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface HomeworkHelperProps {
  onBackToHome: () => void;
}

interface AnalysisResult {
  question: string;
  answer: string;
  explanation: string;
  steps: string[];
  confidence: number;
  approaches?: string[];
  flashcards?: Array<{ question: string; answer: string }>;
  practiceQuestions?: string[];
  timeToSolve?: string;
}

type InputMode = 'text' | 'image';

interface HomeworkSession {
  id: string;
  questionText: string;
  inputMode: InputMode;
  uploadedImage: string | null;
  uploadedFile: File | null;
  isAnalyzing: boolean;
  analysisResult: AnalysisResult | null;
  error: string | null;
  expandedSteps: Set<number>;
  flashcardIndex: number;
  flashcards: Array<{ question: string; answer: string }>;
  activePracticeIndex: number | null;
}

const SUBJECTS = [
  'Mathematics',
  'Algebra',
  'Geometry',
  'Calculus',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Geography',
  'Computer Science',
  'Economics',
  'Business',
  'Statistics',
  'Social Studies',
  'Language',
  'Other',
];

const GRADES = [
  ...Array.from({ length: 12 }, (_, i) => (i + 1).toString()),
  '12+',
];

const HomeworkHelper: React.FC<HomeworkHelperProps> = ({ onBackToHome }) => {
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [subject, setSubject] = useState<string>('Mathematics');
  const [customSubject, setCustomSubject] = useState<string>('');
  const [showCustomSubject, setShowCustomSubject] = useState<boolean>(false);
  const [grade, setGrade] = useState<string>('9');
  const [questionText, setQuestionText] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [detectedSubject, setDetectedSubject] = useState<string | null>(null);
  const [detectedGrade, setDetectedGrade] = useState<string | null>(null);
  const [showMismatchWarning, setShowMismatchWarning] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcards, setFlashcards] = useState<Array<{ question: string; answer: string }>>([]);
  const flashcardContainerRef = useRef<HTMLDivElement>(null);
  const [activePracticeIndex, setActivePracticeIndex] = useState<number | null>(null);

  // Replace single-question state with sessions
  const [sessions, setSessions] = useState<HomeworkSession[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);

  // Helper to create a new session
  function createSession(questionText: string, inputMode: InputMode, uploadedImage: string | null, uploadedFile: File | null): HomeworkSession {
    return {
      id: Math.random().toString(36).slice(2),
      questionText,
      inputMode,
      uploadedImage,
      uploadedFile,
      isAnalyzing: false,
      analysisResult: null,
      error: null,
      expandedSteps: new Set(),
      flashcardIndex: 0,
      flashcards: [],
      activePracticeIndex: null,
    };
  }

  // Add a new session and set it active
  function addSession(questionText: string, inputMode: InputMode, uploadedImage: string | null, uploadedFile: File | null) {
    const newSession = createSession(questionText, inputMode, uploadedImage, uploadedFile);
    setSessions(prev => [...prev, newSession]);
    setActiveSession(newSession.id);
  }

  // Remove a session by id
  function closeSession(id: string) {
    setSessions(prev => prev.filter(s => s.id !== id));
    setTimeout(() => {
      setSessions(current => {
        if (current.length === 0) return [];
        if (activeSession === id) {
          setActiveSession(current[current.length - 1].id);
        }
        return current;
      });
    }, 0);
  }

  // Get the current session object
  const currentSession = sessions.find(s => s.id === activeSession) || null;

  // Simple keyword-based subject/grade detection
  const detectSubjectAndGrade = (text: string) => {
    const subjectKeywords: { [key: string]: string[] } = {
      Mathematics: ['math', 'algebra', 'geometry', 'calculus', 'equation', 'integral', 'derivative'],
      Physics: ['physics', 'velocity', 'acceleration', 'force', 'energy', 'photoelectric', 'electron', 'wavelength', 'frequency', 'potential'],
      Chemistry: ['chemistry', 'mole', 'reaction', 'compound', 'element', 'acid', 'base', 'salt', 'atom', 'molecule'],
      Biology: ['biology', 'cell', 'organism', 'photosynthesis', 'mitosis', 'meiosis', 'gene', 'chromosome'],
      English: ['english', 'grammar', 'essay', 'literature', 'poem', 'novel', 'story'],
      History: ['history', 'war', 'revolution', 'empire', 'ancient', 'medieval', 'modern'],
      Geography: ['geography', 'continent', 'country', 'river', 'mountain', 'climate'],
      'Computer Science': ['computer', 'algorithm', 'program', 'code', 'software', 'hardware'],
      Economics: ['economics', 'market', 'demand', 'supply', 'inflation', 'gdp'],
      Business: ['business', 'profit', 'loss', 'revenue', 'cost', 'investment'],
      Statistics: ['statistics', 'mean', 'median', 'mode', 'probability', 'distribution'],
      'Social Studies': ['social', 'society', 'culture', 'civics', 'government'],
      Language: ['language', 'spanish', 'french', 'german', 'hindi', 'mandarin'],
    };
    let detectedSub: string | null = null;
    let detectedGrd: string | null = null;
    const lower = text.toLowerCase();
    for (const [subj, keywords] of Object.entries(subjectKeywords)) {
      if (keywords.some(k => lower.includes(k))) {
        detectedSub = subj;
        break;
      }
    }
    // Grade detection: look for numbers like 'grade 9', 'class 12', etc.
    const gradeMatch = lower.match(/(grade|class)\s*(\d{1,2}|12\+)/);
    if (gradeMatch) {
      detectedGrd = gradeMatch[2];
    } else {
      // fallback: look for numbers 1-12 in context
      for (let g = 12; g >= 1; g--) {
        if (lower.includes(`grade ${g}`) || lower.includes(`class ${g}`) || lower.includes(`${g}th`) || lower.includes(`${g}rd`) || lower.includes(`${g}st`) || lower.includes(`${g}nd`)) {
          detectedGrd = g.toString();
          break;
        }
      }
    }
    return { detectedSub, detectedGrd };
  };

  // Watch questionText and update detected subject/grade
  React.useEffect(() => {
    if (questionText.trim().length > 0) {
      const { detectedSub, detectedGrd } = detectSubjectAndGrade(questionText);
      setDetectedSubject(detectedSub);
      setDetectedGrade(detectedGrd);
      // Show warning if mismatch
      if ((detectedSub && detectedSub !== subject) || (detectedGrd && detectedGrd !== grade)) {
        setShowMismatchWarning(true);
      } else {
        setShowMismatchWarning(false);
      }
    } else {
      setDetectedSubject(null);
      setDetectedGrade(null);
      setShowMismatchWarning(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionText, subject, grade]);

  // Update flashcards when analysisResult changes
  React.useEffect(() => {
    if (analysisResult && analysisResult.flashcards) {
      let cards = analysisResult.flashcards;
      if (cards.length < 5) {
        cards = generateExtraFlashcards(cards, analysisResult.explanation, analysisResult.steps || []);
      }
      setFlashcards(cards);
      setFlashcardIndex(0);
    } else {
      setFlashcards([]);
      setFlashcardIndex(0);
    }
  }, [analysisResult]);

  // Swipe and keyboard support for flashcards
  React.useEffect(() => {
    const container = flashcardContainerRef.current;
    if (!container) return;
    let startX = 0;
    let endX = 0;
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      endX = e.changedTouches[0].clientX;
      if (startX - endX > 50) {
        setFlashcardIndex((prev) => Math.min(prev + 1, flashcards.length - 1));
      } else if (endX - startX > 50) {
        setFlashcardIndex((prev) => Math.max(prev - 1, 0));
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setFlashcardIndex(i => Math.min(i + 1, flashcards.length - 1));
      if (e.key === 'ArrowLeft') setFlashcardIndex(i => Math.max(i - 1, 0));
    };
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [flashcards]);

  // Handler for 'Get More Flashcards'
  const handleGetMoreFlashcards = () => {
    if (!analysisResult) return;
    // Generate 5 more cards using explanation/steps (simulate new cards)
    const more = generateExtraFlashcards([], analysisResult.explanation, analysisResult.steps || []);
    setFlashcards(prev => prev.concat(more));
    setFlashcardIndex(flashcards.length); // jump to first new card
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSubject(value);
    if (value === 'Other') {
      setShowCustomSubject(true);
    } else {
      setShowCustomSubject(false);
      setCustomSubject('');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setUploadedFile(file);
      // Check if it's a document file (.docx, .doc)
      const isDocument = file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc');
      if (isDocument) {
        setUploadedImage(null);
        setError(null);
        setAnalysisResult(null);
        // Add a session and immediately analyze the document
        const session = createSession('', 'image', null, file);
        setSessions(prev => [...prev, session]);
        setActiveSession(session.id);
        setTimeout(() => {
          handleAnalyze('', 'image', null, file, session.id);
        }, 100);
      } else {
        // For images, create a preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setUploadedImage(result);
          setError(null);
          setAnalysisResult(null);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // When user submits a new question (typed or image), add a new session
  const handleAnalyze = async (questionText: string, inputMode: InputMode, uploadedImage: string | null, uploadedFile: File | null, sessionId?: string) => {
    let session: HomeworkSession | undefined;
    setSessions(prev => prev.map(s => {
      if (sessionId ? s.id === sessionId : s.id === activeSession) {
        session = { ...s, isAnalyzing: true, error: null };
        return session;
      }
      return s;
    }));
    try {
      let response;
      if (inputMode === 'image' && uploadedFile) {
        // Check if it's a document file
        const isDocument = uploadedFile.name.toLowerCase().endsWith('.docx') || uploadedFile.name.toLowerCase().endsWith('.doc');
        
        if (isDocument) {
          // Send to document processing endpoint
          const formData = new FormData();
          formData.append('document', uploadedFile);
          formData.append('subject', subject);
          formData.append('grade', grade);
          response = await fetch('/api/process-document', {
            method: 'POST',
            body: formData
          });
        } else {
          // Send to image processing endpoint
          const formData = new FormData();
          formData.append('image', uploadedFile);
          formData.append('subject', subject);
          formData.append('grade', grade);
          response = await fetch('/api/gpt4v', {
            method: 'POST',
            body: formData
          });
        }
      } else {
        response = await fetch('/api/homework-helper', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: questionText,
            subject,
            grade
          })
        });
      }
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `API request failed with status ${response.status}`);
      }
      const result = await response.json();
      // Debug log: print the full backend response
      console.log('Backend response:', result);
      // If result is an array (multi-question), create a session for each
      if (Array.isArray(result)) {
        // Create new sessions for each question
        const newSessions = result.map((r, i) => ({
          ...createSession(r.question, inputMode, uploadedImage, uploadedFile),
          isAnalyzing: false,
          analysisResult: r,
          flashcards: (r.flashcards && r.flashcards.length < 5)
            ? generateExtraFlashcards(r.flashcards, r.explanation, r.steps || [])
            : (r.flashcards || []),
          flashcardIndex: 0
        }));
        const filtered = sessions.filter(s => !(sessionId ? s.id === sessionId : s.id === activeSession));
        const allSessions = [...filtered, ...newSessions];
        setSessions(allSessions);
        // Set active session to the first new session
        if (newSessions.length > 0) {
          setActiveSession(newSessions[0].id);
        } else if (allSessions.length > 0) {
          setActiveSession(allSessions[0].id);
        } else {
          setActiveSession(null);
        }
        // Debug log
        console.log('Created sessions:', allSessions);
      } else {
        setSessions(prev => prev.map(s => {
          if (sessionId ? s.id === sessionId : s.id === activeSession) {
            // Generate flashcards if needed
            let cards = result.flashcards || [];
            if (cards.length < 5) {
              cards = generateExtraFlashcards(cards, result.explanation, result.steps || []);
            }
            return { ...s, isAnalyzing: false, analysisResult: result, flashcards: cards, flashcardIndex: 0 };
          }
          return s;
        }));
      }
    } catch (error: any) {
      setSessions(prev => prev.map(s => {
        if (sessionId ? s.id === sessionId : s.id === activeSession) {
          return { ...s, isAnalyzing: false, error: error.message || 'Failed to analyze question.' };
        }
        return s;
      }));
    }
  };

  // When a practice problem is clicked, add a new session
  const handlePracticeClick = (practiceQuestion: string) => {
    addSession(practiceQuestion, 'text', null, null);
    setTimeout(() => {
      const newId = sessions.length > 0 ? sessions[sessions.length - 1].id : null;
      if (newId) handleAnalyze(practiceQuestion, 'text', null, null, newId);
    }, 100);
  };

  // Render the tab bar
  const renderTabs = () => (
    <div className="flex gap-2 border-b border-green-800/40 mb-6 overflow-x-auto">
      {sessions.map((s, idx) => (
        <div key={s.id} className={`flex items-center px-4 py-2 rounded-t-lg cursor-pointer transition-all font-bold text-sm ${activeSession === s.id ? 'bg-gradient-to-r from-green-700 to-emerald-700 text-white shadow-lg' : 'bg-green-900/30 text-green-200 hover:bg-green-800/40'}`}
          onClick={() => setActiveSession(s.id)}>
          <span className="truncate max-w-xs">{s.questionText.slice(0, 40) || `Question ${idx + 1}`}</span>
          <button onClick={e => { e.stopPropagation(); closeSession(s.id); }} className="ml-2 text-green-300 hover:text-red-400">×</button>
        </div>
      ))}
    </div>
  );

  const resetForm = () => {
    setQuestionText('');
    setUploadedImage(null);
    setUploadedFile(null);
    setAnalysisResult(null);
    setError(null);
    setExpandedSteps(new Set());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleStep = (index: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSteps(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Helper to auto-generate flashcards from explanation/steps
  function generateExtraFlashcards(base: Array<{ question: string; answer: string }>, explanation: string, steps: string[]): Array<{ question: string; answer: string }> {
    const extras: Array<{ question: string; answer: string }> = [];
    if (explanation) {
      extras.push({
        question: 'Summarize the main idea of the explanation.',
        answer: explanation.length > 120 ? explanation.slice(0, 120) + '...' : explanation
      });
    }
    if (steps && steps.length > 0) {
      steps.slice(0, 2).forEach((step, i) => {
        extras.push({
          question: `What is step ${i + 1} in the solution?`,
          answer: step
        });
      });
    }
    // Fallback generic cards
    while (extras.length + base.length < 5) {
      extras.push({
        question: 'What did you learn from this problem?',
        answer: 'Reflect on the key concepts and methods used.'
      });
    }
    return base.concat(extras).slice(0, 5);
  }

  // --- UI ---
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-green-800/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={onBackToHome}
                className="flex items-center gap-2 bg-green-900/30 hover:bg-green-800/40 px-4 py-2 rounded-full transition-all border border-green-700/40"
              >
                <ArrowLeft size={20} />
                Back to Home
              </button>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  🤝 AI Homework Helper
                </h1>
                <p className="text-green-200 text-sm">Get instant step-by-step solutions powered by AI</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-green-400">
                <Shield size={16} />
                <span>99.5% Accuracy</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <Zap size={16} />
                <span>Instant Solutions</span>
              </div>
              <div className="flex items-center gap-2 text-green-300">
                <Brain size={16} />
                <span>Powered by AI</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {sessions.length > 0 && renderTabs()}
        {currentSession ? (
          /* Analysis Section for current tab */
          <div className="space-y-6">
            {/* Top Section: Show Question or Uploaded Image */}
            {currentSession.inputMode === 'image' && currentSession.uploadedImage ? (
              <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-green-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-green-400">📸 Uploaded Image</h3>
                  <button
                    onClick={() => closeSession(currentSession.id)}
                    className="text-green-300 hover:text-green-100 transition-colors"
                  >
                    Close Tab
                  </button>
                </div>
                <div className="text-center">
                  <img
                    src={currentSession.uploadedImage}
                    alt="Uploaded homework"
                    className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-green-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-green-400">📝 Question</h3>
                  <button
                    onClick={() => closeSession(currentSession.id)}
                    className="text-green-300 hover:text-green-100 transition-colors"
                  >
                    Close Tab
                  </button>
                </div>
                <div className="text-green-100 bg-white/5 p-3 rounded-lg text-lg">
                  {currentSession.analysisResult?.question
                    ? currentSession.analysisResult.question
                    : currentSession.questionText
                      ? currentSession.questionText
                      : <span className="text-red-400">No questions detected in your file.</span>}
                </div>
              </div>
            )}
            {/* Loading State */}
            {currentSession.isAnalyzing && (
              <div className="bg-black/20 backdrop-blur-md rounded-2xl p-8 border border-green-500/30 text-center">
                <Loader className="animate-spin mx-auto mb-4 text-green-400" size={48} />
                <h3 className="text-xl font-bold mb-2 text-green-400">Analyzing Your Homework...</h3>
                <p className="text-green-200">Our AI is reading and understanding your problem</p>
              </div>
            )}
            {/* Error State */}
            {currentSession.error && (
              <div className="bg-red-500/20 backdrop-blur-md rounded-2xl p-6 border border-red-500/50">
                <div className="flex items-center gap-3 mb-3">
                  <AlertCircle className="text-red-400" size={24} />
                  <h3 className="text-xl font-bold text-red-400">Analysis Failed</h3>
                </div>
                <p className="text-red-200 mb-4">{currentSession.error}</p>
                <button
                  onClick={() => handleAnalyze(currentSession.questionText, currentSession.inputMode, currentSession.uploadedImage, currentSession.uploadedFile, currentSession.id)}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-6 py-3 rounded-full font-bold transition-all"
                >
                  Try Again
                </button>
              </div>
            )}
            {/* Analysis Results */}
            {currentSession.analysisResult && (
              <div className="space-y-6">
                {/* Main Solution */}
                <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-green-500/30">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="text-green-400" size={24} />
                    <h3 className="text-xl font-bold text-green-400">Solution</h3>
                    {currentSession.analysisResult.confidence && (
                      <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                        {currentSession.analysisResult.confidence}% confidence
                      </span>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-white mb-2">📝 Problem:</h4>
                      <p className="text-green-100 bg-white/5 p-3 rounded-lg">{currentSession.analysisResult.question}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-2">✅ Answer:</h4>
                      {typeof currentSession.analysisResult.answer === 'string' ? (
                        <p className="text-green-100 bg-green-500/10 p-3 rounded-lg font-bold">{currentSession.analysisResult.answer}</p>
                      ) : currentSession.analysisResult.answer && typeof currentSession.analysisResult.answer === 'object' ? (
                        <ul className="text-green-100 bg-green-500/10 p-3 rounded-lg font-bold space-y-1">
                          {Object.entries(currentSession.analysisResult.answer).map(([key, value]) => (
                            <li key={key}><span className="text-green-300">{key}.</span> {value}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-2">📚 Explanation:</h4>
                      <p className="text-green-100 bg-white/5 p-3 rounded-lg leading-relaxed">{currentSession.analysisResult.explanation}</p>
                    </div>
                  </div>
                </div>
                {/* Step-by-Step Solution */}
                {currentSession.analysisResult.steps && currentSession.analysisResult.steps.length > 0 && (
                  <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-green-500/30">
                    <h3 className="text-xl font-bold text-green-400 mb-4">🔢 Step-by-Step Solution</h3>
                    <div className="space-y-3">
                      {currentSession.analysisResult.steps.map((step, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {index + 1}
                          </div>
                          <p className="text-green-100 bg-white/5 p-3 rounded-lg flex-1">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Additional Resources */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Alternative Approaches */}
                  {currentSession.analysisResult.approaches && currentSession.analysisResult.approaches.length > 0 && (
                    <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-green-500/30">
                      <h3 className="text-lg font-bold text-green-400 mb-4">🔄 Alternative Methods</h3>
                      <ul className="space-y-2">
                        {currentSession.analysisResult.approaches.map((approach, index) => (
                          <li key={index} className="text-green-100 bg-white/5 p-2 rounded">
                            • {approach}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Practice Questions */}
                  {currentSession.analysisResult.practiceQuestions && currentSession.analysisResult.practiceQuestions.length > 0 && (
                    <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-green-500/30">
                      <h3 className="text-lg font-bold text-green-400 mb-4">📝 Practice Problems</h3>
                      <ul className="space-y-2">
                        {currentSession.analysisResult.practiceQuestions.map((question, index) => (
                          <li key={index}>
                            <button
                              className={`w-full text-left text-green-100 bg-white/5 p-2 rounded transition-all font-semibold hover:bg-green-700/40 focus:outline-none focus:ring-2 focus:ring-green-400/40 ${currentSession.activePracticeIndex === index ? 'ring-2 ring-green-400 bg-green-800/40' : ''}`}
                              onClick={() => handlePracticeClick(question)}
                            >
                              {index + 1}. {question}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {/* Flashcards */}
                {currentSession.flashcards.length > 0 && (
                  <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-green-500/30">
                    <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">🎴 Study Flashcards
                      <span className="ml-auto text-green-200 text-sm">{currentSession.flashcardIndex + 1} / {currentSession.flashcards.length}</span>
                    </h3>
                    <div ref={flashcardContainerRef} className="relative flex items-center justify-center min-h-[140px]">
                      <button
                        className="absolute left-0 top-1/2 -translate-y-1/2 bg-green-700/80 hover:bg-green-600 text-white rounded-full p-2 disabled:opacity-30 shadow-lg transition-all"
                        onClick={() => setSessions(prev => prev.map(s => s.id === currentSession.id ? { ...s, flashcardIndex: Math.max(s.flashcardIndex - 1, 0) } : s))}
                        disabled={currentSession.flashcardIndex === 0}
                        aria-label="Previous Flashcard"
                      >
                        <ChevronLeft size={28} />
                      </button>
                      <div className="bg-gradient-to-br from-green-900/80 to-emerald-800/80 p-6 rounded-2xl w-full max-w-xl mx-auto text-center shadow-2xl transition-all duration-300 scale-100">
                        <div className="font-bold text-white mb-3 text-lg">Q: {currentSession.flashcards[currentSession.flashcardIndex].question}</div>
                        <div className="text-green-200 text-base">A: {currentSession.flashcards[currentSession.flashcardIndex].answer}</div>
                      </div>
                      <button
                        className="absolute right-0 top-1/2 -translate-y-1/2 bg-green-700/80 hover:bg-green-600 text-white rounded-full p-2 disabled:opacity-30 shadow-lg transition-all"
                        onClick={() => setSessions(prev => prev.map(s => s.id === currentSession.id ? { ...s, flashcardIndex: Math.min(s.flashcardIndex + 1, currentSession.flashcards.length - 1) } : s))}
                        disabled={currentSession.flashcardIndex === currentSession.flashcards.length - 1}
                        aria-label="Next Flashcard"
                      >
                        <ChevronRight size={28} />
                      </button>
                    </div>
                    <div className="flex justify-center mt-4">
                      <button
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-full font-bold shadow-md transition-all"
                        onClick={() => setSessions(prev => prev.map(s => s.id === currentSession.id ? { ...s, flashcards: s.flashcards.concat(generateExtraFlashcards([], s.analysisResult.explanation, s.analysisResult.steps || [])), flashcardIndex: s.flashcards.length } : s))}
                      >
                        ➕ Get More Flashcards
                      </button>
                    </div>
                  </div>
                )}
                {/* Time Estimate */}
                {currentSession.analysisResult.timeToSolve && (
                  <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-green-500/30 text-center">
                    <span className="text-green-400">⏱️ Estimated solving time: </span>
                    <span className="text-white font-bold">{currentSession.analysisResult.timeToSolve}</span>
                  </div>
                )}
                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => closeSession(currentSession.id)}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 px-6 py-3 rounded-full font-bold transition-all"
                  >
                    Close Tab
                  </button>
                  <button
                    onClick={onBackToHome}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-6 py-3 rounded-full font-bold transition-all"
                  >
                    🏠 Back to Home
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-white via-green-400 to-emerald-400 bg-clip-text text-transparent">
                Get Instant Homework Help
              </h2>
              <p className="text-xl text-white/80 mb-8">
                Upload a photo or type your question. Our AI will provide step-by-step solutions, explanations, and practice problems to help you learn.
              </p>
              <div className="flex flex-wrap justify-center gap-8 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-black text-green-400">24/7</div>
                  <div className="text-sm text-white/60">Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-emerald-400">All Subjects</div>
                  <div className="text-sm text-white/60">Covered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-green-300">Step-by-Step</div>
                  <div className="text-sm text-white/60">Explanations</div>
                </div>
              </div>
            </div>

            {/* Input Mode Tabs */}
            <div className="max-w-4xl mx-auto">
              <div className="flex bg-green-900/30 rounded-2xl p-2 mb-6 border border-green-800/40">
                <button
                  onClick={() => setInputMode('text')}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold transition-all ${
                    inputMode === 'text'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-green-900/40'
                  }`}
                >
                  <MessageCircle size={20} />
                  Type Question
                </button>
                <button
                  onClick={() => setInputMode('image')}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold transition-all ${
                    inputMode === 'image'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-green-900/40'
                  }`}
                >
                  <Camera size={20} />
                  Upload Image
                </button>
              </div>

              {/* Subject and Grade Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-white/80 mb-3">Subject</label>
                  <select
                    value={subject}
                    onChange={handleSubjectChange}
                    className="w-full bg-black border border-green-800/40 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-green-400/30 mb-2"
                  >
                    {SUBJECTS.map((subj) => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))}
                  </select>
                  {showCustomSubject && (
                    <input
                      type="text"
                      value={customSubject}
                      onChange={e => setCustomSubject(e.target.value)}
                      placeholder="Enter subject..."
                      className="w-full bg-black border border-green-800/40 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-green-400/30"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-white/80 mb-3">Grade Level</label>
                  <div className="grid grid-cols-6 gap-2">
                    {GRADES.map((g) => (
                      <button
                        key={g}
                        onClick={() => setGrade(g)}
                        className={`p-3 rounded-xl text-center transition-all font-bold ${
                          grade === g
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                            : 'bg-green-900/30 text-white/70 hover:bg-green-800/40 hover:text-white'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {showMismatchWarning && (
                <div className="bg-yellow-900/40 border border-yellow-500/40 text-yellow-200 rounded-xl p-4 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <b>Heads up!</b> Your question looks like it may be about
                    {detectedSubject && detectedSubject !== subject && (
                      <> <span className="text-yellow-300">{detectedSubject}</span> (selected: <span className="text-yellow-400">{subject}</span>)</>
                    )}
                    {detectedGrade && detectedGrade !== grade && (
                      <> and grade <span className="text-yellow-300">{detectedGrade}</span> (selected: <span className="text-yellow-400">{grade}</span>)</>
                    )}.
                    <span> Would you like to switch?</span>
                  </div>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    {detectedSubject && detectedSubject !== subject && (
                      <button onClick={() => { setSubject(detectedSubject); setShowMismatchWarning(false); }} className="bg-yellow-700/80 hover:bg-yellow-600 text-white px-4 py-2 rounded-full font-bold">Switch Subject</button>
                    )}
                    {detectedGrade && detectedGrade !== grade && (
                      <button onClick={() => { setGrade(detectedGrade); setShowMismatchWarning(false); }} className="bg-yellow-700/80 hover:bg-yellow-600 text-white px-4 py-2 rounded-full font-bold">Switch Grade</button>
                    )}
                    <button onClick={() => setShowMismatchWarning(false)} className="bg-gray-700/80 hover:bg-gray-600 text-white px-4 py-2 rounded-full font-bold">Ignore</button>
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="bg-green-900/30 backdrop-blur-md rounded-3xl p-8 border border-green-800/40">
                {inputMode === 'text' ? (
                  <div>
                    <label className="block text-lg font-bold text-white mb-4">
                      📝 Type your question here
                    </label>
                    <textarea
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="e.g., Solve for x: 2x + 5 = 13"
                      className="w-full h-32 bg-black border border-green-800/40 rounded-2xl p-4 text-white placeholder-white/50 resize-none focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-lg font-bold text-white mb-4">
                      📸 Upload a photo or document of your homework
                    </label>
                    {!uploadedImage && !uploadedFile ? (
                      <div
                        className="border-2 border-dashed border-green-800/40 rounded-2xl p-12 text-center hover:border-green-400 transition-all cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload size={64} className="mx-auto mb-4 text-green-400" />
                        <p className="text-xl mb-2">Click to upload or drag and drop</p>
                        <p className="text-white/60">Supports: JPG, PNG, PDF, DOCX (max 10MB)</p>
                      </div>
                    ) : uploadedImage ? (
                      <div className="text-center">
                        <img
                          src={uploadedImage}
                          alt="Uploaded homework"
                          className="max-w-full max-h-64 mx-auto rounded-2xl shadow-lg"
                        />
                        <button
                          onClick={() => {
                            setUploadedImage(null);
                            setUploadedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="mt-4 text-green-400 hover:text-green-300 transition-colors"
                        >
                          Upload Different File
                        </button>
                      </div>
                    ) : uploadedFile ? (
                      <div className="text-center">
                        <div className="bg-green-900/30 border border-green-500/30 rounded-2xl p-8 max-w-md mx-auto">
                          <div className="text-4xl mb-4">📄</div>
                          <p className="text-lg font-bold text-green-400 mb-2">{uploadedFile.name}</p>
                          <p className="text-white/60 text-sm">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button
                          onClick={() => {
                            setUploadedImage(null);
                            setUploadedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="mt-4 text-green-400 hover:text-green-300 transition-colors"
                        >
                          Upload Different File
                        </button>
                      </div>
                    ) : null}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf,.docx,.doc"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                )}
                <div className="text-center mt-8">
                  <button
                    onClick={() => addSession(questionText, inputMode, uploadedImage, uploadedFile)}
                    disabled={isAnalyzing || ((inputMode === 'text' && !questionText.trim()) || (inputMode === 'image' && !uploadedFile))}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed px-12 py-4 rounded-full font-bold text-xl transition-all transform hover:scale-105 shadow-2xl"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center gap-3">
                        <Loader className="animate-spin" size={20} />
                        Analyzing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Zap size={20} />
                        Get Instant Solution
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-6xl mx-auto">
              <h3 className="text-2xl font-bold text-center mb-8 text-white">Why Choose Our AI Homework Helper?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-green-900/30 backdrop-blur-md rounded-2xl p-6 border border-green-800/40 hover:border-green-400/30 transition-all">
                  <div className="text-4xl mb-4">🧠</div>
                  <h4 className="text-lg font-bold mb-2 text-green-400">Advanced AI</h4>
                  <p className="text-white/70 text-sm">Powered by the latest AI technology for accurate, comprehensive solutions</p>
                </div>
                <div className="bg-green-900/30 backdrop-blur-md rounded-2xl p-6 border border-green-800/40 hover:border-green-400/30 transition-all">
                  <div className="text-4xl mb-4">📚</div>
                  <h4 className="text-lg font-bold mb-2 text-emerald-400">Step-by-Step</h4>
                  <p className="text-white/70 text-sm">Detailed explanations that help you understand, not just get answers</p>
                </div>
                <div className="bg-green-900/30 backdrop-blur-md rounded-2xl p-6 border border-green-800/40 hover:border-green-400/30 transition-all">
                  <div className="text-4xl mb-4">⚡</div>
                  <h4 className="text-lg font-bold mb-2 text-green-300">Instant Results</h4>
                  <p className="text-white/70 text-sm">Get solutions in seconds, not hours of waiting or searching</p>
                </div>
                <div className="bg-green-900/30 backdrop-blur-md rounded-2xl p-6 border border-green-800/40 hover:border-green-400/30 transition-all">
                  <div className="text-4xl mb-4">🎯</div>
                  <h4 className="text-lg font-bold mb-2 text-green-200">All Subjects</h4>
                  <p className="text-white/70 text-sm">Math, Science, English, History, and more - we cover everything</p>
                </div>
                <div className="bg-green-900/30 backdrop-blur-md rounded-2xl p-6 border border-green-800/40 hover:border-green-400/30 transition-all">
                  <div className="text-4xl mb-4">📝</div>
                  <h4 className="text-lg font-bold mb-2 text-green-300">Practice Problems</h4>
                  <p className="text-white/70 text-sm">Get additional practice questions to reinforce your learning</p>
                </div>
                <div className="bg-green-900/30 backdrop-blur-md rounded-2xl p-6 border border-green-800/40 hover:border-green-400/30 transition-all">
                  <div className="text-4xl mb-4">🎓</div>
                  <h4 className="text-lg font-bold mb-2 text-green-400">Grade Appropriate</h4>
                  <p className="text-white/70 text-sm">Solutions tailored to your grade level and curriculum</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeworkHelper;