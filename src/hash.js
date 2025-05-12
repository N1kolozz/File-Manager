import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import { state } from './state.js';

export async function handleHashCommand(command, args) {
  if (command !== 'hash') return false;

  const filePath = path.join(state.currentDir, args[0]);

  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const input = fs.createReadStream(filePath);

    input.on('error', () => {
      console.log('Operation failed');
      resolve(true);
    });

    input.on('data', chunk => hash.update(chunk));
    input.on('end', () => {
      console.log(hash.digest('hex'));
      resolve(true);
    });
  });
}
