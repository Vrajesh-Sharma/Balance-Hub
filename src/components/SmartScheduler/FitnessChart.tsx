import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FitnessChartProps {
  convergence: number[];
  className?: string;
}

export default function FitnessChart({ convergence, className = '' }: FitnessChartProps) {
  const data = convergence.map((value, index) => ({
    generation: index + 1,
    fitness: Math.round(value * 100) / 100,
  }));

  return (
    <div className={`bg-gray-800 p-6 rounded-xl ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Convergence Curve</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="generation" 
              stroke="#9ca3af" 
              fontSize={12}
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis 
              stroke="#9ca3af" 
              fontSize={12}
              tick={{ fill: '#9ca3af' }}
              tickFormatter={(value) => Math.round(value)}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#f3f4f6' }}
            />
            <Line
              type="monotone"
              dataKey="fitness"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: '#06b6d4' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-400">Initial</p>
          <p className="font-mono text-cyan-400">{data[0]?.fitness ?? 0}</p>
        </div>
        <div>
          <p className="text-gray-400">Best</p>
          <p className="font-mono text-green-400">{Math.max(...data.map(d => d.fitness), 0)}</p>
        </div>
        <div>
          <p className="text-gray-400">Generations</p>
          <p className="font-mono text-cyan-400">{data.length}</p>
        </div>
      </div>
    </div>
  );
}