import os from 'os';

export async function handleOsCommand(command, args) {
  if (command !== 'os') return false;

  switch (args[0]) {
    case '--EOL':
      console.log(JSON.stringify(os.EOL));
      break;
    case '--cpus':
      const cpus = os.cpus();
      console.log(`Total CPUs: ${cpus.length}`);
      cpus.forEach((cpu, idx) => {
        console.log(`CPU ${idx + 1}: ${cpu.model}, ${cpu.speed / 1000} GHz`);
      });
      break;
    case '--homedir':
      console.log(os.homedir());
      break;
    case '--username':
      console.log(os.userInfo().username);
      break;
    case '--architecture':
      console.log(os.arch());
      break;
    default:
      console.log('Invalid input');
  }

  return true;
}
