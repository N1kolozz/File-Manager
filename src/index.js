import os from 'os';
import path from 'path';
import fs from 'fs/promises';
import readline from 'readline';


const args = process.argv.slice(2);
const usernameArg = args.find(arg => arg.startsWith('--username='));
const username = usernameArg ? usernameArg.split('=')[1] : 'Anonymous';


const homeDir = os.homedir();
let currentDir = homeDir;


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});


console.log(`Welcome to the File Manager, ${username}!`);
printCurrentDirectory();
rl.prompt();


rl.on('line', async (input) => {
  const trimmedInput = input.trim();
  const [command, ...args] = trimmedInput.split(' ');

  try {
    switch (command) {
      case 'up':
        handleUp();
        break;
      case 'cd':
        await handleCd(args[0]);
        break;
      case 'ls':
        await handleLs();
        break;
      case '.exit':
        exitProgram();
        return;
      default:
        console.log('Invalid input');
    }
  } catch {
    console.log('Operation failed');
  }

  printCurrentDirectory();
  rl.prompt();
});


rl.on('SIGINT', exitProgram);


function printCurrentDirectory() {
  console.log(`You are currently in ${currentDir}`);
}


function exitProgram() {
  console.log(`Thank you for using File Manager, ${username}, goodbye!`);
  process.exit(0);
}


function handleUp() {
  const parentDir = path.dirname(currentDir);
  const root = path.parse(currentDir).root;

  if (currentDir !== root) {
    currentDir = parentDir;
  }
}


async function handleCd(targetPath) {
  const fullPath = path.isAbsolute(targetPath)
    ? targetPath
    : path.join(currentDir, targetPath);

  try {
    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      currentDir = fullPath;
    } else {
      console.log('Operation failed');
    }
  } catch {
    console.log('Operation failed');
  }
}


async function handleLs() {
  try {
    const files = await fs.readdir(currentDir, { withFileTypes: true });

    const folders = files
      .filter(dirent => dirent.isDirectory())
      .map(dirent => ({ Name: dirent.name, Type: 'directory' }));

    const regularFiles = files
      .filter(dirent => dirent.isFile())
      .map(dirent => ({ Name: dirent.name, Type: 'file' }));

    const result = [...folders, ...regularFiles].sort((a, b) =>
      a.Name.localeCompare(b.Name)
    );

    console.table(result);
  } catch {
    console.log('Operation failed');
  }
}