const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const EXPO_START_OUTPUT = `
Starting project at /Users/silo/my-expo-app
Starting Metro Bundler
› Metro waiting on exp://192.168.1.10:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a for Android emulator, or w for web browser
› Press r to reload the app, d to open developer tools
› Press Ctrl+C to exit
`;

export async function executeCommand(command: string, filePaths: string[]): Promise<string> {
  const [cmd, ...args] = command.trim().split(/\s+/);

  switch (cmd.toLowerCase()) {
    case 'npx':
      if (args[0] === 'expo' && args[1] === 'start') {
        return EXPO_START_OUTPUT;
      }
      return `silo-shell: command not found: ${command}`;
    
    case 'ls':
      if (filePaths.length === 0) {
        return 'No files in the current project.';
      }
      return filePaths.join('\n');

    case 'echo':
      return args.join(' ');

    case 'help':
      return 'Available commands: ls, echo, npx expo start, clear, help';

    case 'clear':
      // This is handled by the component, but we return an empty string.
      return '';

    default:
      return `silo-shell: command not found: ${command}`;
  }
}
