import React from 'react';
import { ShoppingCart, Coins } from 'lucide-react';
import { PowerUp } from '../types/game';
import { POWER_UPS } from '../data/powerups';

interface PowerUpShopProps {
  playerScore: number;
  playerPowerUps: { [key: string]: number };
  onPurchase: (powerUpId: string) => void;
  onClose: () => void;
}

const PowerUpShop: React.FC<PowerUpShopProps> = ({
  playerScore,
  playerPowerUps,
  onPurchase,
  onClose
}) => {
  const canAfford = (cost: number) => playerScore >= cost;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-cyan-500/30">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
            🛒 POWER-UP SHOP
          </h2>
          <div className="flex items-center justify-center gap-2 text-xl">
            <Coins className="text-yellow-400" size={24} />
            <span className="text-yellow-400 font-bold">{playerScore.toLocaleString()} Points</span>
          </div>
        </div>

        {/* Power-ups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {POWER_UPS.map((powerUp) => {
            const owned = playerPowerUps[powerUp.id] || 0;
            const affordable = canAfford(powerUp.cost);
            
            return (
              <div
                key={powerUp.id}
                className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                  affordable 
                    ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-cyan-400 hover:border-yellow-400 hover:scale-105 cursor-pointer'
                    : 'bg-gray-800/50 border-gray-600 opacity-60'
                }`}
                onClick={() => affordable && onPurchase(powerUp.id)}
              >
                {/* Power-up Icon */}
                <div className="text-center mb-4">
                  <div className="text-5xl mb-2">{powerUp.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-1">{powerUp.name}</h3>
                  <p className="text-sm text-gray-300">{powerUp.description}</p>
                </div>

                {/* Cost */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <Coins size={16} className="text-yellow-400" />
                    <span className={`font-bold ${affordable ? 'text-yellow-400' : 'text-red-400'}`}>
                      {powerUp.cost}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Owned: <span className="text-cyan-400 font-bold">{owned}</span>
                  </div>
                </div>

                {/* Duration Info */}
                {powerUp.duration && (
                  <div className="text-xs text-purple-400 mb-4">
                    Duration: {powerUp.duration}{powerUp.effect === 'slowTime' ? 's' : ' questions'}
                  </div>
                )}

                {/* Purchase Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    affordable && onPurchase(powerUp.id);
                  }}
                  disabled={!affordable}
                  className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${
                    affordable
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {affordable ? '💰 BUY NOW' : '❌ NOT ENOUGH POINTS'}
                </button>

                {/* Hover Effect */}
                {affordable && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                    BUY
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tips */}
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-bold text-blue-400 mb-2">💡 Pro Tips</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Use Extra Time when facing tough opponents</li>
            <li>• Hint Reveal is perfect for learning new concepts</li>
            <li>• Double Points works great with high streaks</li>
            <li>• Save Slow Time for expert-level battles</li>
          </ul>
        </div>

        {/* Close Button */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-3 rounded-full font-bold hover:from-gray-700 hover:to-gray-800 transition-all"
          >
            ✨ CLOSE SHOP
          </button>
        </div>
      </div>
    </div>
  );
};

export default PowerUpShop;