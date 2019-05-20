const path = require('path')
const fs = require('fs-extra')
const yaml = require('js-yaml')
const nunjucks = require('nunjucks')

const configFile = path.resolve(__dirname, 'deploy/deploy.config.yml')
const ignore = [
  // 忽略的目录
  'assets/**/*',
  'channels/**/*',
  'components/**/*',
  'data/**/*',
  'layouts/**/*',
  //'middleware/**/*',
  //'modules/**/*',
  'pages/**/*',
  //'plugins/**/*',
  'server/**/*',
  'store/**/*',
  'types/**/*',
  'uploadfile/**/*',
  'utils/**/*',
  // 忽略的模块目录
  'node_modules/**/*',
  // 忽略的文件
  '.gitgnore',
  '.git/**',
  'deploy.*',
  'backpack.config.js',
  'ecosystem.config.js',
  'nuxt.config.*',
  'tsconfig.*',
  'yarn*',
  'LICENSE',
  'README.md'
]

module.exports = parseConfig(configFile)

function parseConfig (file) {
  let yamlStr = ''
  try {
    yamlStr = fs.readFileSync(file, 'utf-8')
    yamlStr = nunjucks.renderString(yamlStr, { __dirname, ignore: `[${ignore}]` })
  } catch (error) {
    
  }
  return yaml.load(yamlStr) || {}
}