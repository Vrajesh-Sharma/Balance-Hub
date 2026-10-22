import { FiredRule } from '../../soft-computing/types';

interface FuzzyExplanationProps {
  firedRules: FiredRule[];
  balanceScore: number;
  stressScore: number;
  className?: string;
}

export default function FuzzyExplanation({ firedRules, balanceScore, stressScore, className = '' }: FuzzyExplanationProps) {
  const topRules = firedRules.slice(0, 5);

  return (
    <div className={`card p-4 sm:p-6 min-w-0 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h3 className="text-heading-sm font-semibold text-charcoal-900">Fuzzy Logic Evaluation</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-charcoal-800">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#437066' }} aria-hidden="true"></span>
            Balance: {balanceScore.toFixed(1)}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#d1421c' }} aria-hidden="true"></span>
            Stress: {stressScore.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {topRules.length === 0 ? (
          <p className="text-charcoal-700 text-center py-4">No rules fired significantly</p>
        ) : (
          topRules.map((rule, index) => (
            <div key={index} className="p-3 bg-cream-100 rounded-lg border border-border border-l-4 border-l-sage-600">
              <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                <p className="text-sm font-semibold text-sage-800 min-w-0 break-words">{rule.name}</p>
                <span className="text-xs text-charcoal-700 px-2 py-0.5 bg-white border border-border rounded shrink-0">
                  Strength: {rule.strength.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-charcoal-700">
                <span>→ Balance: <span className="font-medium text-emerald-800">{rule.consequence.balance}</span></span>
                <span>→ Stress: <span className="font-medium text-coral-700">{rule.consequence.stress}</span></span>
              </div>
            </div>
          ))
        )}
      </div>

      {firedRules.length > 5 && (
        <p className="mt-3 text-xs text-charcoal-700 text-center">
          + {firedRules.length - 5} more rules fired
        </p>
      )}
    </div>
  );
}
