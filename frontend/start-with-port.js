const { spawn } = require('child_process');
const net = require('net');

// Function to check if port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port);
  });
}

// Function to find available port
async function findAvailablePort(startPort) {
  let port = startPort;
  
  while (port < startPort + 10) {
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }
    console.log(`Port ${port} is busy, trying port ${port + 1}...`);
    port++;
  }
  
  throw new Error('Could not find available port');
}

// Start React app with available port
async function start() {
  try {
    const port = await findAvailablePort(3000);
    console.log(`Starting frontend on port ${port}...`);
    
    const env = { 
      ...process.env, 
      PORT: port.toString(),
      BROWSER: 'none',
      NODE_OPTIONS: '--max_old_space_size=4096'
    };
    
    const isWindows = process.platform === 'win32';
    const command = isWindows ? 'react-scripts.cmd' : 'react-scripts';
    
    const child = spawn(command, ['start'], {
      stdio: 'inherit',
      shell: true,
      env,
      windowsHide: false
    });
    
    child.on('error', (err) => {
      console.error('Failed to start:', err);
      process.exit(1);
    });
    
    child.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        console.error(`React scripts exited with code ${code}`);
      }
      process.exit(code || 0);
    });

    // Handle Ctrl+C
    process.on('SIGINT', () => {
      child.kill('SIGINT');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

start();
