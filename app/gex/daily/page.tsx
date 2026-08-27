"use client";

import { useEffect, useState } from 'react';
/*import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ReferenceLine,
  Legend, 
  LabelList
} from 'recharts';*/
import Box from '@mui/material/Box';
import { BarChart } from '@mui/x-charts/BarChart';
import { ChartsReferenceLine } from '@mui/x-charts';
import Typography from '@mui/material/Typography';

const apiUrlPrefix = "http://localhost:8080";

const _chartTextStyle = {
    fontSize: 12,
    fontWeight: 400,
    fontFamily: 'Roboto, Arial, helvetica, sans-serif'
};
const _textColor = {
    "& text": { fill: "#ffffff" }
};
 
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

    // should be in utility tsx file
    const convertToChartData = (data: any[]): any[] => { 
        // Need to match Call and Put option data to align to 
        const strikes = new Set();
        const strikeData: any[] = [];
        let strike, call, put;

        data.forEach(item => strikes.add(item.strikePrice));
        
        strikes.forEach(sp => {
            call = data.find(item => item.call && item.strikePrice === sp);
            put = data.find(item => item.put && item.strikePrice === sp);

            strike = { 
                strikePrice: sp, 
                callGex: call?.gex, 
                putGex: put?.gex, 
                absGex: Math.abs(call?.gex ?? 0) + Math.abs(put?.gex ?? 0),
                netGex: (call?.gex ?? 0) + (put?.gex ?? 0), 
                callVolume: call?.volume ?? 0,
                putVolume: put?.volume ?? 0, 
                callOpenInt: call?.openInterest ?? 0,
                putOpenInt: put?.openInterest ?? 0 
            };

            strikeData.push(strike);
            strike = undefined;
        });

        return strikeData;
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
                .then(data => { 
                    const convertedData = convertToChartData(data);
                    setChartData(convertedData as []);
                });
        }
    }, [selectedSnapshot]); 

    return (
    <>
        <header className="grid grid-cols-3">
            <div className="col-span-1 title font-bold">
                Option Gamma Exposure - Daily
            </div>
            <div className="col-span-2 text-right">
                <select value={selectedSymbol ?? ""} onChange={handleSymbolChange}>
                    <option key="" value="">-- SYMBOL --</option>
                    {symbols && symbols.map(item => (
                        <option key={item} value={item}>{item}</option> 
                    ))}
                </select>
                 &nbsp;
                <select value={selectedExpDate ?? ""} onChange={handleExpDateChange}>
                    <option key="" value="">-- EXP DATE --</option>
                    {expirations && expirations.map(item => (
                        <option key={item} value={item}>{item}</option>
                    ))}
                </select>
                &nbsp;
                <select value={selectedSnapshot ?? ""} onChange={handleSnapshotChange}>
                    <option key="" value="">-- SNAPSHOT --</option>
                    {snapshots && snapshots.map(item => (
                        <option key={item} value={item}>{getSnapshotDisplay(item)}</option>
                    ))}
                </select>
            </div>
        </header>
        <div className="chart-container">
            {/*<ResponsiveContainer>
                <BarChart data={chartData}>
                    <CartesianGrid 
                        strokeDasharray="3, 3" 
                        vertical={false} 
                    />
                    <XAxis 
                        dataKey="strikePrice"
                    />
                    <YAxis />
                    <Legend />
                    <ReferenceLine y={0} stroke="#999" strokeWidth={1.5} />
                    <Bar 
                        dataKey="callGex"
                        fill="#11d03e" 
                        label={false}
                    />
                    <Bar
                        dataKey="putGex"
                        fill="#e64640"
                        label={false}
                    />
                </BarChart>
            </ResponsiveContainer>*/}
            <Box sx={{ width: "100%", height: "80vh" }}>
                <Typography variant="h6" component="h2" sx={{ mb: 2, textAlign: 'center', fontWeight: 600, color: "#2ced0c" }}>
                    Gamma Exposure Distribution
                </Typography>
                <BarChart
                    dataset={chartData}
                    xAxis={[
                        { 
                            scaleType: "band", 
                            dataKey: "strikePrice",
                            label: "Strike Prices",
                            disableTicks: false,
                        }
                    ]}
                    yAxis={[{ width: 100 }]}
                    series={[
                        { 
                            dataKey: 'callGex',
                            label: 'Call GEX', 
                            valueFormatter: (value) => new Intl.NumberFormat('en-US').format(value ?? 0),
                            stack: 'strike' 
                        },
                        { 
                            dataKey: 'putGex',
                            label: 'Put GEX', 
                            valueFormatter: (value) => new Intl.NumberFormat('en-US').format(value ?? 0),
                            stack: 'strike' 
                        }
                    ]}
                    grid={{ horizontal: true }}
                    sx={{
                        "& text, & tspan, & .MuiChartsAxis-tickLabel, & .MuiChartsAxis-label": {
                            fill: "#ffffff !important"
                        },
                        "& .MuiChartsAxis-left .MuiChartsAxis-tick, & .MuiChartsAxis-line": {
                            stroke: "#999999"
                        },
                        "& .MuiChartsGrid-horizontalLine": {
                            stroke: "#cccccc !important", 
                            strokeDasharray: "2 2",
                            strokeWidth: 1.0, 
                            opacity: 0.4
                        },
                        "& .MuiChartsLegend-label": {
                            color: "#cccccc !important"
                        }
                    }}
                />
            </Box>
        </div>
    </>
    );
}
