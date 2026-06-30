import { useEffect, useState } from 'react';
import LionLogo from './LionLogo';

interface SplashScreenProps {
  onComplete: () => void;
}

const BOOT_LOGS = [
  'INITIALIZING TRACKER NEURAL CORE...',
  'RESOLVING RELATIONAL INDEX SCHEMAS...',
  'CALIBRATING INTERACTIVE HUD CHANNELS...',
  'SYNCING LOCAL DATABASE DRIVERS...',
  'COMPILING STUDY ANALYTICS MODEL...',
  'OPTIMIZING GLASS-HUD RENDERING...',
  'ESTABLISHING SECURE CONNECTIONS...',
  'TRACKER ENGINE v2.6 ACTIVE'
];

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentLog, setCurrentLog] = useState(BOOT_LOGS[0]);
  const [fadeAway, setFadeAway] = useState(false);

  useEffect(() => {
    // Increment loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Organic loading rhythm
        const jump = Math.floor(Math.random() * 8) + 3;
        return Math.min(100, prev + jump);
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Cycle through system boot logs as progress updates
    const logIndex = Math.min(
      Math.floor((progress / 100) * BOOT_LOGS.length),
      BOOT_LOGS.length - 1
    );
    setCurrentLog(BOOT_LOGS[logIndex]);

    if (progress === 100) {
      // Gentle delayed transition to the OS after reach 100%
      const timeout = setTimeout(() => {
        setFadeAway(true);
        const exitTimeout = setTimeout(() => {
          onComplete();
        }, 800); // Wait for fade-out animation to complete
        return () => clearTimeout(exitTimeout);
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  return (
    <div
      id="leo-splash-screen"
      className={`
        fixed inset-0 z-50 flex flex-col items-center justify-center
        bg-[#020408] transition-all duration-1000 ease-in-out
        ${fadeAway ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'}
      `}
    >
      {/* Background cyber particles and abstract lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[30%] w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl animate-pulse" />
        <div className="absolute bottom-[20%] right-[30%] w-96 h-96 rounded-full bg-sky-500/5 blur-3xl animate-pulse duration-5000" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.1)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md px-6 text-center">
        {/* Futuristic Glowing Logo */}
        <div className="mb-8 scale-110">
          <LionLogo className="w-28 h-28" animated={true} />
        </div>

        {/* Brand Typography */}
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-sky-100 to-sky-300 font-sans" id="splash-title">
          TRACKER
        </h1>
        <p className="mt-2 text-xs font-medium tracking-[0.4em] text-sky-400/80 uppercase font-sans">
          Personal Productivity System
        </p>

        {/* System Startup Progress */}
        <div className="w-64 mt-16" id="splash-progress-container">
          {/* Progress bar glass container */}
          <div className="w-full h-[3px] bg-sky-950/40 rounded-full overflow-hidden border border-white/5 relative">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 shadow-[0_0_8px_#38bdf8] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between mt-3 px-1">
            <span className="font-mono text-[9px] text-sky-500/60 tracking-wider">
              SYS_BOOT_REVISION_2.6
            </span>
            <span className="font-mono text-[10px] text-sky-400 font-semibold tracking-widest">
              {progress}%
            </span>
          </div>
        </div>

        {/* Dynamic Boot Logs console */}
        <div className="mt-8 h-8 flex items-center justify-center" id="splash-boot-logs">
          <p className="font-mono text-[10px] text-cyan-400/70 tracking-widest uppercase animate-pulse">
            &gt; {currentLog}
          </p>
        </div>
      </div>

      {/* Cyber edge lines decorations */}
      <div className="absolute top-8 left-8 w-12 h-[1px] bg-sky-500/20" />
      <div className="absolute top-8 left-8 w-[1px] h-12 bg-sky-500/20" />
      <div className="absolute top-8 right-8 w-12 h-[1px] bg-sky-500/20" />
      <div className="absolute top-8 right-8 w-[1px] h-12 bg-sky-500/20" />
      <div className="absolute bottom-8 left-8 w-12 h-[1px] bg-sky-500/20" />
      <div className="absolute bottom-8 left-8 w-[1px] h-12 bg-sky-500/20" />
      <div className="absolute bottom-8 right-8 w-12 h-[1px] bg-sky-500/20" />
      <div className="absolute bottom-8 right-8 w-[1px] h-12 bg-sky-500/20" />
    </div>
  );
}
