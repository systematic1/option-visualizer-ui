"use client";

import { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ReferenceLine,
  Legend 
} from 'recharts';
 
export default function GexDaily() {

    const [chartData, setChartData] = useState([
        { strikePrice: 7750, callGex: 25, putGex: 0 },
        { strikePrice: 7755, callGex: 31, putGex: -1 },
        { strikePrice: 7760, callGex: 18, putGex: -2 }
    ]);
  
    return (
    <>
        <header className="grid grid-cols-3">
            <div className="col-span-1">
                <h2>Option Gamma Exposure - Daily</h2>
            </div>
            <div className="col-span-2 text-right">
                [Symbol Selector] &nbsp;
                [Expiration Selector]
            </div>
        </header>
        <div className="chart-container">
            <ResponsiveContainer>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3, 3" vertical={false} />
                    <XAxis 
                        dataKey="strikePrice"
                        tickLine={false}
                        dy={10}
                    />
                    <YAxis />
                    <Legend />
                    <ReferenceLine y={0} stroke="#999" strokeWidth={1.5} />
                    <Bar 
                        dataKey="callGex" 
                        fill="#10b981" 
                        radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                        dataKey="putGex" 
                        fill="#ef4444" 
                        radius={[0, 0, 4, 4]} 
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </>
    );
}