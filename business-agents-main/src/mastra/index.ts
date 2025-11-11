
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { weatherWorkflow } from './workflows/weather-workflow';
import { weatherAgent } from './agents/weather-agent';
import { bvaAgent } from './agents/bva-agent';
// Removed ensureDownloadsDirectory - no longer using file downloads

// Log all environment variables at service startup
console.log('\n' + '='.repeat(80));
console.log('\x1b[1m🔧 ENVIRONMENT VARIABLES LOADED:\x1b[0m');
console.log('='.repeat(80));

const envVars = Object.keys(process.env).sort();
if (envVars.length === 0) {
  console.log('\x1b[1m⚠️  No environment variables found\x1b[0m');
} else {
  envVars.forEach(key => {
    const value = process.env[key];
    console.log(`\x1b[1m${key}:\x1b[0m ${value}`);
  });
}

console.log('='.repeat(80) + '\n');

// Removed downloads directory setup - no longer using file downloads

// Get the effective LibSQL database path
const mastraDbPath = process.env.MASTRA_DB_PATH || process.env.MASTRA_DEFAULT_STORAGE_URL || 'file:.mastra/mastra.db';
console.log(`\x1b[1m💾 Effective LibSQL Database Path:\x1b[0m ${mastraDbPath}`);

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { weatherAgent, bvaAgent },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: mastraDbPath,
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
