import { startMetricsServer } from './utils/metricsServer';

// Loaded by instrumentation.ts only in the Node.js runtime (prom-client and node:http do not exist on the Edge runtime).
startMetricsServer();
