import React, { useState } from 'react';
import UserIcon from './icons/UserIcon';
import BriefcaseIcon from './icons/BriefcaseIcon';

interface OnboardingModalProps {
  isOpen: boolean;
  onFinish: (data: { name: string; accountType: 'individual' | 'business'; businessProfile?: any }) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onFinish }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [businessProfile, setBusinessProfile] = useState({
    businessName: '',
    logo: null as File | null,
    primaryColor: '#6366F1', // indigo-500
    secondaryColor: '#EC4899', // pink-500
    goals: '',
  });

  if (!isOpen) return null;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBusinessProfile(prev => ({ ...prev, logo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleFinishBusiness = () => {
    onFinish({ name, accountType: 'business', businessProfile });
  };
  
  const handleChooseIndividual = () => {
      onFinish({ name, accountType: 'individual' });
  };

  const renderStep = () => {
    switch (step) {
      case 1: // Name
        return (
          <>
            <h1 className="text-4xl font-bold text-white mb-4">Welcome to the AI Builder</h1>
            <p className="text-slate-400 mb-8">Let's get you set up. What should we call you?</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full max-w-sm p-3 bg-white/[0.05] border border-white/10 rounded-full text-center text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => setStep(2)}
              disabled={!name.trim()}
              className="mt-8 px-8 py-3 bg-white hover:bg-gray-200 text-black font-semibold rounded-full transition-all disabled:bg-gray-500 disabled:text-gray-800 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </>
        );
      case 2: // Account Type
        return (
          <>
            <h1 className="text-4xl font-bold text-white mb-4">How are you planning to use it?</h1>
            <p className="text-slate-400 mb-10">This will help us personalize your experience.</p>
            <div className="flex flex-col md:flex-row gap-8 w-full max-w-3xl">
              <div
                onClick={handleChooseIndividual}
                className="flex-1 p-8 bg-slate-800/50 border border-slate-700 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-indigo-500 hover:-translate-y-1"
              >
                <UserIcon className="w-12 h-12 text-indigo-400 mb-4" />
                <h2 className="text-2xl font-bold text-white">Individual</h2>
                <p className="text-slate-400 mt-2">For personal projects, experiments, and learning.</p>
              </div>
              <div
                onClick={() => setStep(3)}
                className="flex-1 p-8 bg-slate-800/50 border border-slate-700 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-indigo-500 hover:-translate-y-1"
              >
                <BriefcaseIcon className="w-12 h-12 text-indigo-400 mb-4" />
                <h2 className="text-2xl font-bold text-white">Business</h2>
                <p className="text-slate-400 mt-2">To build applications for your company or clients.</p>
              </div>
            </div>
          </>
        );
      case 3: // Business Details
        return (
            <>
                <h1 className="text-4xl font-bold text-white mb-4">Tell us about your business</h1>
                <p className="text-slate-400 mb-10">This information will help the AI create apps that match your brand.</p>
                <div className="w-full max-w-2xl space-y-6 text-left">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Business Name</label>
                        <input
                            type="text"
                            value={businessProfile.businessName}
                            onChange={(e) => setBusinessProfile(p => ({ ...p, businessName: e.target.value }))}
                            placeholder="Your Company LLC"
                            className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Logo</label>
                        <div className="flex items-center gap-4">
                            <label htmlFor="logo-upload" className="cursor-pointer px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors text-sm">
                                Upload Logo
                            </label>
                            <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                            {logoPreview && <img src={logoPreview} alt="Logo preview" className="w-10 h-10 rounded-md object-cover" />}
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Brand Colors</label>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <input type="color" value={businessProfile.primaryColor} onChange={(e) => setBusinessProfile(p => ({ ...p, primaryColor: e.target.value }))} className="w-8 h-8 rounded-md cursor-pointer bg-transparent border-none" />
                                <span className="text-slate-400 text-sm">Primary</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <input type="color" value={businessProfile.secondaryColor} onChange={(e) => setBusinessProfile(p => ({ ...p, secondaryColor: e.target.value }))} className="w-8 h-8 rounded-md cursor-pointer bg-transparent border-none" />
                                <span className="text-slate-400 text-sm">Secondary</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 mt-8">
                    <button
                        onClick={() => setStep(2)}
                        className="px-8 py-3 bg-slate-200 hover:bg-slate-300 text-black font-semibold rounded-full transition-colors"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleFinishBusiness}
                        className="px-8 py-3 bg-white hover:bg-gray-200 text-black font-semibold rounded-full transition-colors"
                    >
                        Finish Setup
                    </button>
                </div>
            </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg animate-fade-in">
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
        {renderStep()}
      </div>
       <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        input[type="color"] { -webkit-appearance: none; border: none; padding: 0; }
        input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
        input[type="color"]::-webkit-color-swatch { border: 1px solid #475569; border-radius: 0.375rem; }
      `}</style>
    </div>
  );
};

export default OnboardingModal;
