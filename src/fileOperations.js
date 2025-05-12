import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { state } from './state.js';

export async function handleFileCommand(command, args) {
  const cwd = state.currentDir;

  try {
    switch (command) {
      case 'cat':
        const content = fsSync.createReadStream(path.resolve(cwd, args[0]), 'utf-8');
        content.pipe(process.stdout);
        return true;

      case 'add':
        await fs.writeFile(path.join(cwd, args[0]), '');
        return true;

      case 'mkdir':
        await fs.mkdir(path.join(cwd, args[0]));
        return true;

      case 'rn':
        await fs.rename(
          path.join(cwd, args[0]),
          path.join(cwd, args[1])
        );
        return true;

      case 'cp':
        await fs.copyFile(
          path.join(cwd, args[0]),
          path.join(cwd, args[1])
        );
        return true;

      case 'mv':
        await fs.copyFile(
          path.join(cwd, args[0]),
          path.join(cwd, args[1])
        );
        await fs.unlink(path.join(cwd, args[0]));
        return true;

      case 'rm':
        await fs.unlink(path.join(cwd, args[0]));
        return true;
    }
  } catch {
    console.log('Operation failed');
  }

  return false;
}
