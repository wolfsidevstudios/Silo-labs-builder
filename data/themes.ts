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
  {
    id: 'sleek-dark',
    name: 'Sleek Dark',
    fontFamily: "'Inter', sans-serif",
    colors: {
      primary: '#22D3EE', // cyan-400
      secondary: '#A78BFA', // violet-400
      background: '#0F172A', // slate-900
      text: '#E2E8F0', // slate-200
      accent: '#38BDF8', // lightBlue-400
    },
    navbar: {
      description: 'Transparent background with a bottom glow effect.',
      style: {
        backgroundColor: 'transparent',
        borderImage: 'linear-gradient(to right, transparent, rgba(34, 211, 238, 0.5), transparent) 1',
        borderBottom: '1px solid',
        padding: '0.75rem 1.5rem',
      },
      textStyle: { color: '#E2E8F0' },
    },
    button: {
      description: 'Gradient background with rounded corners and a soft glow on hover.',
      style: {
        backgroundImage: 'linear-gradient(to right, #22D3EE, #A78BFA)',
        color: '#0F172A',
        borderRadius: '9999px',
        padding: '0.6rem 1.2rem',
        border: 'none',
        fontWeight: 'bold'
      },
    },
  },
   {
    id: 'vibrant-gradient',
    name: 'Vibrant Gradient',
    fontFamily: "'Inter', sans-serif",
    colors: {
      primary: '#F472B6', // pink-400
      secondary: '#FB923C', // orange-400
      background: '#1E1B4B', // indigo-950
      text: '#F0F9FF', // sky-50
      accent: '#FACC15', // yellow-400
    },
    navbar: {
      description: 'Solid dark with a vibrant gradient bottom border.',
      style: {
        backgroundColor: 'rgba(30, 27, 75, 0.7)',
        backdropFilter: 'blur(8px)',
        borderImage: 'linear-gradient(to right, #F472B6, #FB923C) 1',
        borderBottom: '2px solid',
        padding: '0.75rem 1.5rem',
      },
      textStyle: { color: '#F0F9FF' },
    },
    button: {
      description: 'Pill-shaped button with a bright, solid color and bold text.',
      style: {
        backgroundColor: '#F472B6',
        color: '#ffffff',
        borderRadius: '9999px',
        padding: '0.6rem 1.5rem',
        border: 'none',
        fontWeight: 'bold',
      },
    },
  },
  {
    id: 'earthy-tones',
    name: 'Earthy Tones',
    fontFamily: "'Lora', serif",
    colors: {
      primary: '#84CC16', // lime-500
      secondary: '#F97316', // orange-500
      background: '#FEFCE8', // yellow-50
      text: '#3F3F46', // zinc-700
      accent: '#10B981', // emerald-500
    },
    navbar: {
      description: 'Clean, light background with a subtle shadow.',
      style: {
        backgroundColor: '#FEFCE8',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        padding: '0.75rem 1.5rem',
      },
      textStyle: { color: '#3F3F46' },
    },
    button: {
      description: 'Soft-cornered button with a natural, solid color.',
      style: {
        backgroundColor: '#84CC16',
        color: '#FEFCE8',
        borderRadius: '0.5rem',
        padding: '0.6rem 1.2rem',
        border: 'none',
      },
    },
  },
  // --- HOLIDAY PACKS ---
  {
    id: 'holiday-winter',
    name: 'Winter Wonderland',
    fontFamily: "'Playfair Display', serif",
    colors: {
      primary: '#38BDF8', // lightBlue-400
      secondary: '#A5B4FC', // indigo-300
      background: '#F0F9FF', // sky-50
      text: '#075985', // sky-800
      accent: '#E0E7FF', // indigo-100
    },
    navbar: {
      description: 'Icy blue, semi-transparent with snowflake accents.',
      style: {
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(56, 189, 248, 0.3)',
        padding: '0.75rem 1.5rem',
      },
      textStyle: { color: '#075985', fontWeight: 'bold' },
    },
    button: {
      description: 'Light blue with a silver border and a frosty look.',
      style: {
        backgroundColor: '#38BDF8',
        color: '#ffffff',
        borderRadius: '0.5rem',
        padding: '0.6rem 1.2rem',
        border: '2px solid #A5B4FC',
        boxShadow: '0 0 10px rgba(165, 180, 252, 0.5)',
      },
    },
  },
  {
    id: 'holiday-christmas',
    name: 'Christmas Cheer',
    isPro: true,
    fontFamily: "'Mountains of Christmas', cursive",
    colors: {
      primary: '#DC2626', // red-600
      secondary: '#16A34A', // green-600
      background: '#FDFBF5', // antique-white
      text: '#44403C', // stone-700
      accent: '#FBBF24', // amber-400
    },
    navbar: {
      description: 'Festive green with gold text and holly accents.',
      style: {
        backgroundColor: '#16A34A',
        padding: '0.75rem 1.5rem',
      },
      textStyle: { color: '#FBBF24', fontSize: '1.25rem' },
    },
    button: {
      description: 'Candy-cane red with rounded corners and a festive glow.',
      style: {
        backgroundColor: '#DC2626',
        color: '#ffffff',
        borderRadius: '9999px',
        padding: '0.7rem 1.4rem',
        border: '2px solid #FBBF24',
        textTransform: 'uppercase'
      },
    },
  },
  {
    id: 'holiday-new-year',
    name: 'Elegant New Year',
    isPro: true,
    fontFamily: "'Great Vibes', cursive",
    colors: {
      primary: '#D4AF37', // gold
      secondary: '#C0C0C0', // silver
      background: '#1C1C1C', // near-black
      text: '#F5F5F5', // off-white
      accent: '#E5E4E2', // platinum
    },
    navbar: {
      description: 'Black, minimalist with elegant gold text.',
      style: {
        backgroundColor: '#1C1C1C',
        borderBottom: '2px solid #D4AF37',
        padding: '1rem 2rem',
      },
      textStyle: { color: '#D4AF37', fontSize: '1.5rem' },
    },
    button: {
      description: 'Shimmering gold gradient with sharp, elegant corners.',
      style: {
        backgroundImage: 'linear-gradient(45deg, #B8860B, #FFD700, #B8860B)',
        color: '#1C1C1C',
        borderRadius: '0.25rem',
        padding: '0.7rem 1.4rem',
        border: 'none',
        fontWeight: 'bold',
      },
    },
  },
];
