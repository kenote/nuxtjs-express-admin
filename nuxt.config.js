// buefy cause 'ReferenceError: HTMLElement is not defined'
// See https://github.com/buefy/buefy/issues/712
global.HTMLElement = typeof window === 'undefined' ? Object : window.HTMLElement
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
    // lib css
    'codemirror/lib/codemirror.css',
    // merge css
    'codemirror/addon/merge/merge.css',
    // theme css
    'codemirror/theme/paraiso-light.css',
    
    '~/assets/iconfont/iconfont.css',
    '~/assets/scss/common.scss',
  ],
  plugins: [
    { src: '~plugins/codemirror.js', ssr: false },
    '~/plugins/component',
    { src: '~/plugins/element-ui', ssr: true }
  ],
  loading: {
    color: 'rgb(238, 92, 73, .8)', 
    height: '3px'
  },
  router: {
    extendRoutes (routes, resolve) {
      routes.push({
        name: 'custom',
        path: '*',
        component: resolve(__dirname, 'components/error-page.vue')
      })
    }
  }
}