import fs from 'fs/promises';
import path from 'path';
import { state } from './state.js';

export async function handleNavigationCommand(command, args) {
  const cwd = state.currentDir;

  if (command === 'up') {
    const parent = path.dirname(cwd);
    if (parent !== cwd) state.currentDir = parent;
    return true;
  }

  if (command === 'cd') {
    const targetPath = path.isAbsolute(args[0])
      ? args[0]
      : path.join(cwd, args[0]);
    try {
      const stats = await fs.stat(targetPath);
      if (stats.isDirectory()) {
        state.currentDir = targetPath;
      } else {
        throw new Error();
      }
    } catch {
      console.log('Operation failed');
    }
    return true;
  }

  if (command === 'ls') {
    try {
      const items = await fs.readdir(cwd, { withFileTypes: true });
      const dirs = items.filter(i => i.isDirectory()).map(i => i.name).sort();
      const files = items.filter(i => i.isFile()).map(i => i.name).sort();

      console.table([
        ...dirs.map(name => ({ Name: name, Type: 'directory' })),
        ...files.map(name => ({ Name: name, Type: 'file' }))
      ]);
    } catch {
      console.log('Operation failed');
    }
    return true;
  }

  return false;
}
