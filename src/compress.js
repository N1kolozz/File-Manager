import fs from 'fs';
import path from 'path';
import { createBrotliCompress, createBrotliDecompress } from 'zlib';
import { state } from './state.js';

export async function handleCompressCommand(command, args) {
  const cwd = state.currentDir;

  const [src, dest] = args;
  const fullSrc = path.join(cwd, src);
  const fullDest = path.join(cwd, dest);

  if (command === 'compress') {
    const input = fs.createReadStream(fullSrc);
    const output = fs.createWriteStream(fullDest);
    const brotli = createBrotliCompress();
    input.pipe(brotli).pipe(output);
    return true;
  }

  if (command === 'decompress') {
    const input = fs.createReadStream(fullSrc);
    const output = fs.createWriteStream(fullDest);
    const brotli = createBrotliDecompress();
    input.pipe(brotli).pipe(output);
    return true;
  }

  return false;
}
