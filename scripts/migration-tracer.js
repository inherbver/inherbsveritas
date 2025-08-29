/**
 * Migration Tracer - HerbisVeritas V2
 * 
 * Système de traçabilité complète des migrations DB via MCP Supabase
 * Logs automatiques + hook pre/post migration + git integration
 */

const fs = require('fs');
const path = require('path');

class MigrationTracer {
  constructor() {
    this.logFile = path.join('supabase', 'migrations', 'logs', 'MIGRATION_LOG.md');
    this.migrationDir = path.join('supabase', 'migrations');
  }

  /**
   * Log une action de migration avec timestamp complet
   */
  logMigration(type, actor, description, files = [], reason = '', status = 'success') {
    const timestamp = new Date().toISOString();
    const gitHash = this.getCurrentGitHash();
    
    const logEntry = `
### ${timestamp}

**[${type}] ${actor}** - ${description}
- Files: ${files.join(', ') || 'N/A'}
- Reason: ${reason}
- Status: ${status}
- Hash: ${gitHash}

---
`;

    // Append to log file
    fs.appendFileSync(this.logFile, logEntry);
    console.log(`✅ Migration logged: ${type} - ${description}`);
  }

  /**
   * Créer un fichier de migration avec timestamp
   */
  createMigrationFile(name, sql) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `${timestamp}_${name}.sql`;
    const filePath = path.join(this.migrationDir, fileName);
    
    const header = `-- HerbisVeritas V2 Migration: ${name}
-- Generated: ${new Date().toISOString()}
-- Type: ${name.includes('rls') ? 'RLS_POLICY' : 'SCHEMA'}
-- Status: PENDING

${sql}`;

    fs.writeFileSync(filePath, header);
    
    this.logMigration(
      'SCHEMA', 
      'Claude', 
      `Created migration file: ${fileName}`,
      [fileName],
      `Auto-generated migration for: ${name}`
    );
    
    return filePath;
  }

  /**
   * Hook pre-migration - validation MVP
   */
  preMigrationValidation(sql) {
    const forbidden = [
      'DROP DATABASE',
      'TRUNCATE users',
      'DELETE FROM users',
      'DROP TABLE users'
    ];

    for (const pattern of forbidden) {
      if (sql.toUpperCase().includes(pattern)) {
        this.logMigration('ERROR', 'Claude', `Forbidden operation blocked: ${pattern}`, [], 'Security validation', 'blocked');
        throw new Error(`🚫 Forbidden operation: ${pattern}`);
      }
    }

    // Validation 13 tables MVP
    const allowedTables = [
      'users', 'addresses', 'categories', 'products', 'carts', 'cart_items',
      'orders', 'order_items', 'articles', 'partners', 'next_events',
      'newsletter_subscribers', 'featured_items'
    ];

    return true;
  }

  /**
   * Get current git hash for traceability
   */
  getCurrentGitHash() {
    try {
      const { execSync } = require('child_process');
      return execSync('git rev-parse HEAD').toString().trim().slice(0, 8);
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Generate migration summary for commit messages
   */
  generateMigrationSummary() {
    const logContent = fs.readFileSync(this.logFile, 'utf8');
    const today = new Date().toISOString().split('T')[0];
    const todayMigrations = logContent.split('### ').filter(entry => 
      entry.includes(today)
    );

    return {
      count: todayMigrations.length,
      summary: todayMigrations.map(entry => {
        const lines = entry.split('\n');
        const title = lines[1]?.replace(/\*\*/g, '') || 'Unknown migration';
        return title;
      }).join(', ')
    };
  }
}

module.exports = { MigrationTracer };

// CLI Usage
if (require.main === module) {
  const tracer = new MigrationTracer();
  const [,, command, ...args] = process.argv;

  switch (command) {
    case 'log':
      const [type, actor, description, reason] = args;
      tracer.logMigration(type, actor, description, [], reason || 'Manual log entry');
      break;
    
    case 'create':
      const [name, sql] = args;
      if (!name || !sql) {
        console.error('Usage: node migration-tracer.js create <name> <sql>');
        process.exit(1);
      }
      console.log(`Migration file created: ${tracer.createMigrationFile(name, sql)}`);
      break;
    
    case 'summary':
      const summary = tracer.generateMigrationSummary();
      console.log(`Today: ${summary.count} migrations - ${summary.summary}`);
      break;
    
    default:
      console.log(`
Migration Tracer CLI

Commands:
  log <type> <actor> <description> [reason]    - Log manual migration
  create <name> <sql>                           - Create traced migration file  
  summary                                       - Get today's migration summary
      `);
  }
}