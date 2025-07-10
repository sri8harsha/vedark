import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Camera, Type, MessageCircle, Send, Copy, Download, Share2, Clock, CheckCircle, AlertCircle, Bookmark, BookOpen, Mic, Volume2 } from 'lucide-react';
import Tesseract from 'tesseract.js';
import ReactMarkdown from 'react-markdown';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface HomeworkHelperProps {
  onBackToHome: () => void;
}

interface Solution {
  id: string;
  question: string;
  subject: string;
  grade: number;
  answer: string;
  explanation: string;
  steps: string[];
  confidence: number;
  timeToSolve: string;
  timestamp: Date;
  // Enhanced features
  approaches?: SolutionApproach[];
  flashcards?: Flashcard[];
  practiceQuestions?: PracticeQuestion[];
  isBookmarked?: boolean;
}

interface SolutionApproach {
  name: string;
  description: string;
  steps: string[];
  explanation: string;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject: string;
}

interface PracticeQuestion {
  id: string;
  question: string;
  answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Setup View Component
const SetupView: React.FC<{
  onSetupComplete: (grade: number, subject: string) => void;
}> = ({ onSetupComplete }) => {
  const [selectedGrade, setSelectedGrade] = useState<number>(5);
  const [selectedSubject, setSelectedSubject] = useState<string>('math');

  const subjects = [
    { id: 'math', name: 'Mathematics', icon: '🔢' },
    { id: 'science', name: 'Science', icon: '🔬' },
    { id: 'english', name: 'English', icon: '📚' },
    { id: 'history', name: 'History', icon: '🏛️' },
    { id: 'geography', name: 'Geography', icon: '🌍' },
    { id: 'other', name: 'Other', icon: '📝' }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
          📚 Homework Helper Setup
        </h2>
        <p className="text-gray-300">Tell us about yourself to get personalized help</p>
      </div>

      <div className="space-y-8">
        {/* Grade Selection */}
        <div>
          <h3 className="text-xl font-bold mb-4 text-green-400">What grade are you in?</h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`p-4 rounded-xl font-bold text-lg transition-all ${
                  selectedGrade === grade
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white scale-105'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {grade}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Selection */}
        <div>
          <h3 className="text-xl font-bold mb-4 text-green-400">What subject do you need help with?</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className={`p-4 rounded-xl transition-all ${
                  selectedSubject === subject.id
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white scale-105'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="text-2xl mb-2">{subject.icon}</div>
                <div className="font-bold">{subject.name}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onSetupComplete(selectedGrade, selectedSubject)}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105"
        >
          Continue to Homework Helper →
        </button>
      </div>
    </div>
  );
};

// Input Method View Component
const InputMethodView: React.FC<{
  grade: number;
  subject: string;
  onSolutionGenerated: (solution: Solution) => void;
  onStartChat: () => void;
}> = ({ grade, subject, onSolutionGenerated, onStartChat }) => {
  const [inputMethod, setInputMethod] = useState<'type' | 'upload' | 'camera' | null>(null);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Check for voice support
  React.useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setVoiceSupported(true);
    }
  }, []);

  const startVoiceInput = () => {
    if (!voiceSupported) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuestion(prev => prev + ' ' + transcript);
      setIsListening(false);
    };
    
    recognition.onerror = () => {
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  const generateSolution = async (questionText: string) => {
    if (!questionText.trim()) return;

    setIsLoading(true);
    try {
      // Check multiple possible environment variable names
      const apiKey = import.meta.env.VITE_REACT_APP_OPENAI_API_KEY || 
                     import.meta.env.VITE_OPENAI_API_KEY || 
                     import.meta.env.OPENAI_API_KEY;
      
      console.log('🔑 Checking API key availability:', apiKey ? '✅ Found' : '❌ Not found');
      console.log('🔍 Environment variables:', {
        VITE_REACT_APP_OPENAI_API_KEY: import.meta.env.VITE_REACT_APP_OPENAI_API_KEY ? 'Set' : 'Not set',
        VITE_OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY ? 'Set' : 'Not set',
        OPENAI_API_KEY: import.meta.env.OPENAI_API_KEY ? 'Set' : 'Not set'
      });
      
      if (!apiKey || apiKey === 'your-actual-api-key-here') {
        // Show user-friendly error with setup instructions
        const errorSolution: Solution = {
          id: Date.now().toString(),
          question: questionText,
          subject: subject,
          grade: grade,
          answer: '🔑 API Key Required',
          explanation: `To use the Homework Helper, you need to set up your OpenAI API key:

1. Get an API key from https://platform.openai.com/api-keys
2. Open the .env file in your project root
3. Replace "your-actual-api-key-here" with your real API key
4. Restart the development server (Ctrl+C then npm run dev)

Your .env file should look like:
VITE_REACT_APP_OPENAI_API_KEY=sk-your-actual-key-here

Note: Keep your API key private and never share it publicly!`,
          steps: [
            'Visit https://platform.openai.com/api-keys to get your API key',
            'Copy your API key (starts with "sk-")',
            'Open the .env file in your project',
            'Replace the placeholder with your real API key',
            'Save the file and restart the server'
          ],
          confidence: 0,
          timeToSolve: '0s',
          timestamp: new Date()
        };
        
        onSolutionGenerated(errorSolution);
        return;
      }

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
              content: `You are an expert tutor helping a grade ${grade} student with ${subject}. 
              
              CRITICAL INSTRUCTIONS:
              1. Provide answers appropriate for grade ${grade} level
              2. Use vocabulary and concepts suitable for a ${grade}th grader
              3. Give step-by-step explanations that a grade ${grade} student can understand
              4. If the question is from a different subject than ${subject}, still answer it but mention the subject mismatch
              5. Be encouraging and supportive in your tone
              6. Break down complex concepts into simple, digestible parts
              7. Provide multiple solution approaches when possible
              8. Generate flashcards and practice questions for learning reinforcement
              9. Use LaTeX for math equations (inline: $...$, block: $$...$$)
              10. Use markdown for formatting explanations
              
              Format your response as JSON with these fields:
              - subject: detected subject of the question
              - answer: the direct answer (use LaTeX for math)
              - explanation: detailed explanation appropriate for grade ${grade} (use markdown)
              - steps: array of step-by-step solution steps
              - confidence: confidence level (0-100)
              - gradeAppropriate: true/false if content matches grade level
              - approaches: array of alternative solution methods (optional)
              - flashcards: array of study cards with front/back content
              - practiceQuestions: array of related practice problems
              - timeToSolve: estimated time to solve (e.g., "5 minutes")`
            },
            {
              role: 'user',
              content: `Please solve this ${subject} problem for a grade ${grade} student: ${questionText}`
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(content);
      } catch {
        // Fallback if JSON parsing fails
        parsedResponse = {
          subject: subject,
          answer: content,
          explanation: content,
          steps: [content],
          confidence: 85,
          gradeAppropriate: true
        };
      }

      const solution: Solution = {
        id: Date.now().toString(),
        question: questionText,
        subject: parsedResponse.subject || subject,
        grade: grade,
        answer: parsedResponse.answer || 'Answer not available',
        explanation: parsedResponse.explanation || 'Explanation not available',
        steps: parsedResponse.steps || ['Solution steps not available'],
        confidence: parsedResponse.confidence || 85,
        timeToSolve: parsedResponse.timeToSolve || '3.5s',
        timestamp: new Date(),
        approaches: parsedResponse.approaches || [],
        flashcards: parsedResponse.flashcards || [],
        practiceQuestions: parsedResponse.practiceQuestions || [],
        isBookmarked: false
      };

      onSolutionGenerated(solution);
    } catch (error) {
      console.error('Error generating solution:', error);
      
      // Provide a helpful error message
      const errorSolution: Solution = {
        id: Date.now().toString(),
        question: questionText,
        subject: subject,
        grade: grade,
        answer: 'Unable to generate answer',
        explanation: 'Sorry, I encountered an error while processing your question. Please check your internet connection and try again.',
        steps: ['Error occurred during processing'],
        confidence: 0,
        timeToSolve: '0s',
        timestamp: new Date()
      };
      
      onSolutionGenerated(errorSolution);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setOcrError(null);
    if (file.type.startsWith('image/')) {
      setOcrLoading(true);
      setQuestion('');
      try {
        const { data: { text } } = await Tesseract.recognize(file, 'eng', {
          logger: m => console.log(m)
        });
        setQuestion(text.trim());
      } catch (err) {
        setOcrError('Could not extract text from image. Please try a clearer photo.');
        setQuestion('');
      } finally {
        setOcrLoading(false);
      }
    } else {
      // For text files
      const text = await file.text();
      setQuestion(text);
    }
  };

  const inputMethods = [
    {
      id: 'type',
      name: 'Type Question',
      icon: Type,
      description: 'Type your homework question directly'
    },
    {
      id: 'upload',
      name: 'Upload File',
      icon: Upload,
      description: 'Upload a document or image'
    },
    {
      id: 'camera',
      name: 'Take Photo',
      icon: Camera,
      description: 'Take a photo of your homework'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
          How would you like to submit your question?
        </h2>
        <p className="text-gray-300">Grade {grade} • {subject.charAt(0).toUpperCase() + subject.slice(1)}</p>
      </div>

      {!inputMethod ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {inputMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setInputMethod(method.id as any)}
              className="p-6 bg-gray-800 rounded-xl hover:bg-gray-700 transition-all transform hover:scale-105 border border-gray-700 hover:border-green-500"
            >
              <method.icon size={48} className="mx-auto mb-4 text-green-400" />
              <h3 className="text-xl font-bold mb-2">{method.name}</h3>
              <p className="text-gray-400">{method.description}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-green-400">
              {inputMethods.find(m => m.id === inputMethod)?.name}
            </h3>
            <button
              onClick={() => setInputMethod(null)}
              className="text-gray-400 hover:text-white"
            >
              Change Method
            </button>
          </div>

          {inputMethod === 'type' && (
            <div>
              <div className="relative">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type your homework question here..."
                  className="w-full h-32 bg-gray-700 border border-gray-600 rounded-lg p-4 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                />
                {voiceSupported && (
                  <button
                    onClick={startVoiceInput}
                    disabled={isListening}
                    className="absolute top-2 right-2 p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors disabled:opacity-50"
                    title="Voice input"
                  >
                    <Mic size={20} className={isListening ? 'text-red-400 animate-pulse' : 'text-gray-300'} />
                  </button>
                )}
              </div>
              {isListening && (
                <div className="mt-2 text-green-400 font-bold">Listening... Speak now!</div>
              )}
              <button
                onClick={() => generateSolution(question)}
                disabled={!question.trim() || isLoading}
                className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full font-bold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Solving...' : 'Get Solution'}
              </button>
            </div>
          )}

          {inputMethod === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf,.doc,.docx,image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 transition-colors"
              >
                <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400">Click to upload a file or drag and drop</p>
                <p className="text-sm text-gray-500 mt-2">Supports: PDF, DOC, TXT, Images</p>
              </div>
              {ocrLoading && (
                <div className="mt-4 text-green-400 font-bold">Extracting text from image...</div>
              )}
              {ocrError && (
                <div className="mt-4 text-red-400 font-bold">{ocrError}</div>
              )}
              {question && !ocrLoading && (
                <div className="mt-4">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full h-32 bg-gray-700 border border-gray-600 rounded-lg p-4 text-white"
                  />
                  <button
                    onClick={() => generateSolution(question)}
                    disabled={!question.trim() || isLoading}
                    className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full font-bold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Solving...' : 'Get Solution'}
                  </button>
                </div>
              )}
            </div>
          )}

          {inputMethod === 'camera' && (
            <div>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />
              <div
                onClick={() => cameraInputRef.current?.click()}
                className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 transition-colors"
              >
                <Camera size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400">Click to take a photo of your homework</p>
              </div>
              {ocrLoading && (
                <div className="mt-4 text-green-400 font-bold">Extracting text from image...</div>
              )}
              {ocrError && (
                <div className="mt-4 text-red-400 font-bold">{ocrError}</div>
              )}
              {question && !ocrLoading && (
                <div className="mt-4">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full h-32 bg-gray-700 border border-gray-600 rounded-lg p-4 text-white"
                  />
                  <button
                    onClick={() => generateSolution(question)}
                    disabled={!question.trim() || isLoading}
                    className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full font-bold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Solving...' : 'Get Solution'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="text-center">
        <button
          onClick={onStartChat}
          className="inline-flex items-center gap-2 bg-gray-700 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-600 transition-all"
        >
          <MessageCircle size={20} />
          Ask Questions Instead
        </button>
      </div>
    </div>
  );
};

// Solution View Component
const SolutionView: React.FC<{
  solution: Solution;
  onNewQuestion: () => void;
  onStartChat: () => void;
  onToggleBookmark: (solutionId: string) => void;
}> = ({ solution, onNewQuestion, onStartChat, onToggleBookmark }) => {
  const [showApproaches, setShowApproaches] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showPractice, setShowPractice] = useState(false);
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  const copyToClipboard = () => {
    const text = `Question: ${solution.question}\n\nAnswer: ${solution.answer}\n\nExplanation: ${solution.explanation}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-400" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-green-400">Solution Found!</h2>
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  {solution.timeToSolve}
                </span>
                <span>⭐ {solution.confidence}% confidence</span>
                <span className="bg-green-600 px-2 py-1 rounded-full text-xs">
                  {solution.subject.charAt(0).toUpperCase() + solution.subject.slice(1)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onToggleBookmark(solution.id)}
              className={`p-2 rounded-lg transition-colors ${
                solution.isBookmarked 
                  ? 'bg-yellow-600 hover:bg-yellow-700' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={solution.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              <Bookmark size={20} className={solution.isBookmarked ? 'text-yellow-300' : 'text-gray-300'} />
            </button>
            <button
              onClick={copyToClipboard}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Copy to clipboard"
            >
              <Copy size={20} />
            </button>
            <button
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Download solution"
            >
              <Download size={20} />
            </button>
            <button
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Share solution"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="font-bold text-gray-300 mb-2">PROBLEM:</h3>
          <p className="text-white">{solution.question}</p>
        </div>
      </div>

      {/* Answer */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <h3 className="text-xl font-bold text-green-400 mb-4">ANSWER:</h3>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
          <div className="text-2xl font-bold text-green-400 mb-2">
            {solution.answer.includes('$') ? (
              <ReactMarkdown
                components={{
                  // Handle LaTeX inline math
                  p: ({ children }) => {
                    const text = children?.toString() || '';
                    if (text.includes('$')) {
                      const parts = text.split(/(\$[^$]+\$)/);
                      return (
                        <p>
                          {parts.map((part, index) => {
                            if (part.startsWith('$') && part.endsWith('$')) {
                              const math = part.slice(1, -1);
                              return <InlineMath key={index} math={math} />;
                            }
                            return part;
                          })}
                        </p>
                      );
                    }
                    return <p>{children}</p>;
                  }
                }}
              >
                {solution.answer}
              </ReactMarkdown>
            ) : (
              solution.answer
            )}
          </div>
        </div>
      </div>

      {/* Step-by-Step Solution */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">📝 Step-by-Step Solution</h3>
          <button className="text-green-400 hover:text-green-300 text-sm">
            🔗 Hide Steps
          </button>
        </div>
        
        <div className="space-y-4">
          {solution.steps.map((step, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1 bg-gray-700/50 rounded-lg p-4">
                <p className="text-gray-200">{step}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <h3 className="text-xl font-bold text-white mb-4">💡 Detailed Explanation</h3>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <ReactMarkdown
            components={{
              // Handle LaTeX math
              p: ({ children }) => {
                const text = children?.toString() || '';
                if (text.includes('$')) {
                  const parts = text.split(/(\$[^$]+\$)/);
                  return (
                    <p className="text-gray-200 leading-relaxed mb-4">
                      {parts.map((part, index) => {
                        if (part.startsWith('$') && part.endsWith('$')) {
                          const math = part.slice(1, -1);
                          return <InlineMath key={index} math={math} />;
                        }
                        return part;
                      })}
                    </p>
                  );
                }
                return <p className="text-gray-200 leading-relaxed mb-4">{children}</p>;
              },
              h1: ({ children }) => <h1 className="text-2xl font-bold text-white mb-3">{children}</h1>,
              h2: ({ children }) => <h2 className="text-xl font-bold text-white mb-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-lg font-bold text-white mb-2">{children}</h3>,
              ul: ({ children }) => <ul className="list-disc list-inside text-gray-200 mb-4">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside text-gray-200 mb-4">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
              strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
              em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
              code: ({ children }) => <code className="bg-gray-700 px-2 py-1 rounded text-green-300">{children}</code>
            }}
          >
            {solution.explanation}
          </ReactMarkdown>
        </div>
      </div>

      {/* Multiple Approaches */}
      {solution.approaches && solution.approaches.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">🔄 Alternative Approaches</h3>
            <button 
              onClick={() => setShowApproaches(!showApproaches)}
              className="text-green-400 hover:text-green-300 text-sm"
            >
              {showApproaches ? '🔗 Hide Approaches' : '🔗 Show Approaches'}
            </button>
          </div>
          
          {showApproaches && (
            <div className="space-y-4">
              {solution.approaches.map((approach, index) => (
                <div key={index} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h4 className="font-bold text-green-400 mb-2">{approach.name}</h4>
                  <p className="text-gray-300 mb-3">{approach.description}</p>
                  <div className="space-y-2">
                    {approach.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {stepIndex + 1}
                        </div>
                        <div className="flex-1 bg-gray-600/50 rounded p-2">
                          <p className="text-gray-200 text-sm">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                    <p className="text-gray-200 text-sm">{approach.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Flashcards */}
      {solution.flashcards && solution.flashcards.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">📚 Study Flashcards</h3>
            <button 
              onClick={() => setShowFlashcards(!showFlashcards)}
              className="text-green-400 hover:text-green-300 text-sm"
            >
              {showFlashcards ? '🔗 Hide Cards' : '🔗 Show Cards'}
            </button>
          </div>
          
          {showFlashcards && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    setCurrentFlashcard(prev => Math.max(0, prev - 1));
                    setFlashcardFlipped(false);
                  }}
                  disabled={currentFlashcard === 0}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
                >
                  ← Previous
                </button>
                <span className="text-gray-300">
                  {currentFlashcard + 1} of {solution.flashcards.length}
                </span>
                <button
                  onClick={() => {
                    setCurrentFlashcard(prev => Math.min(solution.flashcards.length - 1, prev + 1));
                    setFlashcardFlipped(false);
                  }}
                  disabled={currentFlashcard === solution.flashcards.length - 1}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
              
              <div 
                className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-8 cursor-pointer transform transition-transform hover:scale-105"
                onClick={() => setFlashcardFlipped(!flashcardFlipped)}
              >
                <div className="text-center">
                  <h4 className="text-lg font-bold text-white mb-4">
                    {flashcardFlipped ? 'Answer' : 'Question'}
                  </h4>
                  <div className="text-xl text-gray-200">
                    {flashcardFlipped 
                      ? solution.flashcards[currentFlashcard].back
                      : solution.flashcards[currentFlashcard].front
                    }
                  </div>
                  <p className="text-sm text-gray-400 mt-4">
                    Click to {flashcardFlipped ? 'see question' : 'see answer'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Practice Questions */}
      {solution.practiceQuestions && solution.practiceQuestions.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">🎯 Practice Questions</h3>
            <button 
              onClick={() => setShowPractice(!showPractice)}
              className="text-green-400 hover:text-green-300 text-sm"
            >
              {showPractice ? '🔗 Hide Questions' : '🔗 Show Questions'}
            </button>
          </div>
          
          {showPractice && (
            <div className="space-y-4">
              {solution.practiceQuestions.map((question, index) => (
                <div key={index} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      question.difficulty === 'easy' ? 'bg-green-600 text-white' :
                      question.difficulty === 'medium' ? 'bg-yellow-600 text-white' :
                      'bg-red-600 text-white'
                    }`}>
                      {question.difficulty.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-200 mb-3 font-medium">{question.question}</p>
                  <details className="text-sm">
                    <summary className="cursor-pointer text-green-400 hover:text-green-300">
                      Show Answer
                    </summary>
                    <div className="mt-2 p-3 bg-green-500/10 border border-green-500/30 rounded">
                      <p className="text-gray-200 font-bold mb-1">Answer: {question.answer}</p>
                      <p className="text-gray-300">{question.explanation}</p>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onNewQuestion}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:from-green-700 hover:to-emerald-700 transition-all"
        >
          📚 Solve Another Problem
        </button>
        <button
          onClick={onStartChat}
          className="bg-gray-700 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-600 transition-all"
        >
          💬 Ask Follow-up Questions
        </button>
        {solution.flashcards && solution.flashcards.length > 0 && (
          <button
            onClick={() => setShowFlashcards(!showFlashcards)}
            className="bg-purple-600 text-white px-8 py-3 rounded-full font-bold hover:bg-purple-700 transition-all"
          >
            📚 {showFlashcards ? 'Hide' : 'Show'} Flashcards
          </button>
        )}
        {solution.practiceQuestions && solution.practiceQuestions.length > 0 && (
          <button
            onClick={() => setShowPractice(!showPractice)}
            className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all"
          >
            🎯 {showPractice ? 'Hide' : 'Show'} Practice
          </button>
        )}
      </div>
    </div>
  );
};

// Chat View Component
const ChatView: React.FC<{
  grade: number;
  subject: string;
  onBackToSolver: () => void;
}> = ({ grade, subject, onBackToSolver }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hi! I'm your ${subject} tutor for grade ${grade}. I'm here to help you understand your homework better. What would you like to ask?`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_REACT_APP_OPENAI_API_KEY;
      
      if (!apiKey) {
        throw new Error('OpenAI API key not configured');
      }

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
              content: `You are a helpful tutor for a grade ${grade} student studying ${subject}. 
              
              Guidelines:
              - Use age-appropriate language for grade ${grade}
              - Be encouraging and patient
              - Break down complex concepts into simple parts
              - Ask follow-up questions to check understanding
              - Provide examples relevant to their grade level
              - If they ask about other subjects, still help but mention it's outside ${subject}`
            },
            ...messages.map(msg => ({
              role: msg.type === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
            {
              role: 'user',
              content: inputMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.choices[0].message.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="max-w-4xl mx-auto h-[600px] flex flex-col">
      <div className="bg-gray-800 rounded-t-xl p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-green-400">💬 Ask Questions</h2>
            <p className="text-gray-400">Grade {grade} • {subject.charAt(0).toUpperCase() + subject.slice(1)} Tutor</p>
          </div>
          <button
            onClick={onBackToSolver}
            className="text-gray-400 hover:text-white"
          >
            Back to Solver
          </button>
        </div>
      </div>

      <div className="flex-1 bg-gray-800 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-200'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-gray-200 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full"></div>
                  Thinking...
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-gray-800 rounded-b-xl p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask a question about your homework..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const HomeworkHelper: React.FC<HomeworkHelperProps> = ({ onBackToHome }) => {
  const [viewMode, setViewMode] = useState<'setup' | 'input' | 'solution' | 'chat'>('setup');
  const [grade, setGrade] = useState<number>(5);
  const [subject, setSubject] = useState<string>('math');
  const [currentSolution, setCurrentSolution] = useState<Solution | null>(null);
  const [recentSolutions, setRecentSolutions] = useState<Solution[]>([]);
  const [bookmarkedSolutions, setBookmarkedSolutions] = useState<Solution[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);

  const handleSetupComplete = (selectedGrade: number, selectedSubject: string) => {
    setGrade(selectedGrade);
    setSubject(selectedSubject);
    setViewMode('input');
  };

  const handleSolutionGenerated = (solution: Solution) => {
    setCurrentSolution(solution);
    setRecentSolutions(prev => [solution, ...prev.slice(0, 4)]);
    setViewMode('solution');
  };

  const handleToggleBookmark = (solutionId: string) => {
    setCurrentSolution(prev => {
      if (!prev) return prev;
      const updated = { ...prev, isBookmarked: !prev.isBookmarked };
      
      if (updated.isBookmarked) {
        setBookmarkedSolutions(prev => [updated, ...prev]);
      } else {
        setBookmarkedSolutions(prev => prev.filter(s => s.id !== solutionId));
      }
      
      return updated;
    });
    
    setRecentSolutions(prev => 
      prev.map(s => s.id === solutionId ? { ...s, isBookmarked: !s.isBookmarked } : s)
    );
  };

  const handleNewQuestion = () => {
    setCurrentSolution(null);
    setViewMode('input');
  };

  const handleStartChat = () => {
    setViewMode('chat');
  };

  const handleBackToSolver = () => {
    setViewMode('input');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900/20 to-emerald-900/20 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBackToHome}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                Back to Home
              </button>
              <div className="w-px h-6 bg-gray-600"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                🤝 Homework Helper
              </h1>
            </div>
            {viewMode !== 'setup' && (
              <div className="text-sm text-gray-400">
                Grade {grade} • {subject.charAt(0).toUpperCase() + subject.slice(1)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {viewMode === 'setup' && (
              <SetupView onSetupComplete={handleSetupComplete} />
            )}
            
            {viewMode === 'input' && (
              <InputMethodView
                grade={grade}
                subject={subject}
                onSolutionGenerated={handleSolutionGenerated}
                onStartChat={handleStartChat}
              />
            )}
            
            {viewMode === 'solution' && currentSolution && (
              <SolutionView
                solution={currentSolution}
                onNewQuestion={handleNewQuestion}
                onStartChat={handleStartChat}
                onToggleBookmark={handleToggleBookmark}
              />
            )}
            
            {viewMode === 'chat' && (
              <ChatView
                grade={grade}
                subject={subject}
                onBackToSolver={handleBackToSolver}
              />
            )}
          </div>

          {/* Sidebar */}
          {viewMode !== 'setup' && (
            <div className="lg:col-span-1">
              <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 sticky top-24">
                <h3 className="text-lg font-bold mb-4 text-green-400">💬 Ask Questions</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Need help understanding something? Start a conversation with your AI tutor.
                </p>
                <button
                  onClick={handleStartChat}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all"
                >
                  Start Chat
                </button>

                {recentSolutions.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-bold mb-4 text-green-400">Recent Solutions</h3>
                    <div className="space-y-3">
                      {recentSolutions.map((solution) => (
                        <div
                          key={solution.id}
                          className="bg-gray-700/50 rounded-lg p-3 cursor-pointer hover:bg-gray-700 transition-colors"
                          onClick={() => {
                            setCurrentSolution(solution);
                            setViewMode('solution');
                          }}
                        >
                          <div className="text-sm font-medium text-white mb-1 truncate">
                            {solution.question}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-2">
                            <span>{solution.subject}</span>
                            <span>•</span>
                            <span>{solution.confidence}% confidence</span>
                            {solution.isBookmarked && (
                              <Bookmark size={12} className="text-yellow-400" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {bookmarkedSolutions.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-yellow-400">Bookmarked Solutions</h3>
                      <button
                        onClick={() => setShowBookmarks(!showBookmarks)}
                        className="text-yellow-400 hover:text-yellow-300 text-sm"
                      >
                        {showBookmarks ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {showBookmarks && (
                      <div className="space-y-3">
                        {bookmarkedSolutions.map((solution) => (
                          <div
                            key={solution.id}
                            className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 cursor-pointer hover:bg-yellow-500/20 transition-colors"
                            onClick={() => {
                              setCurrentSolution(solution);
                              setViewMode('solution');
                            }}
                          >
                            <div className="text-sm font-medium text-white mb-1 truncate">
                              {solution.question}
                            </div>
                            <div className="text-xs text-gray-400 flex items-center gap-2">
                              <span>{solution.subject}</span>
                              <span>•</span>
                              <span>{solution.confidence}% confidence</span>
                              <Bookmark size={12} className="text-yellow-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeworkHelper;