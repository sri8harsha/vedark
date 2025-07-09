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
  Star
} from 'lucide-react';

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
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: string[];
}

type InputMethod = 'type' | 'upload' | 'camera' | 'document';
type ViewMode = 'input' | 'solution' | 'chat';

const HomeworkHelper: React.FC<{ onBackToHome: () => void }> = ({ onBackToHome }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('input');
  const [inputMethod, setInputMethod] = useState<InputMethod>('type');
  const [problemText, setProblemText] = useState('');
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

  // Mock solution generation (replace with actual API call)
  const generateSolution = useCallback(async (problem: string): Promise<Solution> => {
    setIsProcessing(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Detect subject based on problem content
    const detectSubject = (problem: string): string => {
      const lowerProblem = problem.toLowerCase();
      
      // History keywords
      if (lowerProblem.includes('war') || lowerProblem.includes('revolution') || 
          lowerProblem.includes('battle') || lowerProblem.includes('president') ||
          lowerProblem.includes('historical') || lowerProblem.includes('century') ||
          lowerProblem.includes('empire') || lowerProblem.includes('ancient') ||
          lowerProblem.includes('medieval') || lowerProblem.includes('colonial')) {
        return 'History';
      }
      
      // Science keywords
      if (lowerProblem.includes('atom') || lowerProblem.includes('molecule') ||
          lowerProblem.includes('chemical') || lowerProblem.includes('physics') ||
          lowerProblem.includes('biology') || lowerProblem.includes('cell') ||
          lowerProblem.includes('energy') || lowerProblem.includes('force') ||
          lowerProblem.includes('experiment') || lowerProblem.includes('hypothesis')) {
        return 'Science';
      }
      
      // English keywords
      if (lowerProblem.includes('essay') || lowerProblem.includes('paragraph') ||
          lowerProblem.includes('grammar') || lowerProblem.includes('sentence') ||
          lowerProblem.includes('literature') || lowerProblem.includes('poem') ||
          lowerProblem.includes('story') || lowerProblem.includes('character') ||
          lowerProblem.includes('theme') || lowerProblem.includes('author')) {
        return 'English';
      }
      
      // Math keywords (default if numbers or math terms found)
      if (lowerProblem.includes('solve') || lowerProblem.includes('equation') ||
          lowerProblem.includes('calculate') || lowerProblem.includes('find') ||
          /\d/.test(lowerProblem) || lowerProblem.includes('x') ||
          lowerProblem.includes('algebra') || lowerProblem.includes('geometry')) {
        return 'Mathematics';
      }
      
      // Default to Mathematics if no clear subject detected
      return 'Mathematics';
    };
    
    const detectedSubject = detectSubject(problem);
    
    // Generate subject-appropriate solutions
    const generateSubjectSolution = (subject: string, problem: string): Partial<Solution> => {
      switch (subject) {
        case 'History':
          return {
            answer: "Key events include: Boston Tea Party (1773), Lexington and Concord (1775), Declaration of Independence (1776), Valley Forge (1777-78), and Yorktown (1781)",
            steps: [
              "Identify the time period: American Revolutionary War (1775-1783)",
              "List major political events: Boston Tea Party, Continental Congress meetings",
              "Identify key battles: Lexington & Concord, Bunker Hill, Saratoga, Yorktown",
              "Note important documents: Declaration of Independence, Articles of Confederation",
              "Consider the outcome: American independence and formation of new nation"
            ],
            explanation: "The Revolutionary War was a pivotal period in American history spanning 1775-1783. It began with growing tensions over British taxation and culminated in American independence. Key events shaped both military strategy and political development of the new nation.",
            alternativeMethods: [
              "Chronological timeline approach: Organize events by date",
              "Thematic approach: Group by political, military, and social events",
              "Cause and effect analysis: Connect events to their consequences"
            ],
            relatedConcepts: [
              "Colonial resistance movements",
              "Enlightenment political philosophy",
              "Military strategy in 18th century warfare"
            ],
            practiceProblems: [
              "What were the main causes of the Revolutionary War?",
              "How did the French alliance affect the war's outcome?",
              "What role did key figures like Washington and Franklin play?"
            ]
          };
          
        case 'Science':
          return {
            answer: "The mitochondria is the powerhouse of the cell, producing ATP through cellular respiration",
            steps: [
              "Identify the cellular structure in question",
              "Understand the process of cellular respiration",
              "Explain ATP production and energy conversion",
              "Describe the mitochondria's structure and function",
              "Connect to overall cellular metabolism"
            ],
            explanation: "Mitochondria are essential organelles that convert glucose and oxygen into usable energy (ATP) for cellular processes. This process, called cellular respiration, is vital for all living organisms.",
            alternativeMethods: [
              "Diagram analysis: Study mitochondrial structure",
              "Chemical equation approach: Focus on respiration reactions",
              "Comparative method: Compare to other organelles"
            ],
            relatedConcepts: [
              "Cellular respiration",
              "ATP synthesis",
              "Organelle structure and function"
            ],
            practiceProblems: [
              "What is the role of chloroplasts in plant cells?",
              "How do enzymes affect cellular processes?",
              "What happens during photosynthesis?"
            ]
          };
          
        case 'English':
          return {
            answer: "The main theme is the conflict between individual conscience and societal expectations, explored through character development and symbolism",
            steps: [
              "Identify the central conflict in the text",
              "Analyze character motivations and development",
              "Examine literary devices used by the author",
              "Connect themes to broader social context",
              "Support analysis with specific textual evidence"
            ],
            explanation: "Literary analysis requires examining how authors use various techniques to convey meaning. Themes often reflect universal human experiences and social issues relevant to both the time period and modern readers.",
            alternativeMethods: [
              "Character analysis approach: Focus on protagonist's journey",
              "Symbolic interpretation: Analyze metaphors and symbols",
              "Historical context method: Consider time period influences"
            ],
            relatedConcepts: [
              "Literary themes and motifs",
              "Character development techniques",
              "Narrative structure and style"
            ],
            practiceProblems: [
              "How does the author use symbolism to convey meaning?",
              "What is the significance of the story's setting?",
              "How do secondary characters support the main theme?"
            ]
          };
          
        default: // Mathematics
          return {
            answer: "x = 4",
            steps: [
              "Identify the given information and what we need to find",
              "Set up the equation based on the problem context",
              "Solve the equation step by step",
              "Check the answer by substituting back into the original equation",
              "Write the final answer with appropriate units"
            ],
            explanation: "This problem involves basic algebraic manipulation. We start by identifying the variables and setting up an equation that represents the relationship described in the problem.",
            alternativeMethods: [
              "Graphical method: Plot the equation and find intersection points",
              "Trial and error: Test different values systematically",
              "Using a calculator or computer algebra system"
            ],
            relatedConcepts: [
              "Linear equations",
              "Algebraic manipulation",
              "Problem-solving strategies"
            ],
            practiceProblems: [
              "If x + 5 = 12, find the value of x",
              "Solve for y: 2y - 3 = 7",
              "Find the solution: 3(x + 2) = 15"
            ]
          };
      }
    };
    
    const subjectSolution = generateSubjectSolution(detectedSubject, problem);
    
    const mockSolution: Solution = {
      id: `solution_${Date.now()}`,
      problem: problem,
      subject: detectedSubject,
      difficulty: "medium",
      timeToSolve: detectedSubject === 'Mathematics' ? 3.5 : detectedSubject === 'History' ? 5.2 : 4.1,
      confidence: detectedSubject === 'Mathematics' ? 95 : detectedSubject === 'History' ? 92 : 88,
      ...subjectSolution
    } as Solution;
    
    setIsProcessing(false);
    return mockSolution;
  }, []);

  const handleSolveProblem = async () => {
    if (!problemText.trim()) return;
    
    try {
      const solution = await generateSolution(problemText);
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
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        type: 'assistant',
        content: "I understand your question. Let me help you with that concept. Can you provide more details about which specific part you're struggling with?",
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
      explanation: currentSolution.explanation
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'homework_solution.json';
    a.click();
    URL.revokeObjectURL(url);
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
                placeholder="Type your homework problem here... (e.g., 'Solve for x: 2x + 5 = 13')"
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
              <span>Supports: Math, Science, English, History</span>
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
                    {currentSolution.subject}
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
                <p className="text-gray-300">Get instant solutions and explanations</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-400">Problems Solved Today</div>
                <div className="text-2xl font-bold text-teal-400">247</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
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
                          {solution.subject} • {solution.difficulty}
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
                <div className="bg-white/5 border border-gray-600 rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    {inputMethod === 'type' && '✍️ Type Your Problem'}
                    {inputMethod === 'upload' && '📄 Upload Document'}
                    {inputMethod === 'camera' && '📸 Capture Problem'}
                  </h2>
                  
                  {renderInputMethod()}
                  
                  <div className="mt-6 flex gap-4">
                    <button
                      onClick={handleSolveProblem}
                      disabled={!problemText.trim() || isProcessing}
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
                    <h3 className="font-semibold text-white mb-1">Instant Solutions</h3>
                    <p className="text-sm text-gray-300">Get answers in seconds with step-by-step explanations</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 border border-green-500/30 rounded-xl p-4">
                    <div className="text-2xl mb-2">🎯</div>
                    <h3 className="font-semibold text-white mb-1">High Accuracy</h3>
                    <p className="text-sm text-gray-300">95%+ accuracy across all subjects and grade levels</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
                    <div className="text-2xl mb-2">💬</div>
                    <h3 className="font-semibold text-white mb-1">Ask Questions</h3>
                    <p className="text-sm text-gray-300">Chat with AI for doubts and concept clarification</p>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'solution' && renderSolution()}
            {viewMode === 'chat' && renderChat()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeworkHelper;