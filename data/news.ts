import { NewsItem } from '../types';
import RocketIcon from '../components/icons/RocketIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import ZapIcon from '../components/icons/ZapIcon';
import DiamondIcon from '../components/icons/DiamondIcon';
import GitHubIcon from '../components/icons/GitHubIcon';
import NetlifyIcon from '../components/icons/NetlifyIcon';

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: '6',
    date: 'October 6, 2025',
    title: 'Deploy in One Click with Netlify',
    icon: NetlifyIcon,
    content:
      "Take your projects live! We've integrated with Netlify to allow for seamless one-click deployments. Connect your account in Settings, and you can deploy a new site or redeploy changes directly from the builder, complete with a live URL.",
  },
  {
    id: '5',
    date: 'October 3, 2025',
    title: 'Save Your Work to GitHub',
    icon: GitHubIcon,
    content:
      "You can now connect your GitHub account and save your projects directly to a repository. Create new repos, commit your initial app, and save subsequent changes all without leaving the builder. Find the new integration in the Settings page.",
  },
  {
    id: '4',
    date: 'September 30, 2025',
    title: 'Power Up: Gemini 2.5 Pro Now Available!',
    icon: DiamondIcon,
    content:
      "We're excited to announce the integration of Gemini 2.5 Pro! This advanced model is designed for more complex application logic, intricate UI, and larger-scale projects. You can now switch between Flash and Pro models in the Settings page to get the right balance of speed and power for your needs.",
  },
  {
    id: '3',
    date: 'September 28, 2025',
    title: 'Future Vision: Integrating More AI Models',
    icon: ZapIcon,
    content:
      "We're committed to providing the best AI experience. Once the app starts generating revenue, we plan to fully integrate next-generation AI models like Claude 4.5 and ChatGPT 5, giving you unparalleled power and flexibility in app creation.",
  },
  {
    id: '2',
    date: 'September 26, 2025',
    title: 'New Features: UI Themes & Custom Secrets',
    icon: SparklesIcon,
    content:
      'Supercharge your workflow with two powerful new features! UI Theme Templates let you guide the AI with pre-defined styles for stunning, consistent designs. Custom Secrets allow you to securely use API keys from other services in your generated apps.',
  },
  {
    id: '1',
    date: 'September 20, 2025',
    title: 'Initial Launch!',
    icon: RocketIcon,
    content:
      'Welcome to the AI React App Builder! We are thrilled to launch our platform that allows you to generate complete, multi-file React applications from a simple text prompt. Start building your dream apps today.',
  },
];