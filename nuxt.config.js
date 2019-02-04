module.exports = {
  head: {
    title: '后台管理',
    meta: [
      { charset: 'uft-8' },
      { 'http-equiv': 'X-UA-Compatible', content: 'IE=Edge' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  modules: [
    '~/modules/typescript'
  ],
  css: [
    'element-ui/lib/theme-chalk/index.css',
    '~/assets/scss/common.scss'
  ],
  plugins: [
    { src: '~/plugins/element-ui', ssr: true }
  ],
}