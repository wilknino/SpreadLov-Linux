// PM2 Ecosystem Configuration for SpreadLov
// This file configures PM2 process manager to run the SpreadLov application
// without repeatedly prompting for .env file updates

module.exports = {
  apps: [{
    name: 'spreadlov',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    
    // Environment variables
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    
    // Log configuration
    error_file: 'logs/error.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Auto restart configuration
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    
    // File watching - DISABLED to prevent .env update prompts
    watch: false,
    ignore_watch: [
      'node_modules',
      'logs',
      'uploads',
      '.git',
      '.env',              // Don't watch .env file
      '.env.*',            // Don't watch any .env variants
      'dist',
      'client'
    ],
    
    // PM2 will NOT prompt for updates when .env changes
    // To apply .env changes, manually restart: pm2 restart spreadlov
    
    // Memory management
    max_memory_restart: '500M',
    
    // Source maps support
    source_map_support: true,
    
    // Graceful shutdown
    kill_timeout: 5000,
    
    // Disable PM2 auto-update prompts
    pmx: false,
    
    // Additional PM2 settings
    instance_var: 'INSTANCE_ID',
    increment_var: 'PORT'
  }]
};
