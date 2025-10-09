import { AppFile } from '../types';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const EXPO_START_OUTPUT = `
Starting project at /home/builder/app
Starting Metro Bundler
› Metro waiting on exp://192.168.1.10:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a for Android emulator, or w for web browser
› Press r to reload the app, d to open developer tools
› Press Ctrl+C to exit
`;

export async function* executeCommand(
  command: string, 
  files: AppFile[]
): AsyncGenerator<string> {
  const [cmd, ...args] = command.trim().split(/\s+/);

  switch (cmd.toLowerCase()) {
    case 'npx':
      if (args[0] === 'expo' && args[1] === 'start') {
        for (const line of EXPO_START_OUTPUT.trim().split('\n')) {
          yield line;
          await wait(Math.random() * 300 + 100);
        }
        return;
      }
      yield `silo-shell: command not found: ${command}`;
      break;
    
    case 'ls':
      if (files.length === 0) {
        yield 'No files in the current project.';
        return;
      }
      yield files.map(f => {
          const size = f.content.length.toString().padStart(6, ' ');
          return `-rw-r--r-- 1 builder users ${size} ${new Date().toLocaleDateString()} ${f.path}`;
      }).join('\n');
      break;

    case 'cat':
        if (!args[0]) {
            yield 'Usage: cat [filename]';
            return;
        }
        const file = files.find(f => f.path === args[0]);
        if (file) {
            yield file.content;
        } else {
            yield `cat: ${args[0]}: No such file or directory`;
        }
        break;

    case 'pwd':
        yield '/home/builder/app';
        break;

    case 'whoami':
        yield 'builder';
        break;

    case 'date':
        yield new Date().toString();
        break;
        
    case 'echo':
      yield args.join(' ');
      break;

    case 'help':
      yield 'Available commands: ls, cat, pwd, whoami, date, echo, npx expo start, clear, help';
      break;

    case 'clear':
      // This is handled by the component, we just need to not show an error.
      return;

    default:
      yield `silo-shell: command not found: ${command}`;
  }
}
