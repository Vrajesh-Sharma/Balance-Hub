import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { evaluateBalance } from '../soft-computing/fuzzy';
import { smartSchedulerData } from '../lib/dummyData';
import { UserInputs } from '../soft-computing/types';

interface ScheduleItem {
  activity: string;
  hours: number;
}

const AskAI: React.FC = () => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    { activity: 'Work', hours: 0 },
    { activity: 'Personal Time', hours: 0 },
    { activity: 'Sleep', hours: 0 },
  ]);
  
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'warning' | 'error'>('success');
  const [showMessage, setShowMessage] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fuzzyDetails, setFuzzyDetails] = useState<{
    balanceScore: number;
    stressScore: number;
    firedRules: Array<{name: string; strength: number; consequence: {balance: number; stress: number}}>;
  } | null>(null);
  const [hasRealData, setHasRealData] = useState(false);
  const [useTestData, setUseTestData] = useState(false);

  useEffect(() => {
    setHasRealData(smartSchedulerData.hasRealData());
  }, []);

  useEffect(() => {
    if (hasRealData && !useTestData) {
      loadRealUserData();
    }
  }, [hasRealData, useTestData]);

  const loadRealUserData = async () => {
    try {
      const inputs = smartSchedulerData.getUserInputs();
      const workHours = inputs.workHours;
      const personalHours = inputs.personalHours;
      const sleepHours = inputs.sleepHours;
      
      setScheduleItems([
        { activity: 'Work', hours: Math.round(workHours * 10) / 10 },
        { activity: 'Personal Time', hours: Math.round(personalHours * 10) / 10 },
        { activity: 'Sleep', hours: Math.round(sleepHours * 10) / 10 },
      ]);
    } catch (err) {
      console.error('Failed to load real user data:', err);
    }
  };

  const handleHoursChange = (index: number, hours: number) => {
    const newSchedule = [...scheduleItems];
    newSchedule[index].hours = Math.max(0, Math.min(24, hours));
    setScheduleItems(newSchedule);
    setShowMessage(false);
    setFuzzyDetails(null);
  };

  const handleAnalyzeClick = async () => {
    setIsAnalyzing(true);
    setShowMessage(false);
    setFuzzyDetails(null);

    try {
      const workHours = scheduleItems.find(item => item.activity === 'Work')?.hours || 0;
      const personalHours = scheduleItems.find(item => item.activity === 'Personal Time')?.hours || 0;
      const sleepHours = scheduleItems.find(item => item.activity === 'Sleep')?.hours || 0;
      const totalHours = workHours + personalHours + sleepHours;

      if (totalHours > 24) {
        setMessage('Total hours cannot exceed 24 hours in a day!');
        setMessageType('error');
        setShowMessage(true);
        setIsAnalyzing(false);
        return;
      }

      if (totalHours === 0) {
        setMessage('Please enter your daily schedule hours before analysis.');
        setMessageType('warning');
        setShowMessage(true);
        setIsAnalyzing(false);
        return;
      }

      // Build UserInputs for fuzzy logic from the user's entered hours
      // We use real user data as base and override with entered hours
      let baseInputs: UserInputs;
      
      if (!useTestData && hasRealData) {
        baseInputs = smartSchedulerData.getUserInputs();
      } else {
        const profile = await import('../soft-computing/data').then(m => m.generateSyntheticProfile(30));
        baseInputs = profile.inputs;
      }

      // Override with user-entered values
      const fuzzyInputs: UserInputs = {
        ...baseInputs,
        workHours,
        personalHours,
        sleepHours,
        exerciseHours: baseInputs.exerciseHours,
      };

      // Run the actual Fuzzy Logic inference engine
      const fuzzyResult = evaluateBalance(fuzzyInputs);

      setFuzzyDetails({
        balanceScore: fuzzyResult.balanceScore,
        stressScore: fuzzyResult.stressScore,
        firedRules: fuzzyResult.firedRules,
      });

      // Generate message based on actual fuzzy output
      let analysisMessage = '';
      let analysisType: 'success' | 'warning' | 'error' = 'success';

      if (fuzzyResult.balanceScore >= 70 && fuzzyResult.stressScore <= 30) {
        analysisMessage = `Excellent! Your schedule shows a healthy balance (Balance: ${fuzzyResult.balanceScore.toFixed(1)}/100, Stress: ${fuzzyResult.stressScore.toFixed(1)}/100).`;
        analysisType = 'success';
      } else if (fuzzyResult.balanceScore >= 50 && fuzzyResult.stressScore <= 50) {
        analysisMessage = `Your schedule has fair balance (Balance: ${fuzzyResult.balanceScore.toFixed(1)}/100, Stress: ${fuzzyResult.stressScore.toFixed(1)}/100). Consider adjustments for better well-being.`;
        analysisType = 'warning';
      } else {
        analysisMessage = `Your schedule needs improvement (Balance: ${fuzzyResult.balanceScore.toFixed(1)}/100, Stress: ${fuzzyResult.stressScore.toFixed(1)}/100). The fuzzy logic system detected significant imbalance.`;
        analysisType = 'error';
      }

      // Add top fired rule info
      if (fuzzyResult.firedRules.length > 0) {
        const topRule = fuzzyResult.firedRules[0];
        analysisMessage += ` Key factor: ${topRule.name} (strength: ${topRule.strength.toFixed(2)}).`;
      }

      setMessage(analysisMessage);
      setMessageType(analysisType);
      setShowMessage(true);
    } catch (err) {
      setMessage(`Analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setMessageType('error');
      setShowMessage(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUseTestDataChange = (checked: boolean) => {
    setUseTestData(checked);
    if (checked) {
      loadTestData();
    } else if (hasRealData) {
      loadRealUserData();
    }
  };

  const loadTestData = async () => {
    try {
      const { generateSyntheticProfile } = await import('../soft-computing/data');
      const profile = generateSyntheticProfile(30);
      setScheduleItems([
        { activity: 'Work', hours: Math.round(profile.inputs.workHours * 10) / 10 },
        { activity: 'Personal Time', hours: Math.round(profile.inputs.personalHours * 10) / 10 },
        { activity: 'Sleep', hours: Math.round(profile.inputs.sleepHours * 10) / 10 },
      ]);
    } catch (err) {
      console.error('Failed to load test data:', err);
    }
  };

  const allocation = [
    { label: 'Work', hours: 8, color: '#437066' },
    { label: 'Personal', hours: 8, color: '#9784b8' },
    { label: 'Sleep', hours: 8, color: '#c49550' },
  ];
  const CIRCUMFERENCE = 2 * Math.PI * 70;
  let allocationOffset = 0;

  return (
    <div className="page">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-center gap-3 mb-6 lg:mb-8 text-center">
          <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-sage-700 shrink-0" aria-hidden="true" />
          <h1 className="page-title">Schedule Analysis</h1>
        </div>

        {/* Data Source Toggle */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={useTestData}
              onChange={(e) => handleUseTestDataChange(e.target.checked)}
              className="w-5 h-5 accent-sage-600 rounded border-border"
            />
            <span className="text-sm text-charcoal-900">Use test data (synthetic)</span>
          </label>
          {hasRealData && !useTestData && (
            <span className="flex items-center gap-1 text-sm text-emerald-800">
              <CheckCircle size={14} aria-hidden="true" />
              Real user data loaded
            </span>
          )}
          {!hasRealData && !useTestData && (
            <span className="flex items-center gap-1 text-sm text-amber-800">
              <AlertCircle size={14} aria-hidden="true" />
              No real data - using defaults
            </span>
          )}
        </div>

        {/* Main Content Card */}
        <div className="card p-4 sm:p-6 mb-6">
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-3 mb-6 sm:mb-8">
            {scheduleItems.map((item, index) => (
              <div key={item.activity}>
                <label htmlFor={`hours-${index}`} className="label">
                  {item.activity}
                </label>
                <div className="relative">
                  <input
                    id={`hours-${index}`}
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={item.hours}
                    onChange={(e) => handleHoursChange(index, Number(e.target.value))}
                    className="input pr-12"
                    placeholder="Hours"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-700 text-sm pointer-events-none">
                    hrs
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Analyze Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleAnalyzeClick}
              disabled={isAnalyzing}
              className="btn-primary btn-lg w-full sm:w-auto"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                  Analyze with Fuzzy Logic
                </>
              )}
            </button>
          </div>

          {/* Analysis Message */}
          {showMessage && message && (
            <div
              role="status"
              className={`mt-6 sm:mt-8 p-4 rounded-xl text-center font-medium border ${
                messageType === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : messageType === 'warning'
                    ? 'bg-honey-50 text-amber-800 border-honey-300'
                    : 'bg-coral-50 text-coral-800 border-coral-200'
              }`}
            >
              {message}
            </div>
          )}

          {/* Fuzzy Logic Details */}
          {fuzzyDetails && (
            <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-cream-50 rounded-2xl border border-border">
              <h2 className="text-heading-md font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-sage-700 shrink-0" aria-hidden="true" />
                Fuzzy Logic Analysis Details
              </h2>

              <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-4 mb-6">
                <div className="bg-white border border-border p-4 rounded-xl">
                  <p className="text-sm text-charcoal-700">Balance Score</p>
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-800">{fuzzyDetails.balanceScore.toFixed(1)} / 100</p>
                </div>
                <div className="bg-white border border-border p-4 rounded-xl">
                  <p className="text-sm text-charcoal-700">Stress Score</p>
                  <p className="text-2xl sm:text-3xl font-bold text-coral-700">{fuzzyDetails.stressScore.toFixed(1)} / 100</p>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                <p className="text-sm font-semibold text-charcoal-900 mb-2">Activated Fuzzy Rules:</p>
                {fuzzyDetails.firedRules.length === 0 ? (
                  <p className="text-charcoal-700 text-center py-2">No rules fired significantly</p>
                ) : (
                  fuzzyDetails.firedRules.slice(0, 5).map((rule, index) => (
                    <div key={index} className="p-3 bg-white rounded-lg border border-border border-l-4 border-l-sage-600">
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                        <p className="text-sm font-semibold text-sage-800 min-w-0 break-words">{rule.name}</p>
                        <span className="text-xs text-charcoal-700 px-2 py-0.5 bg-cream-100 border border-border rounded shrink-0">
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

              {fuzzyDetails.firedRules.length > 5 && (
                <p className="mt-3 text-xs text-charcoal-700 text-center">
                  + {fuzzyDetails.firedRules.length - 5} more rules fired
                </p>
              )}
            </div>
          )}

          {/* Recommended Allocation Chart - Only show when there are warnings/errors */}
          {showMessage && messageType !== 'success' && (
            <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-cream-50 rounded-2xl border border-border">
              <h2 className="text-heading-md font-semibold text-charcoal-900 mb-4 text-center">
                Recommended Daily Time Allocation (Balanced Baseline)
              </h2>
              <div className="w-full max-w-xs mx-auto">
                <svg
                  viewBox="0 0 200 200"
                  className="block w-full h-auto"
                  role="img"
                  aria-label="Donut chart: 8 hours work, 8 hours personal, 8 hours sleep"
                >
                  <g transform="rotate(-90 100 100)">
                    {allocation.map((segment) => {
                      const length = (segment.hours / 24) * CIRCUMFERENCE;
                      const offset = allocationOffset;
                      allocationOffset += length;
                      return (
                        <circle
                          key={segment.label}
                          cx="100"
                          cy="100"
                          r="70"
                          fill="none"
                          stroke={segment.color}
                          strokeWidth="32"
                          strokeDasharray={`${length - 3} ${CIRCUMFERENCE - length + 3}`}
                          strokeDashoffset={-offset}
                        />
                      );
                    })}
                  </g>
                  <text x="100" y="98" textAnchor="middle" fontSize="22" fontWeight="700" fill="#23201c">24h</text>
                  <text x="100" y="118" textAnchor="middle" fontSize="11" fill="#5c5345">per day</text>
                </svg>
              </div>
              <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 text-sm text-charcoal-800">
                {allocation.map((segment) => (
                  <li key={segment.label} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} aria-hidden="true" />
                    {segment.label}: {segment.hours} hrs
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="card p-4 sm:p-6">
          <h2 className="text-heading-md font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
            <Brain className="h-5 w-5 text-sage-700 shrink-0" aria-hidden="true" />
            How Fuzzy Logic Analyzes Your Schedule
          </h2>
          <ul className="space-y-2 text-charcoal-800">
            <li>• <strong>Membership functions</strong> convert your hours into fuzzy sets (e.g., "high work", "adequate sleep")</li>
            <li>• <strong>Fuzzy rules</strong> (15 rules) evaluate combinations like "High work + Low sleep → High stress"</li>
            <li>• <strong>Inference engine</strong> combines all fired rules using min/max composition</li>
            <li>• <strong>Defuzzification</strong> (centroid method) produces crisp Balance/Stress scores (0-100)</li>
            <li>• These scores feed into the <strong>Genetic Algorithm</strong> for schedule optimization</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AskAI;
