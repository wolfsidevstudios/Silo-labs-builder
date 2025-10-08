import React from 'react';
import { MaxReport, MaxIssue } from '../types';
import AutoFixIcon from './icons/AutoFixIcon';
import CheckIcon from './icons/CheckIcon';

interface MaxReportCardProps {
  report: MaxReport;
  onAutoFix: (issues: MaxIssue[]) => void;
}

const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
};

const getIssueIcon = (type: MaxIssue['type']) => {
    switch(type) {
        case 'UI/UX': return '🎨';
        case 'Accessibility': return '♿';
        case 'Bug': return '🐞';
        case 'Performance': return '⚡️';
        case 'Best Practice': return '📘';
        default: return '➡️';
    }
};

const MaxReportCard: React.FC<MaxReportCardProps> = ({ report, onAutoFix }) => {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-4 sm:p-6 rounded-xl w-full max-w-xl animate-fade-in-up shadow-2xl shadow-black/20">
        <div className="flex items-start gap-4 sm:gap-6">
            <div className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 ${getScoreColor(report.score).replace('text-', 'border-')} flex flex-col items-center justify-center bg-slate-800`}>
                <span className={`font-bold text-3xl sm:text-4xl ${getScoreColor(report.score)}`}>{report.score}</span>
                <span className="text-xs text-slate-400">SCORE</span>
            </div>
            <div className="flex-grow">
                <p className="font-bold text-sm mb-2 text-indigo-300">MAX ANALYSIS COMPLETE</p>
                <p className="text-slate-300">{report.summary}</p>
            </div>
        </div>
        
        {report.isPerfect ? (
            <div className="mt-6 p-4 bg-green-900/50 border border-green-700 rounded-lg flex items-center justify-center gap-3 text-center">
                <CheckIcon className="w-6 h-6 text-green-400"/>
                <p className="font-semibold text-green-300">Your app is ready to go!</p>
            </div>
        ) : (
            <>
                <div className="mt-6 space-y-3">
                    {report.issues.map((issue, index) => (
                        <div key={index} className="bg-black/20 border border-white/10 rounded-md p-3 text-sm">
                            <p className="font-semibold text-slate-300 mb-1">
                                <span className="mr-2">{getIssueIcon(issue.type)}</span>
                                {issue.type} Issue
                            </p>
                            <p className="text-slate-400">{issue.description}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-6 text-center">
                    <button 
                        onClick={() => onAutoFix(report.issues)}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full transition-colors transform hover:scale-105"
                    >
                        <AutoFixIcon className="w-5 h-5"/>
                        Auto Fix All Issues
                    </button>
                </div>
            </>
        )}
    </div>
  );
};

export default MaxReportCard;