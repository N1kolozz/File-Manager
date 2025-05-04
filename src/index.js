import os from 'os';
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
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
      case 'cat':
        await handleCat(args[0]);
        break;
      case 'add':
        await handleAdd(args[0]);
        break;
      case 'rm':
        await handleRm(args[0]);
        break;
      case 'rn':
        await handleRename(args[0], args[1]);
        break;
      case 'cp':
        await handleCopy(args[0], args[1]);
        break;
      case 'mv':
        await handleMove(args[0], args[1]);
        break;
      case 'mkdir':
        await handleMkdir(args[0]);
        break;
      case 'os':
        await handleOs(args[0]);
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

async function handleCat(filePath) {
  const fullPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(currentDir, filePath);

  const readable = fsSync.createReadStream(fullPath, 'utf-8');

  readable.on('data', chunk => {
    process.stdout.write(chunk);
  });

  readable.on('error', () => {
    console.log('Operation failed');
  });

  return new Promise(resolve => {
    readable.on('end', resolve);
  });
}

async function handleAdd(filename) {
  if (!filename) {
    console.log('Invalid input');
    return;
  }

  const fullPath = path.join(currentDir, filename);

  try {
    await fs.writeFile(fullPath, '');
  } catch {
    console.log('Operation failed');
  }
}

async function handleRm(filePath) {
  const fullPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(currentDir, filePath);

  try {
    await fs.unlink(fullPath);
  } catch {
    console.log('Operation failed');
  }
}

async function handleRename(oldPath, newName) {
  if (!oldPath || !newName) {
    console.log('Invalid input');
    return;
  }

  const fullOldPath = path.isAbsolute(oldPath)
    ? oldPath
    : path.join(currentDir, oldPath);

  const newFullPath = path.join(path.dirname(fullOldPath), newName);

  try {
    await fs.rename(fullOldPath, newFullPath);
  } catch {
    console.log('Operation failed');
  }
}

async function handleCopy(srcPath, destDir) {
  if (!srcPath || !destDir) {
    console.log('Invalid input');
    return;
  }

  const fullSrcPath = path.isAbsolute(srcPath)
    ? srcPath
    : path.join(currentDir, srcPath);

  const fullDestDir = path.isAbsolute(destDir)
    ? destDir
    : path.join(currentDir, destDir);

  const fileName = path.basename(fullSrcPath);
  const destFilePath = path.join(fullDestDir, fileName);

  try {
    await fs.access(fullSrcPath);
    await fs.access(fullDestDir);

    const readable = fsSync.createReadStream(fullSrcPath);
    const writable = fsSync.createWriteStream(destFilePath);

    readable.pipe(writable);

    return new Promise((resolve, reject) => {
      readable.on('error', () => {
        console.log('Operation failed');
        reject();
      });
      writable.on('finish', resolve);
    });
  } catch {
    console.log('Operation failed');
  }
}

async function handleMove(srcPath, destDir) {
  await handleCopy(srcPath, destDir);

  const fullSrcPath = path.isAbsolute(srcPath)
    ? srcPath
    : path.join(currentDir, srcPath);

  try {
    await fs.unlink(fullSrcPath);
  } catch {
    console.log('Operation failed');
  }
}

async function handleMkdir(dirName) {
  if (!dirName) {
    console.log('Invalid input');
    return;
  }

  const fullPath = path.join(currentDir, dirName);

  try {
    await fs.mkdir(fullPath);
  } catch {
    console.log('Operation failed');
  }
}

async function handleOs(option) {
  switch (option) {
    case '--EOL':
      console.log(JSON.stringify(os.EOL));
      break;
    case '--cpus': {
      const cpus = os.cpus();
      console.log(`Total CPUs: ${cpus.length}`);
      cpus.forEach((cpu, index) => {
        console.log(
          `CPU ${index + 1}: ${cpu.model}, ${Math.round(cpu.speed / 100) / 10} GHz`
        );
      });
      break;
    }
    case '--homedir':
      console.log(os.homedir());
      break;
    case '--username':
      console.log(os.userInfo().username);
      break;
    case '--architecture':
      console.log(process.arch);
      break;
    default:
      console.log('Invalid input');
  }
}