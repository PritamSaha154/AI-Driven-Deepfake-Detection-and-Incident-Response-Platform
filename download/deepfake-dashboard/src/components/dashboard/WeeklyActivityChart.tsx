'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { weeklyActivity } from '@/lib/mock-data';

export function WeeklyActivityChart() {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800">Weekly Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="day" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                iconType="circle"
              />
              <Line 
                type="monotone" 
                dataKey="imagesAnalyzed" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                name="Images Analyzed"
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="deepfakesDetected" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                name="Deepfakes Detected"
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
