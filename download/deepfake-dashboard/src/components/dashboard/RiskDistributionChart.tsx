'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { riskDistribution } from '@/lib/mock-data';

const COLORS = {
  low: '#22c55e',
  medium: '#f97316',
  high: '#ef4444',
  critical: '#991b1b',
};

const data = [
  { name: 'Low', value: riskDistribution.low, color: COLORS.low },
  { name: 'Medium', value: riskDistribution.medium, color: COLORS.medium },
  { name: 'High', value: riskDistribution.high, color: COLORS.high },
  { name: 'Critical', value: riskDistribution.critical, color: COLORS.critical },
];

export function RiskDistributionChart() {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800">Risk Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value} cases`, 'Count']}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-gray-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
