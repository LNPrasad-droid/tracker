export default function LionLogo({ className = 'w-24 h-24', animated = true }) {
  // Pre-calculate concentric ring dots coordinates
  const outerDotsCount = 24;
  const outerRadius = 40;
  const outerDots = Array.from({ length: outerDotsCount }).map((_, i) => {
    const angle = (i * 2 * Math.PI) / outerDotsCount - Math.PI / 2;
    return {
      x: 50 + outerRadius * Math.cos(angle),
      y: 50 + outerRadius * Math.sin(angle),
    };
  });

  const innerDotsCount = 18;
  const innerRadius = 26;
  const innerDots = Array.from({ length: innerDotsCount }).map((_, i) => {
    const angle = (i * 2 * Math.PI) / innerDotsCount - Math.PI / 2;
    return {
      x: 50 + innerRadius * Math.cos(angle),
      y: 50 + innerRadius * Math.sin(angle),
    };
  });

  return (
    <div className={`relative flex items-center justify-center ${className}`} id="lion-logo-container">
      {/* Outer ambient glow circles */}
      <div className={`absolute inset-0 rounded-full bg-[#1e2336]/40 blur-xl ${animated ? 'animate-pulse' : ''}`} style={{ animationDuration: '4s' }} />
      
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Deep dark navy background circle matching user logo image */}
        <circle cx="50" cy="50" r="48" fill="#13141f" stroke="#1f2336" strokeWidth="1" />
        
        {/* Radial faint web connector lines */}
        <g stroke="rgba(34, 211, 238, 0.05)" strokeWidth="0.5">
          {outerDots.map((dot, i) => {
            // Find nearest inner dot to draw connection
            const innerDot = innerDots[i % innerDotsCount];
            return (
              <g key={`web-${i}`}>
                <line x1="50" y1="50" x2={dot.x} y2={dot.y} />
                <line x1={dot.x} y1={dot.y} x2={innerDot.x} y2={innerDot.y} />
              </g>
            );
          })}
        </g>

        {/* Constellation web lines between adjacent outer dots */}
        <g stroke="rgba(34, 211, 238, 0.12)" strokeWidth="0.6">
          {outerDots.map((dot, i) => {
            const nextDot = outerDots[(i + 1) % outerDotsCount];
            return (
              <line key={`outer-edge-${i}`} x1={dot.x} y1={dot.y} x2={nextDot.x} y2={nextDot.y} />
            );
          })}
        </g>

        {/* Constellation web lines between adjacent inner dots */}
        <g stroke="rgba(255, 255, 255, 0.08)" strokeWidth="0.5">
          {innerDots.map((dot, i) => {
            const nextDot = innerDots[(i + 1) % innerDotsCount];
            return (
              <line key={`inner-edge-${i}`} x1={dot.x} y1={dot.y} x2={nextDot.x} y2={nextDot.y} />
            );
          })}
        </g>

        {/* Central Geometric Cyber Lion Face */}
        <g id="cyber-lion-face" stroke="currentColor" className="text-slate-400" strokeWidth="0.8">
          {/* Main shield forehead lines */}
          <polygon points="50,32 58,40 50,50 42,40" stroke="rgba(148, 163, 184, 0.4)" fill="rgba(148, 163, 184, 0.03)" />
          
          {/* Nose & Snout structure */}
          <polygon points="50,50 54,58 50,62 46,58" stroke="rgba(34, 211, 238, 0.5)" fill="rgba(34, 211, 238, 0.05)" />
          
          {/* Cheeks & Jaw */}
          <polygon points="58,40 64,50 54,58" stroke="rgba(100, 116, 139, 0.4)" />
          <polygon points="42,40 36,50 46,58" stroke="rgba(100, 116, 139, 0.4)" />
          
          {/* Chin */}
          <polygon points="50,62 53,68 50,71 47,68" stroke="rgba(100, 116, 139, 0.3)" />

          {/* Crown-like mane extensions */}
          <line x1="50" y1="32" x2="50" y2="28" stroke="rgba(34, 211, 238, 0.4)" />
          <line x1="58" y1="40" x2="62" y2="36" stroke="rgba(34, 211, 238, 0.3)" />
          <line x1="42" y1="40" x2="38" y2="36" stroke="rgba(34, 211, 238, 0.3)" />
          <line x1="64" y1="50" x2="68" y2="50" stroke="rgba(34, 211, 238, 0.2)" />
          <line x1="36" y1="50" x2="32" y2="50" stroke="rgba(34, 211, 238, 0.2)" />
        </g>

        {/* Concentric Dots Rings */}
        
        {/* Inner white/silver dots ring */}
        <g id="inner-dots">
          {innerDots.map((dot, i) => (
            <circle
              key={`inner-dot-${i}`}
              cx={dot.x}
              cy={dot.y}
              r="0.8"
              fill="#94a3b8"
              opacity="0.85"
            />
          ))}
        </g>

        {/* Outer glowing cyan/turquoise dots ring */}
        <g id="outer-dots">
          {outerDots.map((dot, i) => (
            <g key={`outer-dot-${i}`}>
              <circle
                cx={dot.x}
                cy={dot.y}
                r={1.2}
                fill="#14b8a6"
                className={animated && i % 3 === 0 ? 'animate-pulse' : ''}
                style={{ animationDuration: '2s' }}
              />
              <circle
                cx={dot.x}
                cy={dot.y}
                r="3"
                fill="#14b8a6"
                opacity="0.15"
              />
            </g>
          ))}
        </g>

        {/* Lion Eyes - Highly intense glowing blue/cyan nodes */}
        <g id="glowing-eyes">
          {/* Left Eye */}
          <circle cx="46" cy="44" r="1.2" fill="#00f0ff" className="animate-pulse" />
          <circle cx="46" cy="44" r="2.5" fill="#00f0ff" opacity="0.4" />
          
          {/* Right Eye */}
          <circle cx="54" cy="44" r="1.2" fill="#00f0ff" className="animate-pulse" />
          <circle cx="54" cy="44" r="2.5" fill="#00f0ff" opacity="0.4" />
        </g>

        {/* Central Core mind node */}
        <circle cx="50" cy="50" r="1.5" fill="#00f0ff" />
        <circle cx="50" cy="50" r="3" fill="#00f0ff" opacity="0.2" className="animate-ping" style={{ animationDuration: '3s' }} />
      </svg>
    </div>
  );
}
