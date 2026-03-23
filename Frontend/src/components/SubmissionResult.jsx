import { useState, useMemo } from 'react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    ReferenceLine 
} from 'recharts';


const generateMonitorData = (totalValue, type) => {
    const data = [];
    const steps = 30;
    let currentValue = 0;
    const seed = (parseFloat(totalValue) * 10) % 10;
    
    const baseUsage = type === 'runtime' ? 20 : 60;
    const volatility = type === 'runtime' ? 25 : 3;
    const spikeAmount = type === 'runtime' ? 50 : 10;

    for (let i = 0; i <= steps; i++) {
        const phase = i / steps;

        if (i === 0 || i === steps) {
            currentValue = 0;
        } 
        else {
            let baseCurve = Math.sin(phase * Math.PI) * spikeAmount;
            let jitter = (Math.random() - 0.5) * (volatility + seed);
            currentValue = baseUsage + baseCurve + jitter;
            
            if (type === 'memory' && phase > 0.15 && phase < 0.9) {
                currentValue = baseUsage + seed + jitter;
            }
        }
        
        data.push({
            time: i,
            usage: Math.max(5, Math.min(95, currentValue)), 
        });
    }
    return data;
};

// Custom Tooltip
const CustomTooltip = ({ active, payload, label, type }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip" style={{
                backgroundColor: '#0f0f0f', 
                border: '1px solid #333', 
                padding: '8px 12px', 
                borderRadius: '8px',
                fontFamily: '"Figtree", sans-serif',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
            }}>
                <p style={{color: '#aaa', fontSize: '12px', margin: 0}}>Step: {label}</p>
                <p style={{color: '#fff', fontSize: '14px', fontWeight: '600', margin: 0}}>
                    {type === 'runtime' ? 'CPU Load' : 'Allocation'}: {payload[0].value.toFixed(1)}%
                </p>
            </div>
        );
    }
    return null;
};

const SubmissionResult = ({ result }) => {
    const [activeGraph, setActiveGraph] = useState('runtime');
    const isAccepted = result.status === "Accepted";

    // useMemo: Only run this heavy math when the graph type or result changes.
    const { graphData, stats } = useMemo(() => {
        // Get the number (e.g., "56" from "56ms")
        const val = activeGraph === 'runtime' ? parseFloat(result.runtime) : parseFloat(result.memory);
        
        // data will be an array of objects
        const data = generateMonitorData(val, activeGraph);
        // data.map returns an array of usage values and we copy that array from index 1 to n-1,
        // skipping the first and last entries since both are always 0% and not useful.
        const usageValues = data.map(d => d.usage).slice(1, data.length-1);
        const peak = Math.max(...usageValues);
        let sum = 0;
        for(let value of usageValues){
            sum += value;
        }
        const avg = sum/usageValues.length;
        
        return { 
            graphData: data, 
            stats: { peak: peak.toFixed(1), avg: avg.toFixed(1) } 
        };
    }, [activeGraph, result]);

    // ===========================================
    // --- RENDER FOR ERROR STATE ---
    // ===========================================
    if (!isAccepted) {
        return (
            <div className="submission-result-container">
                {/* 1. Error Header */}
                <div className="result-header">
                    <div className="result-icon-box error">
                        <i className="ri-close-circle-fill"></i>
                    </div>
                    <div className="result-title-group">
                        <h2 className="error-text">{result.status}</h2>
                        <p className="result-meta">
                            {result.testCasesPassed || 0} / {result.testCasesTotal} test cases passed
                        </p>
                    </div>
                </div>
                
                {/* 2. Failing Input (Full Width) */}
                {result.input && (
                    <div className="result-card error-card">
                        <div className="card-label">Input</div>
                        <pre className="error-io-content">{result.input}</pre>
                    </div>
                )}

                {/* 3. Output Comparison (Grid Layout) */}
                {(result.expectedOutput || result.stdout) && (
                    <div className="result-metrics-grid">
                        <div className="result-card error-card">
                            <div className="card-label" style={{color: 'var(--brand-green)'}}>
                                Expected Output
                            </div>
                            <pre className="error-io-content">{result.expectedOutput}</pre>
                        </div>
                        <div className="result-card error-card">
                            <div className="card-label" style={{color: 'var(--brand-red)'}}>
                                Your Output
                            </div>
                            <pre className="error-io-content">{result.stdout}</pre>
                        </div>
                    </div>
                )}

                {/* 4. Compiler/Runtime Error Message */}
                {result.errorMessage && (
                    <div className="error-console">
                        <div className="card-label" style={{color: '#ff8a8a', marginBottom: '8px'}}>Error Message</div>
                        <pre className="error-io-content" style={{color: '#ff8a8a'}}>{result.errorMessage}</pre>
                    </div>
                )}
            </div>
        );
    }

    // ===========================================
    // --- RENDER FOR SUCCESS STATE ---
    // ===========================================
    return (
        <div className="submission-result-container">
            <div className="result-header">
                <div className="result-icon-box success">
                    <i className="ri-trophy-fill"></i>
                </div>
                <div className="result-title-group">
                    <h2 className="success-text">Accepted</h2>
                    <p className="result-meta">
                        Passed {result.testCasesPassed}/{result.testCasesTotal} test cases successfully
                    </p>
                </div>
            </div>

            <div className="result-metrics-grid">
                <div 
                    className={`result-card ${activeGraph === 'runtime' ? 'active' : ''}`}
                    onClick={() => setActiveGraph('runtime')}
                >
                    <div className="card-label"><i className="ri-timer-flash-line"></i> Runtime</div>
                    <div>
                        <span className="card-value">{result.runtime}</span>
                        <span className="card-unit">ms</span>
                    </div>
                </div>

                <div 
                    className={`result-card ${activeGraph === 'memory' ? 'active' : ''}`}
                    onClick={() => setActiveGraph('memory')}
                >
                    <div className="card-label"><i className="ri-cpu-line"></i> Memory</div>
                    <div>
                        <span className="card-value">{result.memory}</span>
                        <span className="card-unit">KB</span>
                    </div>
                </div>
            </div>

            <div className="monitor-graph-container">
                <div className="monitor-header">
                    <div className="monitor-title">
                        {activeGraph === 'runtime' ? 'CPU Execution Flow' : 'Memory Allocation'}
                    </div>
                    <div className="live-indicator2"></div>
                </div>
                <div style={{ width: '100%', height: 180 }}>
                    <ResponsiveContainer>
                        <AreaChart data={graphData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={activeGraph === 'runtime' ? '#007acc' : '#28C244'} stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor={activeGraph === 'runtime' ? '#007acc' : '#28C244'} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                            <XAxis dataKey="time" hide />
                            <YAxis hide domain={[0, 100]} />
                            <Tooltip content={<CustomTooltip type={activeGraph} />} cursor={{ stroke: '#555', strokeWidth: 1 }} />
                            <ReferenceLine 
                                y={stats.avg} 
                                label={{ value: "Avg", position: 'insideLeft', fill: '#888', fontSize: 10, dy: -6 }} 
                                stroke="#888" 
                                strokeDasharray="4 4" 
                            />
                            <Area 
                                type="monotone" 
                                dataKey="usage" 
                                stroke={activeGraph === 'runtime' ? '#007acc' : '#28C244'} 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorUsage)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="graph-stats-footer">
                    <div><span>Avg. Load</span><strong>{stats.avg}%</strong></div>
                    <div><span>Peak Load</span><strong>{stats.peak}%</strong></div>
                </div>
            </div>
        </div>
    );
};

export default SubmissionResult;


