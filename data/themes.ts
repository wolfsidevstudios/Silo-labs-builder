
import { Theme } from '../types';

export const THEMES: Theme[] = [
  {
    id: 'modern',
    name: 'Modern & Minimal',
    fontFamily: "'Inter', sans-serif",
    colors: {
      primary: '#6366F1', // indigo-500
      secondary: '#14B8A6', // teal-500
      background: '#111827', // gray-900
      text: '#F9FAFB', // gray-50
      accent: '#8B5CF6', // violet-500
    },
    navbar: {
      description: 'Clean, floating with a subtle background blur.',
      style: {
        backgroundColor: 'rgba(17, 24, 39, 0.5)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(55, 65, 81, 0.5)',
        padding: '0.75rem 1.5rem',
      },
      textStyle: { color: '#F9FAFB' },
    },
    button: {
      description: 'Solid primary color with rounded corners and a subtle shadow.',
      style: {
        backgroundColor: '#6366F1',
        color: '#ffffff',
        borderRadius: '0.5rem',
        padding: '0.6rem 1.2rem',
        border: 'none',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  {
    id: 'corporate',
    name: 'Corporate Clean',
    fontFamily: "'Roboto Mono', monospace",
    colors: {
      primary: '#0EA5E9', // sky-500
      secondary: '#64748B', // slate-500
      background: '#FFFFFF', // white
      text: '#1E293B', // slate-800
      accent: '#F59E0B', // amber-500
    },
    navbar: {
      description: 'Simple, solid background with a bottom border.',
      style: {
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '0.75rem 1.5rem',
      },
      textStyle: { color: '#1E293B' },
    },
    button: {
      description: 'Sharp corners, solid primary color, and uppercase text.',
      style: {
        backgroundColor: '#0EA5E9',
        color: '#ffffff',
        borderRadius: '0.25rem',
        padding: '0.6rem 1.2rem',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        border: 'none',
      },
    },
  },
  {
    id: 'neobrutalist',
    name: 'Neobrutalist',
    fontFamily: "'Lora', serif",
    colors: {
      primary: '#FDE047', // yellow-300
      secondary: '#A855F7', // purple-500
      background: '#F3F4F6', // gray-100
      text: '#1F2937', // gray-800
      accent: '#F43F5E', // rose-500
    },
    navbar: {
      description: 'Solid color with a thick, contrasting bottom border.',
      style: {
        backgroundColor: '#FFFFFF',
        borderBottom: '3px solid #1F2937',
        padding: '0.75rem 1.5rem',
      },
      textStyle: { color: '#1F2937', fontWeight: 'bold' },
    },
    button: {
      description: 'Solid background, sharp corners, and a thick, dark border creating a shadow effect.',
      style: {
        backgroundColor: '#FDE047',
        color: '#1F2937',
        borderRadius: '0.25rem',
        padding: '0.6rem 1.2rem',
        border: '2px solid #1F2937',
        boxShadow: '4px 4px 0 #1F2937',
        fontWeight: 'bold',
      },
    },
  },
];
