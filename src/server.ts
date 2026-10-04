import { createApp } from './app.js';
import { readConfig } from './config.js';
const config = readConfig();
const server = createApp(config).listen(config.PORT, '0.0.0.0', () => console.info(`Third Eye listening on port ${config.PORT}`));
server.requestTimeout = config.ANALYSIS_TIMEOUT_MS + 20000;
server.headersTimeout = 15000;
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), config.ANALYSIS_TIMEOUT_MS + 10000).unref();
});
