// PM2 Configure
module.exports = {
  apps : [
    {
      name: 'nuxtjs-express-admin',
      script: './build/index.js',
      watch: true,
      max_memory_restart: '300M',
      interpreter_args: '--harmony',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}