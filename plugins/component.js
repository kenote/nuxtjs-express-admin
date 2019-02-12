import Vue from 'vue'
import Page from '~/components/page.vue'
import ErrorPage from '~/components/error-page.vue'

const createComponent = () => {
  Vue.component('page', Page)
  Vue.component('error-page', ErrorPage)
}

export default createComponent