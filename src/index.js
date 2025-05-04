import os from 'os';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';


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




function printCurrentDirectory() {
  console.log(`You are currently in ${currentDir}`);
}


rl.on('line', (input) => {
  const trimmedInput = input.trim();

  if (trimmedInput === '.exit') {
    exitProgram();
  } else {

    console.log('Invalid input'); 
    printCurrentDirectory();
    rl.prompt();
  }
});

function exitProgram() {
  console.log(`Thank you for using File Manager, ${username}, goodbye!`);
  process.exit(0);
}


rl.on('SIGINT', exitProgram);