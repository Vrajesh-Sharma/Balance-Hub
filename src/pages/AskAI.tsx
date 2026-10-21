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

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header Section */}
        <div className="mb-6 flex items-center justify-center gap-3 text-center sm:mb-8">
          <Brain className="h-8 w-8 shrink-0 text-teal-700 sm:h-10 sm:w-10" />
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-4xl">Schedule Analysis</h1>
        </div>

        {/* Data Source Toggle */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <label className="flex cursor-pointer items-center gap-2 text-stone-700">
            <input
              type="checkbox"
              checked={useTestData}
              onChange={(e) => handleUseTestDataChange(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300 text-teal-700 focus:ring-teal-600"
            />
            <span className="text-sm">Use test data (synthetic)</span>
          </label>
          {hasRealData && !useTestData && (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-700">
              <CheckCircle size={12} />
              Real user data loaded
            </span>
          )}
          {!hasRealData && !useTestData && (
            <span className="flex items-center gap-1 text-xs font-medium text-amber-700">
              <AlertCircle size={12} />
              No real data - using defaults
            </span>
          )}
        </div>

        {/* Main Content Card */}
        <div className="mb-8 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            {scheduleItems.map((item, index) => (
              <div key={item.activity} className="space-y-2">
                <label className="block text-sm font-semibold text-stone-700">
                  {item.activity}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={item.hours}
                    onChange={(e) => handleHoursChange(index, Number(e.target.value))}
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 pr-14 text-stone-900 placeholder:text-stone-400 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                    placeholder="Hours"
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-stone-500">
                    hrs
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Analyze Button */}
          <div className="flex justify-center">
            <button
              onClick={handleAnalyzeClick}
              disabled={isAnalyzing}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Analyze with Fuzzy Logic
                </>
              )}
            </button>
          </div>

          {/* Analysis Message */}
          {showMessage && message && (
            <div className={`mt-8 p-4 rounded-lg text-center font-medium ${
              messageType === 'success' 
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                : messageType === 'warning'
                  ? 'border border-amber-200 bg-amber-50 text-amber-900'
                  : 'border border-rose-200 bg-rose-50 text-rose-800'
            }`}>
              {message}
            </div>
          )}

          {/* Fuzzy Logic Details */}
          {fuzzyDetails && (
            <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-4 shadow-sm sm:p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-900 sm:text-xl">
                <Brain className="h-5 w-5 text-teal-700" />
                Fuzzy Logic Analysis Details
              </h3>
              
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-stone-200 bg-white p-4">
                  <p className="text-sm text-stone-600">Balance Score</p>
                  <p className="text-2xl font-bold text-emerald-700 sm:text-3xl">{fuzzyDetails.balanceScore.toFixed(1)} / 100</p>
                </div>
                <div className="rounded-xl border border-stone-200 bg-white p-4">
                  <p className="text-sm text-stone-600">Stress Score</p>
                  <p className="text-2xl font-bold text-rose-700 sm:text-3xl">{fuzzyDetails.stressScore.toFixed(1)} / 100</p>
                </div>
              </div>

              <div className="max-h-64 space-y-3 overflow-y-auto">
                <p className="mb-2 text-sm font-semibold text-stone-700">Activated Fuzzy Rules:</p>
                {fuzzyDetails.firedRules.length === 0 ? (
                  <p className="py-2 text-center text-stone-600">No rules fired significantly</p>
                ) : (
                  fuzzyDetails.firedRules.slice(0, 5).map((rule, index) => (
                    <div key={index} className="rounded-xl border border-stone-200 border-l-4 border-l-teal-600 bg-white p-3">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-medium text-stone-800">{rule.name}</p>
                        <span className="rounded-md bg-stone-100 px-2 py-1 text-xs text-stone-600">
                          Strength: {rule.strength.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-600">
                        <span>→ Balance: <span className="font-medium text-emerald-700">{rule.consequence.balance}</span></span>
                        <span>→ Stress: <span className="font-medium text-rose-700">{rule.consequence.stress}</span></span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {fuzzyDetails.firedRules.length > 5 && (
                <p className="mt-3 text-center text-xs text-stone-500">
                  + {fuzzyDetails.firedRules.length - 5} more rules fired
                </p>
              )}
            </div>
          )}

          {/* Recommended Allocation Chart - Only show when there are warnings/errors */}
          {showMessage && messageType !== 'success' && (
            <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-4 shadow-sm sm:p-6">
              <h3 className="mb-6 text-center text-lg font-semibold text-stone-900 sm:text-xl">
                Recommended Daily Time Allocation (Balanced Baseline)
              </h3>
              <div className="flex w-full items-center justify-center py-2">
                <div className="w-full max-w-xs">
                  <svg viewBox="0 0 200 200" role="img" aria-label="Illustrative daily time allocation: 8 hours work, 8 hours personal time, 8 hours sleep" className="mx-auto block h-auto w-full max-w-[240px]">
                    <circle 
                      cx="100" cy="100" r="80" 
                      stroke="#22D3EE" strokeWidth="40" strokeLinecap="butt" fill="none" 
                      strokeDasharray="502.65" strokeDashoffset="502.65"
                      className="transition-all duration-1000"
                      transform="rotate(-90 100 100)"
                      style={{ strokeDasharray: `${502.65 * (8/24)} ${502.65}`, strokeDashoffset: 0 }}
                    />
                    <circle 
                      cx="100" cy="100" r="80" 
                      stroke="#F472B6" strokeWidth="40" strokeLinecap="butt" fill="none" 
                      strokeDasharray="502.65" strokeDashoffset="0"
                      className="transition-all duration-1000"
                      transform="rotate(30 100 100)"
                      style={{ strokeDasharray: `${502.65 * (8/24)} ${502.65}`, strokeDashoffset: 0 }}
                    />
                    <circle 
                      cx="100" cy="100" r="80" 
                      stroke="#A78BFA" strokeWidth="40" strokeLinecap="butt" fill="none" 
                      strokeDasharray="502.65" strokeDashoffset="0"
                      className="transition-all duration-1000"
                      transform="rotate(150 100 100)"
                      style={{ strokeDasharray: `${502.65 * (8/24)} ${502.65}`, strokeDashoffset: 0 }}
                    />
                  </svg>
                  <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-stone-700 sm:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: '#22D3EE' }}></span>
                      Work: 8 hrs
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: '#F472B6' }}></span>
                      Personal: 8 hrs
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: '#A78BFA' }}></span>
                      Sleep: 8 hrs
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-900 sm:text-xl">
            <Brain className="h-5 w-5 text-teal-700" />
            How Fuzzy Logic Analyzes Your Schedule
          </h2>
          <ul className="space-y-3 text-sm leading-6 text-stone-700 sm:text-base">
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