import React from 'react';
import { FiredRule } from '../../../soft-computing/types';

interface FuzzyExplanationProps {
  firedRules: FiredRule[];
  balanceScore: number;
  stressScore: number;
  className?: string;
}

export default function FuzzyExplanation({ firedRules, balanceScore, stressScore, className = '' }: FuzzyExplanationProps) {
  const topRules = firedRules.slice(0, 5);

  return (
    <div className={`bg-gray-800 p-6 rounded-xl ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Fuzzy Logic Evaluation</h3>
        <div className="flex gap-4 text-sm">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }}></span>
            Balance: {balanceScore.toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }}></span>
            Stress: {stressScore.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {topRules.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No rules fired significantly</p>
        ) : (
          topRules.map((rule, index) => (
            <div key={index} className="p-3 bg-gray-700 rounded-lg border-l-4 border-cyan-500">
              <div className="flex justify-between items-start mb-1">
                <p className="text-sm font-medium text-cyan-300">{rule.name}</p>
                <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-600 rounded">
                  Strength: {rule.strength.toFixed(2)}
                </span>
              </div>
              <div className="flex gap-4 text-xs text-gray-300">
                <span>→ Balance: <span className="font-medium text-green-400">{rule.consequence.balance}</span></span>
                <span>→ Stress: <span className="font-medium text-red-400">{rule.consequence.stress}</span></span>
              </div>
            </div>
          ))
        )}
      </div>

      {firedRules.length > 5 && (
        <p className="mt-3 text-xs text-gray-500 text-center">
          + {firedRules.length - 5} more rules fired
        </p>
      )}
    </div>
  );
}