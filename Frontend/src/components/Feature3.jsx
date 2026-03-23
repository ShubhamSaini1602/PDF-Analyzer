
const stats = [
    {
        value: "< 50ms",
        label: "Execution Latency",
        desc: "Optimized Docker containers for instant feedback.",
        color: "#3b82f6" // Blue
    },
    {
        value: "1,500+",
        label: "Hidden Test Cases",
        desc: "Rigorous edge-case validation across 100+ problems.",
        color: "#8b5cf6" // Purple
    },
    {
        value: "99%",
        label: "System Uptime",
        desc: "Always live, always ready for your code.",
        color: "#10b981" // Emerald
    }
];

function Feature3(){

    return (
        <div className="stats-section">
            {/* Header Text */}
            <div className="stats-header">
                <div className="badge-pill">
                    <span className="badge-dot"></span>
                    System Metrics
                </div>
                <h2 className="stats-title">Built for <span className="highlight-text-mera">Scale & Speed</span></h2>
                <p className="stats-desc">
                    Stop worrying about timeouts and server crashes. Our infrastructure handles 
                    millions of requests so you can focus on one thing: <strong>The Logic.</strong>
                </p>
            </div>

            {/* The Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className={index===1 ? "stat-card alag-card" : "stat-card"}>
                        <h3 className="stat-value" style={{ textShadow: `0 0 30px ${stat.color}60` }}>
                            {stat.value}
                        </h3>
                         <p className="stat-label" style={{ color: stat.color }}>{stat.label}</p>
                        <div className="stat-line" style={{ background: stat.color }}></div>
                        <p className="stat-info">{stat.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Feature3;