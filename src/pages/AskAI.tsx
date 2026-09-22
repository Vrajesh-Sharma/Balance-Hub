import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { evaluateBalance, explainFuzzy } from '../soft-computing/fuzzy';
import { aggregateUserProfile, getDefaultPreferences, schedulesToCurrentFormat } from '../soft-computing/data';
import { mockApi, smartSchedulerData } from '../lib/dummyData';
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
      const ruleExplanations = explainFuzzy(fuzzyInputs);

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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-center mb-8">
          <Brain className="h-10 w-10 text-cyan-400 mr-4" />
          <h1 className="text-4xl font-bold text-white">Schedule Analysis</h1>
        </div>

        {/* Data Source Toggle */}
        <div className="mb-6 flex items-center justify-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useTestData}
              onChange={(e) => handleUseTestDataChange(e.target.checked)}
              className="w-4 h-4 text-cyan-500 border-gray-600 rounded focus:ring-cyan-500"
            />
            <span className="text-sm">Use test data (synthetic)</span>
          </label>
          {hasRealData && !useTestData && (
            <span className="flex items-center gap-1 text-xs text-green-400">
              <CheckCircle size={12} />
              Real user data loaded
            </span>
          )}
          {!hasRealData && !useTestData && (
            <span className="flex items-center gap-1 text-xs text-yellow-400">
              <AlertCircle size={12} />
              No real data - using defaults
            </span>
          )}
        </div>

        {/* Main Content Card */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 mb-8">
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {scheduleItems.map((item, index) => (
              <div key={item.activity} className="space-y-2">
                <label className="block text-cyan-400 text-sm font-semibold">
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
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                    placeholder="Hours"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
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
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 transform hover:scale-105 disabled:transform-none"
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
                ? 'bg-green-900/50 text-green-400 border border-green-400'
                : messageType === 'warning'
                  ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-400'
                  : 'bg-red-900/50 text-red-400 border border-red-400'
            }`}>
              {message}
            </div>
          )}

          {/* Fuzzy Logic Details */}
          {fuzzyDetails && (
            <div className="mt-8 p-6 bg-gray-800 rounded-xl shadow-xl border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-cyan-400" />
                Fuzzy Logic Analysis Details
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Balance Score</p>
                  <p className="text-3xl font-bold text-green-400">{fuzzyDetails.balanceScore.toFixed(1)} / 100</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Stress Score</p>
                  <p className="text-3xl font-bold text-red-400">{fuzzyDetails.stressScore.toFixed(1)} / 100</p>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                <p className="text-sm font-medium text-cyan-300 mb-2">Activated Fuzzy Rules:</p>
                {fuzzyDetails.firedRules.length === 0 ? (
                  <p className="text-gray-400 text-center py-2">No rules fired significantly</p>
                ) : (
                  fuzzyDetails.firedRules.slice(0, 5).map((rule, index) => (
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

              {fuzzyDetails.firedRules.length > 5 && (
                <p className="mt-3 text-xs text-gray-500 text-center">
                  + {fuzzyDetails.firedRules.length - 5} more rules fired
                </p>
              )}
            </div>
          )}

          {/* Recommended Allocation Chart - Only show when there are warnings/errors */}
          {showMessage && messageType !== 'success' && (
            <div className="mt-8 p-6 bg-gray-800 rounded-xl shadow-xl border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-6 text-center">
                Recommended Daily Time Allocation (Balanced Baseline)
              </h3>
              <div className="h-[300px] w-full flex items-center justify-center">
                <div className="w-full max-w-md">
                  <svg viewBox="0 0 200 200" className="mx-auto">
                    <circle 
                      cx="100" cy="100" r="80" 
                      stroke="#22D3EE" strokeWidth="40" fill="none" 
                      strokeDasharray="502.65" strokeDashoffset="502.65"
                      className="transition-all duration-1000"
                      style={{ strokeDashoffset: 502.65 * (1 - 8/24) }}
                    />
                    <circle 
                      cx="100" cy="100" r="80" 
                      stroke="#F472B6" strokeWidth="40" fill="none" 
                      strokeDasharray="502.65" strokeDashoffset="0"
                      className="transition-all duration-1000"
                      style={{ strokeDashoffset: 502.65 * (1 - 8/24) }}
                    />
                    <circle 
                      cx="100" cy="100" r="80" 
                      stroke="#A78BFA" strokeWidth="40" fill="none" 
                      strokeDasharray="502.65" strokeDashoffset="0"
                      className="transition-all duration-1000"
                      style={{ strokeDashoffset: 502.65 * (1 - 16/24) }}
                    />
                  </svg>
                  <div className="flex justify-center gap-6 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22D3EE' }}></span>
                      Work: 8 hrs
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F472B6' }}></span>
                      Personal: 8 hrs
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#A78BFA' }}></span>
                      Sleep: 8 hrs
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Brain className="h-5 w-5 text-cyan-400" />
            How Fuzzy Logic Analyzes Your Schedule
          </h2>
          <ul className="space-y-2 text-gray-300">
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