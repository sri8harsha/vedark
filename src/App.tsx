import React, { useState } from 'react';
import BattleMode from './components/BattleMode';
import VedarkHomePage from './components/VedarkHomePage';

type CurrentView = 'home' | 'battle-mode' | 'squad-stories' | 'ai-stories' | 'homework-helper' | 'live-sessions';

function App() {
  const [currentView, setCurrentView] = useState<CurrentView>('home');

  const navigateTo = (view: CurrentView) => {
    setCurrentView(view);
  };

  const goHome = () => {
    setCurrentView('home');
  };

  // Render based on current view
  switch (currentView) {
    case 'battle-mode':
      return <BattleMode onBackToHome={goHome} />;
    
    case 'squad-stories':
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-900 text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">👥 Squad Stories</h1>
            <p className="text-xl mb-8">Multiplayer learning adventures coming soon!</p>
            <button 
              onClick={goHome}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-full font-bold"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      );
    
    case 'ai-stories':
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-cyan-900 text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">📚 AI Story Problems</h1>
            <p className="text-xl mb-8">Personalized story-based learning coming soon!</p>
            <button 
              onClick={goHome}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full font-bold"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      );
    
    case 'homework-helper':
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-900 to-emerald-900 text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">🤝 Homework Helper</h1>
            <p className="text-xl mb-8">AI-powered homework assistance coming soon!</p>
            <button 
              onClick={goHome}
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-full font-bold"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      );
    
    case 'live-sessions':
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-900 to-red-900 text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">📺 Live Sessions</h1>
            <p className="text-xl mb-8">Interactive group learning sessions coming soon!</p>
            <button 
              onClick={goHome}
              className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-full font-bold"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      );
    
    case 'home':
    default:
      return <VedarkHomePage onNavigate={navigateTo} />;
  }
}

export default App;