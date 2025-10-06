import React from 'react';

interface UserGreetingProps {
  name: string;
}

const UserGreeting: React.FC<UserGreetingProps> = ({ name }) => {
  return (
    <div className="fixed top-4 right-4 z-50 bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-fade-in-down">
      <span>
        Hello, <span className="font-bold text-indigo-400">{name}</span>! Ready to start building?
      </span>
      <style>{`
          @keyframes fade-in-down {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-down { animation: fade-in-down 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default UserGreeting;