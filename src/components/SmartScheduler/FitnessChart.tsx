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
    <div className={`card p-4 sm:p-6 min-w-0 ${className}`}>
      <h3 className="text-heading-sm font-semibold text-charcoal-900 mb-4">Convergence Curve</h3>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 12, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6e2da" />
            <XAxis
              dataKey="generation"
              stroke="#8d826f"
              fontSize={12}
              tick={{ fill: '#5c5345' }}
              minTickGap={24}
            />
            <YAxis
              stroke="#8d826f"
              fontSize={12}
              tick={{ fill: '#5c5345' }}
              width={40}
              tickFormatter={(value : number) => String(Math.round(value))}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1cbc0', borderRadius: '12px', color: '#23201c' }}
              labelStyle={{ color: '#23201c', fontWeight: 600 }}
              itemStyle={{ color: '#413a31' }}
            />
            <Line
              type="monotone"
              dataKey="fitness"
              stroke="#437066"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: '#437066' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-charcoal-700">Initial</p>
          <p className="font-mono font-semibold text-sage-800">{data[0]?.fitness ?? 0}</p>
        </div>
        <div>
          <p className="text-charcoal-700">Best</p>
          <p className="font-mono font-semibold text-emerald-800">{Math.max(...data.map(d => d.fitness), 0)}</p>
        </div>
        <div>
          <p className="text-charcoal-700">Generations</p>
          <p className="font-mono font-semibold text-sage-800">{data.length}</p>
        </div>
      </div>
    </div>
  );
}
