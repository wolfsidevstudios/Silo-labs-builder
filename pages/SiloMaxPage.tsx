import React from 'react';
import BotIcon from '../components/icons/BotIcon';
import EyeIcon from '../components/icons/EyeIcon';
import AccessibilityIcon from '../components/icons/AccessibilityIcon';
import BugIcon from '../components/icons/BugIcon';

const features = [
  {
    icon: BotIcon,
    title: 'Autonomous Navigation',
    description: 'Silo MAX intelligently explores your app, mimicking real user journeys to uncover hidden issues before your customers do.',
  },
  {
    icon: EyeIcon,
    title: 'Visual Anomaly Detection',
    description: 'Automatically detects visual bugs, style inconsistencies, and responsive layout problems across all devices and browsers.',
  },
  {
    icon: AccessibilityIcon,
    title: 'Automated Accessibility Audits',
    description: 'Continuously scans for WCAG compliance issues, ensuring your application is usable and accessible for everyone.',
  },
  {
    icon: BugIcon,
    title: 'Smart Bug Reporting',
    description: 'Generates detailed, actionable bug reports with console logs, network requests, and exact steps for reproduction.',
  },
];


const SiloMaxPage: React.FC = () => {
  return (
    <div className="min-h-screen w-screen bg-black flex flex-col items-center p-4 text-center overflow-auto relative selection:bg-indigo-500 selection:text-white">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 animate-pan-background"></div>
      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,black)]"></div>
      
      <main className="relative z-10 flex flex-col items-center pt-20 md:pt-24 animate-fade-in-up">
        <h1 
          className="text-8xl md:text-9xl font-['Poller_One'] bg-gradient-to-r from-slate-200 via-white to-slate-400 text-transparent bg-clip-text"
          style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.2)' }}
        >
          SILO MAX
        </h1>
        <h2 className="mt-4 text-3xl font-bold tracking-[0.3em] text-indigo-400 animate-pulse">
          COMING SOON
        </h2>
        <p className="mt-8 max-w-2xl text-lg text-slate-300">
          An advanced AI agent that can see, understand, and navigate your web applications to perform end-to-end testing, identify bugs, and ensure flawless user experiences.
        </p>

        <div className="mt-20 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
                <div 
                    key={feature.title}
                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-left flex items-start gap-6 shadow-2xl shadow-black/20 animate-fade-in-up"
                    style={{ animationDelay: `${200 + index * 100}ms` }}
                >
                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-900/50 border border-indigo-500/30 rounded-lg flex items-center justify-center">
                        <feature.icon className="w-7 h-7 text-indigo-300" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                        <p className="mt-2 text-slate-400">{feature.description}</p>
                    </div>
                </div>
            ))}
        </div>
      </main>

      <style>{`
        body {
          --grid-size: 50px;
          --grid-color: rgba(79, 70, 229, 0.3); /* indigo-700 with opacity */
        }
        .bg-grid-pattern {
          background-image:
            linear-gradient(to right, var(--grid-color) 0.5px, transparent 0.5px),
            linear-gradient(to bottom, var(--grid-color) 0.5px, transparent 0.5px);
          background-size: var(--grid-size) var(--grid-size);
        }
        @keyframes pan-background {
          from { background-position: 0 0; }
          to { background-position: var(--grid-size) var(--grid-size); }
        }
        .animate-pan-background {
          animation: pan-background 10s linear infinite;
        }
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { 
            animation: fade-in-up 0.8s ease-out forwards;
            opacity: 0;
            animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
};

export default SiloMaxPage;
