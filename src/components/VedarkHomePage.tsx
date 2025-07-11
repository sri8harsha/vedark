import React, { useState, useEffect } from 'react';
import { Menu, X, Play, Star, Check } from 'lucide-react';

type CurrentView = 'home' | 'battle-mode' | 'squad-stories' | 'ai-stories' | 'homework-helper' | 'live-sessions';

interface VedarkHomePageProps {
  onNavigate: (view: CurrentView) => void;
}

const VedarkHomePage: React.FC<VedarkHomePageProps> = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-black text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/95 backdrop-blur-md py-3' : 'bg-black/80 backdrop-blur-md py-4'
      } border-b border-white/10`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="text-2xl font-black bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent cursor-pointer">
            VEDARK
          </div>
          
          <div className="hidden md:flex gap-8">
            <a href="#features" className="text-white/80 hover:text-teal-400 transition-colors">Features</a>
            <a href="#demo" className="text-white/80 hover:text-teal-400 transition-colors">Demo</a>
            <a href="#pricing" className="text-white/80 hover:text-teal-400 transition-colors">Pricing</a>
            <a href="#success" className="text-white/80 hover:text-teal-400 transition-colors">Success</a>
          </div>

          <div className="hidden md:flex gap-4">
            <button className="px-6 py-2 border border-white/20 rounded-full hover:border-teal-400 hover:text-teal-400 transition-all">
              Login
            </button>
            <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-teal-600 rounded-full hover:from-purple-700 hover:to-teal-700 transition-all">
              Start Free
            </button>
          </div>

          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen relative flex items-center justify-center pt-20">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-teal-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white via-teal-400 to-purple-400 bg-clip-text text-transparent">
            Where Every Problem<br />Becomes a Story
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto">
            Transform homework hell into adventure heaven with AI that makes learning irresistible
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-teal-600 rounded-full text-xl font-bold hover:from-purple-700 hover:to-teal-700 transition-all transform hover:scale-105 shadow-2xl">
              Start Free Adventure
            </button>
            <button className="px-8 py-4 bg-white/5 border border-white/20 rounded-full text-xl font-bold hover:bg-white/10 transition-all backdrop-blur-md">
              Watch Demo
            </button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-12 text-center">
            <div>
              <div className="text-3xl font-black text-teal-400">50K+</div>
              <div className="text-sm text-white/60">Happy Students</div>
            </div>
            <div>
              <div className="text-3xl font-black text-teal-400">95%</div>
              <div className="text-sm text-white/60">Grade Improvement</div>
            </div>
            <div>
              <div className="text-3xl font-black text-teal-400">4.9/5</div>
              <div className="text-sm text-white/60">Parent Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-black to-purple-900/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
              Learning Adventures Await
            </h2>
            <p className="text-xl text-white/70">Choose your path to academic mastery</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Battle Mode */}
            <div 
              onClick={() => onNavigate('battle-mode')}
              className="group bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-3xl p-8 border border-red-500/20 hover:border-red-400/50 transition-all duration-300 cursor-pointer transform hover:scale-105"
            >
              <div className="text-6xl mb-4 group-hover:animate-bounce">⚔️</div>
              <h3 className="text-2xl font-bold mb-3 text-red-400">Battle Mode</h3>
              <p className="text-white/70 mb-6">Challenge AI that makes mistakes on purpose</p>
              <ul className="space-y-2 text-sm text-white/60">
                <li>🎮 Choose your subject arena</li>
                <li>🤖 AI shows its solution</li>
                <li>🔍 Spot the mistakes</li>
                <li>🏆 Earn points and level up</li>
              </ul>
            </div>

            {/* Squad Stories */}
            <div 
              onClick={() => onNavigate('squad-stories')}
              className="group bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-3xl p-8 border border-purple-500/20 hover:border-purple-400/50 transition-all duration-300 cursor-pointer transform hover:scale-105"
            >
              <div className="text-6xl mb-4 group-hover:animate-bounce">👥</div>
              <h3 className="text-2xl font-bold mb-3 text-purple-400">Squad Stories</h3>
              <p className="text-white/70 mb-6">Team up with friends for multiplayer learning</p>
              <ul className="space-y-2 text-sm text-white/60">
                <li>🎭 Pick your character role</li>
                <li>👥 Join friends online</li>
                <li>🧩 Solve problems together</li>
                <li>🎉 Celebrate team victories</li>
              </ul>
              <div className="mt-4 text-xs text-purple-300 bg-purple-900/30 px-2 py-1 rounded-full inline-block">
                Coming Soon
              </div>
            </div>

            {/* AI Story Problems */}
            <div 
              onClick={() => onNavigate('ai-stories')}
              className="group bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-3xl p-8 border border-blue-500/20 hover:border-blue-400/50 transition-all duration-300 cursor-pointer transform hover:scale-105"
            >
              <div className="text-6xl mb-4 group-hover:animate-bounce">📚</div>
              <h3 className="text-2xl font-bold mb-3 text-blue-400">AI Story Problems</h3>
              <p className="text-white/70 mb-6">Personalized adventures that teach</p>
              <ul className="space-y-2 text-sm text-white/60">
                <li>🏰 Epic fantasy settings</li>
                <li>🎯 Adaptive difficulty</li>
                <li>📖 Rich storytelling</li>
                <li>✨ Personalized characters</li>
              </ul>
              <div className="mt-4 text-xs text-blue-300 bg-blue-900/30 px-2 py-1 rounded-full inline-block">
                Coming Soon
              </div>
            </div>

            {/* Homework Helper */}
            <div 
              onClick={() => onNavigate('homework-helper')}
              className="group bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-3xl p-8 border border-green-500/20 hover:border-green-400/50 transition-all duration-300 cursor-pointer transform hover:scale-105"
            >
              <div className="text-6xl mb-4 group-hover:animate-bounce">🤝</div>
              <h3 className="text-2xl font-bold mb-3 text-green-400">AI Homework Helper</h3>
              <p className="text-white/70 mb-6">Get instant step-by-step solutions powered by AI</p>
              <ul className="space-y-2 text-sm text-white/60">
                <li>📝 Type or upload questions</li>
                <li>🧠 Advanced AI analysis</li>
                <li>📚 Step-by-step explanations</li>
                <li>🎯 Practice problems included</li>
              </ul>
              <div className="mt-4 text-xs text-green-300 bg-green-500/20 px-2 py-1 rounded-full inline-block">
                ✨ Now Available
              </div>
            </div>

            {/* Live Sessions */}
            <div 
              onClick={() => onNavigate('live-sessions')}
              className="group bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded-3xl p-8 border border-orange-500/20 hover:border-orange-400/50 transition-all duration-300 cursor-pointer transform hover:scale-105"
            >
              <div className="text-6xl mb-4 group-hover:animate-bounce">📺</div>
              <h3 className="text-2xl font-bold mb-3 text-orange-400">Live Sessions</h3>
              <p className="text-white/70 mb-6">Interactive group learning sessions</p>
              <ul className="space-y-2 text-sm text-white/60">
                <li>🎥 Live video sessions</li>
                <li>🗣️ Interactive discussions</li>
                <li>👨‍🏫 Expert instructors</li>
                <li>🌟 Small group format</li>
              </ul>
              <div className="mt-4 text-xs text-orange-300 bg-orange-900/30 px-2 py-1 rounded-full inline-block">
                Coming Soon
              </div>
            </div>

            {/* Bonus Feature */}
            <div className="group bg-gradient-to-br from-yellow-900/30 to-amber-900/30 rounded-3xl p-8 border border-yellow-500/20 hover:border-yellow-400/50 transition-all duration-300">
              <div className="text-6xl mb-4 group-hover:animate-bounce">🎨</div>
              <h3 className="text-2xl font-bold mb-3 text-yellow-400">Story Creator</h3>
              <p className="text-white/70 mb-6">Build your own learning adventures</p>
              <ul className="space-y-2 text-sm text-white/60">
                <li>🖼️ Custom characters</li>
                <li>🏗️ Story builder tools</li>
                <li>🎯 Curriculum alignment</li>
                <li>🎪 Share with friends</li>
              </ul>
              <div className="mt-4 text-xs text-yellow-300 bg-yellow-900/30 px-2 py-1 rounded-full inline-block">
                Coming Soon
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900 to-teal-900">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-white to-teal-400 bg-clip-text text-transparent">
            Ready to Transform Learning?
          </h2>
          <p className="text-xl text-white/80 mb-12">
            Join thousands of families already making homework time the highlight of their day
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="px-12 py-4 bg-gradient-to-r from-purple-600 to-teal-600 rounded-full text-xl font-bold hover:from-purple-700 hover:to-teal-700 transition-all transform hover:scale-105 shadow-2xl">
              Start Free Trial
            </button>
            <button className="px-12 py-4 bg-white/10 border border-white/20 rounded-full text-xl font-bold hover:bg-white/20 transition-all backdrop-blur-md">
              Schedule Demo
            </button>
          </div>
          <p className="text-sm text-white/60 mt-6">
            30-day money-back guarantee • No credit card required to start
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-black bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent mb-4">
                VEDARK
              </div>
              <p className="text-white/60 text-sm">
                Transforming education through AI-powered storytelling and gamification.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="#" className="hover:text-teal-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Demo</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="#" className="hover:text-teal-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="#" className="hover:text-teal-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Community</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/60">
            <p>&copy; 2024 VEDARK. All rights reserved. Made with ❤️ for learners everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VedarkHomePage; 