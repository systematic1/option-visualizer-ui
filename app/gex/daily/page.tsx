"use client";

import { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ReferenceLine,
  Legend, 
  LabelList
} from 'recharts';

const apiUrlPrefix = "http://localhost:8080";
 
export default function GexDaily() {

    const [symbols, setSymbols] = useState([]);
    const [expirations, setExpirations] = useState([]);
    const [snapshots, setSnapshots] = useState([]);
    const [selectedSymbol, setSelectedSymbol] = useState(null);
    const [selectedExpDate, setSelectedExpDate] = useState(null);
    const [selectedSnapshot, setSelectedSnapshot] = useState(null);

    const [chartData, setChartData] = useState([]);

    const handleSymbolChange = (event: any) => {
        setSelectedSymbol(event.target.value);
    };

    const handleExpDateChange = (event: any) => {
        setSelectedExpDate(event.target.value);
    }

    const handleSnapshotChange = (event: any) => {
        setSelectedSnapshot(event.target.value);
    }

    const getSnapshotDisplay = (item: any) => {
        const [d, t] = item.split('T');
        const [hms, ms] = t.split('.');
        return hms;
    }

    const convertToChartData = (data: any[]): any[] => {
        // Need to match Call and Put option data to align to 
        const strikes = new Set();
        data.forEach(item => strikes.add(item.strikePrice));
        
        const strikeData = [];
        let strike, call, put;
        strikes.forEach(sp => {
            call = data.find(item => item.isCall() && item.strikePrice === sp);
            put = data.find(item => item.isPut() && item.strikePrice === sp);

            strike = { 
                strikePrice: sp, 
                callGex: call?.gex, 
                putGex: put?.gex, 
                absGex: Math.abs((call?.gex ?? 0) + (put?.gex ?? 0)), 
                volume: 0, 
                openInt: 0 
            };
            strikeData.push(strike);
            strike = undefined;
        });
    }
  
    useEffect(() => {
        fetch(`${apiUrlPrefix}/Metadata/Symbols`)
            .then(response => response.json())
            .then(data => {
                setSymbols(data);
                setExpirations([]);
            });
    }, []);
    useEffect(() => {
        if (selectedSymbol) { 
            fetch(encodeURI(`${apiUrlPrefix}/Metadata/Symbol/${selectedSymbol}/Expirations`))
                .then(response => response.json())
                .then(data => setExpirations(data));
        }
    }, [selectedSymbol]);
    useEffect(() => {
        if (selectedSymbol && selectedExpDate) {
            fetch(encodeURI(`${apiUrlPrefix}/Metadata/Symbol/${selectedSymbol}/Snapshots?expiration=${selectedExpDate}`))
                .then(response => response.json())
                .then(data => setSnapshots(data));
        }
    }, [selectedExpDate]);
    useEffect(() => { 
        if (selectedExpDate && selectedSnapshot) {
            fetch(encodeURI(`${apiUrlPrefix}/OptionChain/Data/BySnapshot?symbol=${selectedSymbol}&expiration=${selectedExpDate}&dateTime=${selectedSnapshot}`))
                .then(response => response.json())
                .then(data => setChartData(data));
        }
    }, [selectedSnapshot]); 

    return (
    <>
        <header className="grid grid-cols-3">
            <div className="col-span-1 title font-bold">
                Option Gamma Exposure - Daily
            </div>
            <div className="col-span-2 text-right">
                <select value={selectedSymbol ?? ''} onChange={handleSymbolChange}>
                    <option key="" value="">---- SYMBOL ----</option>
                    {symbols && symbols.map(item => (
                        <option key={item} value={item}>{item}</option> 
                    ))}
                </select>
                 &nbsp;
                <select value={selectedExpDate ?? ''} onChange={handleExpDateChange}>
                    <option key="" value="">---- EXP DATE ----</option>
                    {expirations && expirations.map(item => (
                        <option key={item} value={item}>{item}</option>
                    ))}
                </select>
                &nbsp;
                <select value={selectedSnapshot ?? ''} onChange={handleSnapshotChange}>
                    <option key="" value="">-- SNAPSHOT TIME --</option>
                    {snapshots && snapshots.map(item => (
                        <option key={item} value={item}>{getSnapshotDisplay(item)}</option>
                    ))}
                </select>
            </div>
        </header>
        <div className="chart-container">
            <ResponsiveContainer>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3, 3" vertical={false} />
                    <XAxis 
                        dataKey="strikePrice"
                    />
                    <YAxis />
                    <Legend />
                    <ReferenceLine y={0} stroke="#999" strokeWidth={1.5} />
                    <Bar 
                        dataKey="gex"
                        fill="#10b981" 
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </>
    );
}