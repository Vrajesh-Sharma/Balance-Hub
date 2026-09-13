import React from 'react';
import { ConstraintViolation } from '../../../soft-computing/types';

interface ComparisonRow {
  name: string;
  fitness: number;
  balanceScore: number;
  productivityScore: number;
  stressScore: number;
  violations: ConstraintViolation[];
}

interface ComparisonTableProps {
  rows: ComparisonRow[];
  className?: string;
}

const METRICS = [
  { key: 'fitness', label: 'Fitness', higher: true, color: '#06b6d4' },
  { key: 'balanceScore', label: 'Balance', higher: true, color: '#10b981' },
  { key: 'productivityScore', label: 'Productivity', higher: true, color: '#f59e0b' },
  { key: 'stressScore', label: 'Stress', higher: false, color: '#ef4444' },
  { key: 'violations', label: 'Violations', higher: false, color: '#f97316' },
];

export default function ComparisonTable({ rows, className = '' }: ComparisonTableProps) {
  if (rows.length === 0) {
    return (
      <div className={`bg-gray-800 p-6 rounded-xl ${className}`}>
        <p className="text-gray-400 text-center">No comparison data available</p>
      </div>
    );
  }

  const bestValues: Record<string, number> = {};
  METRICS.forEach(m => {
    const values = rows.map(r => r[m.key as keyof ComparisonRow] as number);
    bestValues[m.key] = m.higher ? Math.max(...values) : Math.min(...values);
  });

  return (
    <div className={`bg-gray-800 p-6 rounded-xl ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Baseline Comparison</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-3 font-medium text-gray-300">Method</th>
              {METRICS.map(m => (
                <th key={m.key} className="text-right p-3 font-medium text-gray-300">
                  {m.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.name} className={`border-b border-gray-700/50 ${rowIndex === 0 ? 'bg-cyan-500/10' : ''}`}>
                <td className="p-3 font-medium {rowIndex === 0 ? 'text-cyan-400' : 'text-white'}">
                  {row.name} {rowIndex === 0 && <span className="ml-2 text-xs bg-cyan-500 text-black px-1.5 py-0.5 rounded">Best</span>}
                </td>
                {METRICS.map(m => {
                  const value = row[m.key as keyof ComparisonRow];
                  const isBest = value === bestValues[m.key];
                  const displayValue = m.key === 'violations' 
                    ? (value as ConstraintViolation[]).length 
                    : (value as number).toFixed(1);
                  
                  return (
                    <td key={m.key} className="p-3 text-right">
                      <span className={`font-mono ${isBest ? 'font-bold' : ''} ${m.higher ? (isBest ? 'text-green-400' : 'text-gray-300') : (isBest ? 'text-green-400' : 'text-gray-300')}`}>
                        {displayValue}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Violation Details</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {rows.map((row, rowIndex) => (
            <div key={row.name} className="p-3 bg-gray-700 rounded-lg">
              <p className="font-medium text-sm {rowIndex === 0 ? 'text-cyan-400' : 'text-white'}">{row.name}</p>
              {row.violations.length === 0 ? (
                <p className="text-xs text-green-400 mt-1">No constraint violations</p>
              ) : (
                <ul className="mt-1 space-y-1 text-xs text-gray-300">
                  {row.violations.map((v, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: v.severity > 50 ? '#ef4444' : '#f59e0b' }}></span>
                      <span>{v.description} (severity: {v.severity})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}