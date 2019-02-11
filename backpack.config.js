
module.exports = {
  webpack: (config, options, webpack) => {
    
    config.entry = {
      index: './server/index.ts',
      task: './server/task.ts'
    }

    config.resolve = {
      extensions: ['.ts', '.js', '.json']
    }

    config.module.rules.push({
      test: /\.ts$/,
      loader: 'awesome-typescript-loader'
    })

    return config
  }
}