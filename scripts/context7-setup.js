#!/usr/bin/env node

/**
 * Context7 MCP Setup Script - HerbisVeritas V2
 * Initialise le serveur Context7 pour documentation TypeScript en temps réel
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Context7 MCP Setup - HerbisVeritas V2');
console.log('📋 Initialisation du serveur de documentation TypeScript...\n');

// Configuration du serveur Context7
const context7Server = spawn('npx', ['-y', '@upstash/context7-mcp', '--no-api-key'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    CONTEXT7_PROJECT_ROOT: process.cwd(),
    CONTEXT7_TYPESCRIPT_CONFIG: path.join(process.cwd(), 'tsconfig.json')
  }
});

context7Server.on('error', (error) => {
  console.error('❌ Erreur Context7 MCP:', error);
  process.exit(1);
});

context7Server.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Context7 MCP configuré avec succès');
  } else {
    console.error(`❌ Context7 MCP terminé avec code: ${code}`);
    process.exit(code);
  }
});

process.on('SIGINT', () => {
  console.log('\n⏸️  Arrêt du serveur Context7...');
  context7Server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  context7Server.kill('SIGTERM');
  process.exit(0);
});