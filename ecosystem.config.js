module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    // First application
    {
      name: 'Brainstorm',
      script: 'build/bin/server.js',
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   *
   * Change the user, host and repo link
   * make sure the vps can do git clone (private repo, auth is necessary)
   */
  deploy: {
    production: {
      user: 'vpsuser',
      host: '127.0.0.1',
      ref: 'origin/master',
      repo: 'git@github.com:johndoe/brainstorm-resolver.git',
      path: '/home/johndoe',
      'pre-setup':
        'sudo curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash - && sudo apt-get install -y git nodejs && sudo npm install -g pm2 typescript yarn',
      'post-setup': 'ls -la',
      'post-deploy':
        'sudo yarn install && sudo yarn build && sudo pm2 startOrRestart ecosystem.config.js --env production'
    }
  }
}
