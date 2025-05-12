import os from 'os';
import readline from 'readline';
import { handleNavigationCommand } from './navigation.js';
import { handleFileCommand } from './fileOperations.js';
import { handleOsCommand } from './osInfo.js';
import { handleHashCommand } from './hash.js';
import { handleCompressCommand } from './compress.js';
import { state, printCurrentDir } from './state.js';

const username = process.argv.find(arg => arg.startsWith('--username='))?.split('=')[1] || 'Anonymous';
console.log(`Welcome to the File Manager, ${username}!`);
printCurrentDir();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});

rl.prompt();

rl.on('line', async (line) => {
  const [command, ...args] = line.trim().split(' ');

  try {
    if (command === '.exit') {
      exitProgram();
      return;
    }

    const handlers = [
      handleNavigationCommand,
      handleFileCommand,
      handleOsCommand,
      handleHashCommand,
      handleCompressCommand
    ];

    const handled = await Promise.any(
      handlers.map(handler => handler(command, args))
    ).catch(() => false);

    if (!handled) console.log('Invalid input');
  } catch {
    console.log('Operation failed');
  }

  printCurrentDir();
  rl.prompt();
});

rl.on('SIGINT', exitProgram);

function exitProgram() {
  console.log(`Thank you for using File Manager, ${username}, goodbye!`);
  process.exit();
}
