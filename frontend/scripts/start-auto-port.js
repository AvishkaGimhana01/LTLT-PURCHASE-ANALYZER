// This script automatically finds an available port and starts the React dev server
process.env.NODE_ENV = 'development';
process.env.BABEL_ENV = 'development';

// Makes the script crash on unhandled rejections instead of silently ignoring them
process.on('unhandledRejection', err => {
  throw err;
});

const fs = require('fs');
const net = require('net');
const chalk = require('react-dev-utils/chalk');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const clearConsole = require('react-dev-utils/clearConsole');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const {
  createCompiler,
  prepareProxy,
  prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils');
const paths = require('react-scripts/config/paths');
const configFactory = require('react-scripts/config/webpack.config');
const createDevServerConfig = require('react-scripts/config/webpackDevServer.config');

const useYarn = fs.existsSync(paths.yarnLockFile);
const isInteractive = process.stdout.isTTY;

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1);
}

// Custom port finder that automatically selects next available port
function findAvailablePort(startPort) {
  return new Promise((resolve) => {
    const testPort = (port) => {
      const server = net.createServer();
      
      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(chalk.yellow(`Port ${port} is busy, trying port ${port + 1}...`));
          testPort(port + 1);
        } else {
          resolve(port);
        }
      });
      
      server.once('listening', () => {
        server.close();
        resolve(port);
      });
      
      server.listen(port);
    };
    
    testPort(startPort);
  });
}

// Tools like Cloud9 rely on this
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

if (process.env.HOST) {
  console.log(
    chalk.cyan(
      `Attempting to bind to HOST environment variable: ${chalk.yellow(
        chalk.bold(process.env.HOST)
      )}`
    )
  );
  console.log(
    `If this was unintentional, check that you haven't mistakenly set it in your shell.`
  );
  console.log(
    `Learn more here: ${chalk.yellow('https://cra.link/advanced-config')}`
  );
  console.log();
}

// We require that you explicitly set browsers and do not fall back to browserslist defaults
const { checkBrowsers } = require('react-dev-utils/browsersHelper');
checkBrowsers(paths.appPath, isInteractive)
  .then(() => {
    // Automatically find next available port without prompting
    return findAvailablePort(DEFAULT_PORT);
  })
  .then(port => {
    if (port == null) {
      // We have not found a port
      return;
    }

    console.log(chalk.cyan(`Starting server on port ${port}...\n`));
    console.log(chalk.yellow('⏳ Compiling React app... This may take 10-20 seconds on first run.\n'));

    const config = configFactory('development');
    const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
    const appName = require(paths.appPackageJson).name;
    const useTypeScript = fs.existsSync(paths.appTsConfig);
    const urls = prepareUrls(
      protocol,
      HOST,
      port,
      paths.publicUrlOrPath.slice(0, -1)
    );

    const compiler = createCompiler({
      appName,
      config,
      urls,
      useYarn,
      useTypeScript,
      webpack,
    });

    const proxySetting = require(paths.appPackageJson).proxy;
    const proxyConfig = prepareProxy(
      proxySetting,
      paths.appPublic,
      paths.publicUrlOrPath
    );

    const serverConfig = createDevServerConfig(
      proxyConfig,
      urls.lanUrlForConfig
    );
    const devServer = new WebpackDevServer(compiler, serverConfig);

    devServer.listen(port, HOST, err => {
      if (err) {
        return console.log(err);
      }
      if (isInteractive) {
        clearConsole();
      }

      console.log(chalk.cyan('Starting the development server...\n'));
      
      // Open browser automatically after a short delay
      setTimeout(() => {
        const openBrowser = require('react-dev-utils/openBrowser');
        openBrowser(urls.localUrlForBrowser);
      }, 1000);
    });

    ['SIGINT', 'SIGTERM'].forEach(function (sig) {
      process.on(sig, function () {
        devServer.close();
        process.exit();
      });
    });

    if (process.env.CI !== 'true') {
      // Gracefully exit when stdin ends
      process.stdin.on('end', function () {
        devServer.close();
        process.exit();
      });
    }
  })
  .catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });
