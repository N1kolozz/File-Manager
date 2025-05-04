import os from 'os';
import path from 'path';

export const state = {
  currentDir: os.homedir()
};

export function printCurrentDir() {
  console.log(`You are currently in ${state.currentDir}`);
}
