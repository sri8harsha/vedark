import React, { useState, useRef } from 'react';
import { Upload, Camera, MessageCircle, ArrowLeft, Loader, AlertCircle, CheckCircle } from 'lucide-react';

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

const HomeworkHelper: React.FC<HomeworkHelperProps> = ({ onBackToHome }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        setError(null);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!uploadedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_REACT_APP_OPENAI_API_KEY;
      
      if (!apiKey || apiKey === 'your-actual-api-key-here') {
        throw new Error('OpenAI API key not configured. Please set VITE_REACT_APP_OPENAI_API_KEY in your .env file.');
      }

      console.log('🔍 Analyzing homework image with GPT-4V...');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are an expert educational tutor who helps students understand homework problems. 

IMPORTANT: Always respond in valid JSON format with these exact fields:
{
  "question": "The main question or problem from the image",
  "answer": "The final answer or solution",
  "explanation": "Step-by-step explanation in simple terms",
  "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
  "confidence": 85,
  "approaches": ["Alternative method 1", "Alternative method 2"],
  "flashcards": [{"question": "Review question", "answer": "Answer"}],
  "practiceQuestions": ["Similar practice problem 1", "Similar practice problem 2"],
  "timeToSolve": "Estimated time to solve this type of problem"
}

Guidelines:
- Extract the main math/science question from the image
- Provide a clear, step-by-step solution appropriate for the student's level
- Use encouraging, educational language
- Include alternative approaches when helpful
- Suggest practice questions for reinforcement
- Rate your confidence in the solution (0-100)`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Please analyze this homework problem and provide a detailed, educational solution.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: uploadedImage
                  }
                }
              ]
            }
          ],
          max_tokens: 1500,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenAI API key configuration.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        } else {
          throw new Error(`API request failed with status ${response.status}`);
        }
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response from OpenAI API');
      }

      let content = data.choices[0].message.content.trim();
      
      // Clean up JSON response
      if (content.startsWith('```json')) {
        content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (content.startsWith('```')) {
        content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      try {
        const result = JSON.parse(content);
        setAnalysisResult(result);
        console.log('✅ Image analysis completed successfully');
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        // Fallback: create a basic result from the raw content
        setAnalysisResult({
          question: 'Problem detected in image',
          answer: content,
          explanation: content,
          steps: [content],
          confidence: 70
        });
      }

    } catch (error) {
      console.error('Image analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetUpload = () => {
    setUploadedImage(null);
    setAnalysisResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-emerald-900 text-white">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all"
            >
              <ArrowLeft size={20} />
              Back to Home
            </button>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                🤝 Homework Helper
              </h1>
              <p className="text-green-200">Upload your homework and get step-by-step help</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {!uploadedImage ? (
          /* Upload Section */
          <div className="text-center">
            <div className="bg-black/20 backdrop-blur-md rounded-3xl p-12 border border-green-500/30">
              <h2 className="text-2xl font-bold mb-6 text-green-400">Upload Your Homework</h2>
              
              <div 
                className="border-2 border-dashed border-green-500/50 rounded-2xl p-12 mb-6 hover:border-green-400 transition-all cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={64} className="mx-auto mb-4 text-green-400" />
                <p className="text-xl mb-2">Click to upload a file or drag and drop</p>
                <p className="text-green-200">Supports: PDF, DOC, TXT, Images (JPG, PNG)</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-6 py-3 rounded-full font-bold transition-all"
                >
                  <Upload size={20} />
                  Choose File
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-black/20 backdrop-blur-md rounded-xl p-6 border border-green-500/30">
                <div className="text-4xl mb-4">📸</div>
                <h3 className="text-lg font-bold mb-2 text-green-400">Photo Upload</h3>
                <p className="text-green-200 text-sm">Take a photo of your homework or upload an existing image</p>
              </div>
              
              <div className="bg-black/20 backdrop-blur-md rounded-xl p-6 border border-green-500/30">
                <div className="text-4xl mb-4">🧠</div>
                <h3 className="text-lg font-bold mb-2 text-green-400">AI Analysis</h3>
                <p className="text-green-200 text-sm">Advanced AI reads and understands your homework problems</p>
              </div>
              
              <div className="bg-black/20 backdrop-blur-md rounded-xl p-6 border border-green-500/30">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-lg font-bold mb-2 text-green-400">Step-by-Step Help</h3>
                <p className="text-green-200 text-sm">Get detailed explanations and learning guidance</p>
              </div>
            </div>
          </div>
        ) : (
          /* Analysis Section */
          <div className="space-y-6">
            {/* Uploaded Image */}
            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-green-500/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-green-400">📸 Uploaded Image</h3>
                <button
                  onClick={resetUpload}
                  className="text-green-300 hover:text-green-100 transition-colors"
                >
                  Upload Different Image
                </button>
              </div>
              
              <div className="text-center">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded homework" 
                  className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                />
              </div>

              {!analysisResult && !isAnalyzing && (
                <div className="text-center mt-6">
                  <button
                    onClick={analyzeImage}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105"
                  >
                    🔍 Get Solution from Image (GPT-4V)
                  </button>
                </div>
              )}
            </div>

            {/* Loading State */}
            {isAnalyzing && (
              <div className="bg-black/20 backdrop-blur-md rounded-2xl p-8 border border-green-500/30 text-center">
                <Loader className="animate-spin mx-auto mb-4 text-green-400" size={48} />
                <h3 className="text-xl font-bold mb-2 text-green-400">Analyzing Your Homework...</h3>
                <p className="text-green-200">Our AI is reading and understanding your problem</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-500/20 backdrop-blur-md rounded-2xl p-6 border border-red-500/50">
                <div className="flex items-center gap-3 mb-3">
                  <AlertCircle className="text-red-400" size={24} />
                  <h3 className="text-xl font-bold text-red-400">Analysis Failed</h3>
                </div>
                <p className="text-red-200 mb-4">{error}</p>
                <button
                  onClick={analyzeImage}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-6 py-3 rounded-full font-bold transition-all"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Analysis Results */}
            {analysisResult && (
              <div className="space-y-6">
                {/* Main Solution */}
                <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-green-500/30">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="text-green-400" size={24} />
                    <h3 className="text-xl font-bold text-green-400">Solution</h3>
                    {analysisResult.confidence && (
                      <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                        {analysisResult.confidence}% confidence
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-white mb-2">📝 Problem:</h4>
                      <p className="text-green-100 bg-white/5 p-3 rounded-lg">{analysisResult.question}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-white mb-2">✅ Answer:</h4>
                      <p className="text-green-100 bg-green-500/10 p-3 rounded-lg font-bold">{analysisResult.answer}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-white mb-2">📚 Explanation:</h4>
                      <p className="text-green-100 bg-white/5 p-3 rounded-lg leading-relaxed">{analysisResult.explanation}</p>
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Solution */}
                {analysisResult.steps && analysisResult.steps.length > 0 && (
                  <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-green-500/30">
                    <h3 className="text-xl font-bold text-green-400 mb-4">🔢 Step-by-Step Solution</h3>
                    <div className="space-y-3">
                      {analysisResult.steps.map((step, index) => (
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
                  {analysisResult.approaches && analysisResult.approaches.length > 0 && (
                    <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-green-500/30">
                      <h3 className="text-lg font-bold text-green-400 mb-4">🔄 Alternative Methods</h3>
                      <ul className="space-y-2">
                        {analysisResult.approaches.map((approach, index) => (
                          <li key={index} className="text-green-100 bg-white/5 p-2 rounded">
                            • {approach}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Practice Questions */}
                  {analysisResult.practiceQuestions && analysisResult.practiceQuestions.length > 0 && (
                    <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-green-500/30">
                      <h3 className="text-lg font-bold text-green-400 mb-4">📝 Practice Problems</h3>
                      <ul className="space-y-2">
                        {analysisResult.practiceQuestions.map((question, index) => (
                          <li key={index} className="text-green-100 bg-white/5 p-2 rounded">
                            {index + 1}. {question}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Flashcards */}
                {analysisResult.flashcards && analysisResult.flashcards.length > 0 && (
                  <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-green-500/30">
                    <h3 className="text-lg font-bold text-green-400 mb-4">🎴 Study Flashcards</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysisResult.flashcards.map((card, index) => (
                        <div key={index} className="bg-white/5 p-4 rounded-lg">
                          <div className="font-bold text-white mb-2">Q: {card.question}</div>
                          <div className="text-green-200">A: {card.answer}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Time Estimate */}
                {analysisResult.timeToSolve && (
                  <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-green-500/30 text-center">
                    <span className="text-green-400">⏱️ Estimated solving time: </span>
                    <span className="text-white font-bold">{analysisResult.timeToSolve}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={resetUpload}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 px-6 py-3 rounded-full font-bold transition-all"
                  >
                    📸 Upload Another Problem
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
        )}
      </div>
    </div>
  );
};

export default HomeworkHelper;