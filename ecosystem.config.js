module.exports = {
  apps: [{
    name: 'spreadlov',
    script: './dist/index.js',
    env_file: '.env',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '500M',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    autorestart: true,
    watch: false
  }]
};
