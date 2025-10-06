import { NewsItem } from '../types';
import RocketIcon from '../components/icons/RocketIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import KeyIcon from '../components/icons/KeyIcon';
import ZapIcon from '../components/icons/ZapIcon';

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: '3',
    date: 'October 28, 2023',
    title: 'Future Vision: Integrating More AI Models',
    icon: ZapIcon,
    content:
      "We're committed to providing the best AI experience. Once the app starts generating revenue, we plan to fully integrate next-generation AI models like Claude 4.5 and ChatGPT 5, giving you unparalleled power and flexibility in app creation.",
  },
  {
    id: '2',
    date: 'October 26, 2023',
    title: 'New Features: UI Themes & Custom Secrets',
    icon: SparklesIcon,
    content:
      'Supercharge your workflow with two powerful new features! UI Theme Templates let you guide the AI with pre-defined styles for stunning, consistent designs. Custom Secrets allow you to securely use API keys from other services in your generated apps.',
  },
  {
    id: '1',
    date: 'October 20, 2023',
    title: 'Initial Launch!',
    icon: RocketIcon,
    content:
      'Welcome to the AI React App Builder! We are thrilled to launch our platform that allows you to generate complete, multi-file React applications from a simple text prompt. Start building your dream apps today.',
  },
];
